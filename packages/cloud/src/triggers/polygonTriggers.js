Moralis.Cloud.beforeSave("MumbaiUnmatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

Moralis.Cloud.beforeSave("MumbaiMatchedBets", async (request) => {
  await beforeSaveBet(request.object, "Mumbai");
});

Moralis.Cloud.afterSave("MumbaiUnmatchedBets", async (request) => {
  if (request.object.get("isPartMatched") == undefined) {
    await afterSaveUnmatchedBet(request.object, "mumbaiUnmatchedBets");
  }
});

Moralis.Cloud.afterSave("MumbaiMatchedBets", async (request) => {
  if (request.object.get("confirmed") == undefined) {
    await afterSaveMatchedBet(
      request.object,
      "mumbaiMatchedBets",
      "mumbaiVolume"
    );
  }
});

Moralis.Cloud.afterSave("MumbaiUnmatchedBetsRemoved", async (request) => {
  if (request.object.get("confirmed") == undefined) {
    await afterSaveUnmatchedBetsRemoved(request.object, MumbaiUnmatchedBets);
  }
});

Moralis.Cloud.afterSave("MumbaiUnmatchedBetsUpdated", async (request) => {
  if (request.object.get("confirmed") == undefined) {
    await afterSaveUnmatchedBetsUpdated(request.object, MumbaiUnmatchedBets);
  }
});

Moralis.Cloud.afterSave("PolygonNFTOwnersPending", async (request) => {
  await afterSaveNFTOwnersPending(request.object, MumbaiMatchedBets);
});

Moralis.Cloud.beforeSave("PolygonNFTOwners", async (request) => {
  await beforeSaveNFTOwners(request.object, MumbaiMatchedBets);
});

Moralis.Cloud.afterSave("MumbaiDepositLP", async (request) => {
  if (request.object.get("confirmed")) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const contract = config.get("polygon_lp_nft");
    await afterSaveDepositLP(request.object, PolygonNFTOwners, contract);
  }
});

Moralis.Cloud.afterSave("PolygonNFTOwners", async (request) => {
  await afterSaveNFTOwners(request.object, MumbaiMatchedBets);
});

Moralis.Cloud.afterSave("MumbaiPlacedOfferings", async (request) => {
  await afterSavePlacedOffering(request.object, PolygonNFTOwners);
});

Moralis.Cloud.afterSave("MumbaiClosedOfferings", async (request) => {
  await afterSaveClosedOfferings(
    request.object,
    MumbaiPlacedOfferings,
    PolygonNFTOwners
  );
});

Moralis.Cloud.beforeSave("MumbaiUnmatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

Moralis.Cloud.beforeSave("MumbaiResult", async (request) => {
  await beforeResult(request.object);
});

Moralis.Cloud.afterSave("MumbaiResult", async (request) => {
  if (
    request.object.get("confirmed") == undefined &&
    request.object.get("isWithdrawn") != true
  ) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const polygonContract = config.get("polygon_contract");

    try {
      await afterSaveResult(
        request.object,
        mumbaiWeb3,
        polygonContract,
        "mumbaiResult"
      );
    } catch (e) {
      const { log } = request;
      log.error(e.toString());
    }
  }
});
