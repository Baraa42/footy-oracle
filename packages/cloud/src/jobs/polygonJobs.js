Moralis.Cloud.job("polygonAddAccount", async (request) => {
  const { params, headers, log, message } = request;
  try {
    await addAccount(mumbaiWeb3);
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

  const config = await Moralis.Config.get({ useMasterKey: false });
  const polygonContract = config.get("polygon_contract");

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const futureTimestamp = currentTimestamp + 2 * 60 * 60;

  const eventQuery = new Moralis.Query(Event);
  eventQuery.notEqualTo("isCompleted", true);
  eventQuery.lessThan("start", futureTimestamp);
  eventQuery.ascending("start");
  const events = await eventQuery.find();

  let updated = 0;
  for await (eventItem of events) {
    try {
      const gasPrice = await mumbaiWeb3.eth.getGasPrice();
      const contract = new mumbaiWeb3.eth.Contract(
        BettingContract.abi,
        polygonContract
      );
      const gas = await contract.methods
        .requestResult(String(eventItem.get("apiId")))
        .estimateGas({ from: account });
      const result = await contract.methods
        .requestResult(String(eventItem.get("apiId")))
        .send({
          from: account,
          gasPrice: Math.round(gasPrice * 1.2),
          gas: Math.round(gas * 2),
        });
      eventItem.set("isCompleted", true);
      await eventItem.save();
      updated++;
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  log.info(
    "After Match Events found: " + events.length + " updated: " + updated
  );
  message(
    "After Match Events found: " + events.length + " updated: " + updated
  );
});

Moralis.Cloud.job("polygonReolveMetadata", async (request) => {
  const { params, headers, log, message } = request;

  const query = new Moralis.Query(PolygonNFTOwners);
  query.descending("block_number");
  const nfts = await query.find();

  let updated = 0;
  for await (nft of nfts) {
    try {
      const metadata = await resolveMetadataFromNft(nft);
      nft.set("metadata", metadata);
      await nft.save(null, { useMasterKey: true });
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  message("Polygon reolved metadata: " + updated);
});

Moralis.Cloud.job("polygonCreateBetRelationInNFTs", async (request) => {
  const { params, headers, log, message } = request;

  const query = new Moralis.Query(PolygonNFTOwners);
  query.descending("block_number");
  const nfts = await query.find();

  let updated = 0;
  for await (nft of nfts) {
    const eventApiId = parseEventApiIdFromMetadata(nft.get("metadata"));
    const matcheBetQuery = new Moralis.Query(MumbaiMatchedBets);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("tokenId", nft.get("token_id"));
    const matchedBet = await matcheBetQuery.first();
    if (matchedBet) {
      nft.set("bet", matchedBet);
      await nft.save(null, { useMasterKey: true });
      updated++;
    }

    try {
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  message("Polygon nfts relations added: " + updated);
});
