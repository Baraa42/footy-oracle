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

  const config = await Moralis.Config.get({ useMasterKey: false });
  const polygonContract = config.get("polygon_contract");

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const futureTimestamp = currentTimestamp + 3 * 60 * 60;

  const eventQuery = new Moralis.Query(Event);
  eventQuery.notEqualTo("isCompleted", true);
  eventQuery.lessThan("start", futureTimestamp);
  eventQuery.ascending("start");
  const events = await eventQuery.find();

  let updated = 0;
  for await (eventItem of events) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const contract = new web3.eth.Contract(
        BettingContract.abi,
        polygonContract
      );
      const gas = await contract.methods
        .requestResult(eventItem.get("apiId"))
        .estimateGas({ from: account });
      const result = await contract.methods
        .requestResult(eventItem.get("apiId"))
        .send({
          from: account,
          gasPrice: gasPrice * 1.2,
          gas: gas * 2,
        });
      eventItem.set("isCompleted", true);
      await eventItem.save();
      updated++;
    } catch (e) {
      message("Error occurred!");
      log.error(e.toString());
    }
  }
  log.info(
    "After Match Events found: " + events.length + " updated:" + updated
  );
  message("After Match Events found: " + events.length + " updated:" + updated);
});
