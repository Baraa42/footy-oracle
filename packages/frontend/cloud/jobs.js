/**
 * Add ETH Account
 */
Moralis.Cloud.job("polygonAddAccount", async (request) => {
  const { params, headers, log, message } = request;
  try {
    await addAccount();
    message("Account added!");
  } catch (e) {
    message("Error occurred!");
    log.error(e.toString());
  }
});

/**
 * Call requestResult on smart contract 3 hours after a event started
 * This is scheduled inside moralis
 */
Moralis.Cloud.job("polygonRequestResult", async (request) => {
  const { params, headers, log, message } = request;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const futureTimestamp = currentTimestamp + 3 * 60 * 60;

  const eventQuery = new Moralis.Query(Event);
  eventQuery.notEqualTo("polygonContract", "");
  eventQuery.notEqualTo("completed", true);
  eventQuery.lessThan("start", futureTimestamp);
  eventQuery.ascending("start");
  const events = await eventQuery.find();

  let updated = 0;
  for await (eventItem of events) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const contract = new web3.eth.Contract(JSON.parse(abi), eventItem.get("polygonContract"));
      const gas = await contract.methods.requestResult().estimateGas({ from: account });
      const result = await contract.methods.requestResult().send({
        from: account,
        gasPrice: gasPrice * 1.2,
        gas: gas * 2,
      });
      eventItem.set("completed", true);
      await eventItem.save();
      updated++;
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  log.info("Iteration " + counter + " after match events updated: " + updated);
  message("After Match Events found: " + events.length);
  counter++;
});

/**
 * Deploy contract for 10 events without contracts
 */
Moralis.Cloud.job("polygonCreateContracts", async (request) => {
  const { params, headers, log, message } = request;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const eventQuery = new Moralis.Query(Event);
  eventQuery.greaterThanOrEqualTo("start", currentTimestamp);
  eventQuery.equalTo("polygonContract", "");
  eventQuery.ascending("start");
  const events = await eventQuery.find();

  let updated = 0;
  for await (eventItem of events) {
    try {
      const contract = new web3.eth.Contract(JSON.parse(abi));
      // Function Parameter
      const payload = {
        data: bytecode,
        arguments: [String(eventItem.get("apiId"))],
      };

      const gas = await contract.deploy(payload).estimateGas();
      const gasPrice = await web3.eth.getGasPrice();

      // Deploy Parameter
      const parameter = {
        from: account,
        gas: gas * 2,
        gasPrice: gasPrice * 1.2,
      };

      log.info(JSON.stringify(parameter));

      const response = await contract.deploy(payload).send(parameter);
      eventItem.set("polygonContract", response.options.address);
      await eventItem.save();
      await sendLink(response.options.address);
      log.info("Contract deployed for: " + response.options.address + " event:" + eventItem.get("apiId"));
      updated++;

      if (updated == 10) {
        break;
      }

      await new Promise((r) => setTimeout(r, 10000));
    } catch (err) {
      log.error(err.toString());
      message("Error occurred!");
    }
  }
  message("Contract deployed: " + updated);
});

/**
 * Get teams from active leagues from external api and save in database
 */
Moralis.Cloud.job("syncTeams", async (request) => {
  const { log, message } = request;
  let saved = 0;
  try {
    const config = await Moralis.Config.get({ useMasterKey: true });
    const apiSportsSoccerKey = config.get("api_sports_soccer_key");

    const leagueQuery = new Moralis.Query(League);
    leagueQuery.equalTo("isActive", true);
    const leagueResults = await leagueQuery.find();

    if (leagueResults) {
      log.info(leagueResults.length);
    }

    for await (league of leagueResults) {
      const { data } = await Moralis.Cloud.httpRequest({
        url: "https://v3.football.api-sports.io/teams",
        headers: {
          "x-apisports-key": apiSportsSoccerKey,
        },
        params: {
          league: league.get("apiId"),
          season: league.get("season"),
        },
      });

      if (data.response.length != 0) {
        for await (item of data.response) {
          const query = new Moralis.Query(Team);
          query.equalTo("apiId", Number(item["team"].id));
          const results = await query.find();

          if (results.length == 0) {
            const countryQuery = new Moralis.Query(Country);
            countryQuery.equalTo("name", item["team"].country);
            const country = await countryQuery.first();

            if (country) {
              await createTeam(item["team"].id, item["team"].name, item["team"].national, item["team"].logo, country);
              saved++;
            }
          }
        }
      } else if (data.errors.length != 0) {
        message(JSON.stringify(data.errors));
      } else {
        message("Response not parsable");
      }
    }
  } catch (e) {
    message("Error occurred!");
    log.error(e.toString());
  }
  message("Teams synced: " + saved);
  log.info("Teams synced: " + saved);
});

/**
 * Get pre events from external api and save in database
 */
Moralis.Cloud.job("syncPreEvents", async (request) => {
  const { log, message } = request;

  const config = await Moralis.Config.get({ useMasterKey: true });
  const apiSportsSoccerKey = config.get("api_sports_soccer_key");

  const leagueQuery = new Moralis.Query(League);
  leagueQuery.equalTo("isActive", true);
  const leagueResults = await leagueQuery.find();

  let saved = 0;

  for await (league of leagueResults) {
    try {
      const { data } = await Moralis.Cloud.httpRequest({
        url: "https://v3.football.api-sports.io/fixtures",
        headers: {
          "x-apisports-key": apiSportsSoccerKey,
        },
        params: {
          status: "NS", // Not started
          league: league.get("apiId"),
          season: league.get("season"),
        },
      });

      if (data.response.length != 0) {
        for await (item of data.response) {
          const query = new Moralis.Query(Event);
          query.equalTo("apiId", item["fixture"].id);
          const results = await query.find();

          if (results.length == 0) {
            const event = new Moralis.Query(Event);
            event.equalTo("apiId", item["fixture"].id);
            const eventResults = await event.first();

            if (!eventResults) {
              const homeQuery = new Moralis.Query(Team);
              homeQuery.equalTo("apiId", item["teams"]["home"].id);
              let homeResults = await homeQuery.first();

              const awayQuery = new Moralis.Query(Team);
              awayQuery.equalTo("apiId", item["teams"]["away"].id);
              let awayResults = await awayQuery.first();

              if (!homeResults) {
                const countryQuery = new Moralis.Query(Country);
                countryQuery.equalTo("name", item["teams"]["home"].country);
                const country = await countryQuery.first();
                homeResults = await createTeam(
                  item["teams"]["home"].id,
                  item["teams"]["home"].name,
                  item["teams"]["home"].national,
                  item["teams"]["home"].logo,
                  country
                );
              }

              if (!awayResults) {
                const countryQuery = new Moralis.Query(Country);
                countryQuery.equalTo("name", item["teams"]["home"].country);
                const country = await countryQuery.first();
                awayResults = await createTeam(
                  item["teams"]["away"].id,
                  item["teams"]["away"].name,
                  item["teams"]["away"].national,
                  item["teams"]["away"].logo,
                  country
                );
              }

              if (homeResults && awayResults) {
                const event = new Event();
                event.set("apiId", item["fixture"].id);
                event.set("league", league);
                event.set("home", item["teams"]["home"].name);
                event.set("away", item["teams"]["away"].name);
                event.set("start", item["fixture"].timestamp);
                event.set("status", item["fixture"]["status"].short);
                event.set("polygonContract", "");
                event.set("polygonVolume", 0);
                event.set("avaxContract", "");
                event.set("avaxVolume", 0);
                await event.save();
                saved++;
              }
            }
          }
        }
      } else if (data.errors.length != 0) {
        message(JSON.stringify(data.errors));
      } else {
        message("Response not parsable");
      }
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  log.info("Pre Events synced: " + saved);
  message("Events synced: " + saved);
});

Moralis.Cloud.job("syncLeagues", async (request) => {
  const { params, headers, log, message } = request;

  const config = await Moralis.Config.get({ useMasterKey: true });
  const apiSportsSoccerKey = config.get("api_sports_soccer_key");

  const sportQuery = new Moralis.Query(Sport);
  sportQuery.equalTo("name", "Soccer");
  const sportResults = await sportQuery.find();

  try {
    const { data } = await Moralis.Cloud.httpRequest({
      url: "https://v3.football.api-sports.io/leagues",
      headers: {
        "x-apisports-key": apiSportsSoccerKey,
      },
    });
    if (data.response.length != 0) {
      let saved = 0;

      for await (item of data.response) {
        /**
         * Get country
         */
        const country = new Country();
        const countryQuery = new Moralis.Query(Country);
        countryQuery.equalTo("name", item["country"].name);
        const countryResults = await countryQuery.find();

        /**
         * Check if league exists
         */
        const league = new League();
        const leagueQuery = new Moralis.Query(League);
        leagueQuery.equalTo("apiId", item.league.id);
        leagueQuery.equalTo("sport", sportResults[0]);
        const results = await leagueQuery.find();

        const season = item["seasons"].filter((item) => item.current)[0].year;

        if (results.length == 1 && results[0].get("season") != season) {
          results[0].set("season", season);
          await results[0].save();
          saved++;
        } else if (results.length == 0) {
          league.set("apiId", item["league"].id);
          league.set("name", item["league"].name);
          league.set("type", item["league"].type);
          league.set("logo", item["league"].logo);
          league.set("season", season);
          league.set("sport", sportResults[0]);
          league.set("country", countryResults[0]);
          league.set("isActive", false);
          await league.save();
          saved++;
        }
      }
      logger.info("Leagues synced: " + saved);
      message("Leagues synced: " + saved);
    } else if (data.errors.length != 0) {
      message(JSON.stringify(data.errors));
    } else {
      message("Response not parsable");
    }
  } catch (e) {
    message("Error occurred!");
    log.error(e.toString());
  }
});

/**
 * Get countries from external api and save in database
 */
Moralis.Cloud.job("syncCountries", async (request) => {
  const { params, headers, log, message } = request;

  const config = await Moralis.Config.get({ useMasterKey: true });
  const apiSportsSoccerKey = config.get("api_sports_soccer_key");

  try {
    const { data } = await Moralis.Cloud.httpRequest({
      url: "https://v3.football.api-sports.io/countries",
      headers: {
        "x-apisports-key": apiSportsSoccerKey,
      },
    });
    if (data.response.length != 0) {
      let saved = 0;

      for await (item of data.response) {
        const query = new Moralis.Query(Country);
        query.equalTo("name", item.name);
        const results = await query.find();

        if (results.length == 0) {
          const country = new Country();
          country.set("name", item.name);
          country.set("code", item.code ? item.code : item.name);
          country.set("flag", item.flag);
          country.set("isActive", false);
          await country.save();
          saved++;
        }
      }
      message("Countries synced: " + saved);
    } else if (data.errors.length != 0) {
      message(JSON.stringify(data.errors));
    } else {
      message("Response not parsable");
    }
  } catch (e) {
    message("Error occurred!");
    log.error(e.toString());
  }
});
