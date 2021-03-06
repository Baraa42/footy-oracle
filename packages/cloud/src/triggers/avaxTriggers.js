Moralis.Cloud.beforeSave("FujiUnmatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

Moralis.Cloud.beforeSave("FujiMatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

Moralis.Cloud.afterSave("FujiUnmatchedBets", async (request) => {
  if (request.object.get("isPartMatched") == undefined) {
    await afterSaveUnmatchedBet(request.object, "fujiUnmatchedBets");
  }
});

Moralis.Cloud.afterSave("FujiMatchedBets", async (request) => {
  if (request.object.get("confirmed") == undefined) {
    await afterSaveMatchedBet(request.object, "fujiMatchedBets", "fujiVolume");
  }
});

Moralis.Cloud.afterSave("FujiUnmatchedBetsRemoved", async (request) => {
  await afterSaveUnmatchedBetsRemoved(request.object, FujiUnmatchedBets);
});

Moralis.Cloud.afterSave("FujiUnmatchedBetsUpdated", async (request) => {
  await afterSaveUnmatchedBetsUpdated(request.object, FujiUnmatchedBets);
});

Moralis.Cloud.afterSave("AvaxNFTOwnersPending", async (request) => {
  await afterSaveNFTOwnersPending(request.object, FujiMatchedBets);
});

Moralis.Cloud.beforeSave("AvaxNFTOwners", async (request) => {
  await beforeSaveNFTOwners(request.object, FujiMatchedBets);
});

Moralis.Cloud.beforeSave("AvaxNFTOwners", async (request) => {
  await beforeSaveNFTOwners(request.object, FujiMatchedBets);
});

Moralis.Cloud.afterSave("FujiDepositLP", async (request) => {
  if (request.object.get("confirmed")) {
    const contractAddr = await getConfig("fuji_lp_nft_contract");
    await afterSaveDepositLP(request.object, AvaxNFTOwners, contractAddr);
  }
});

Moralis.Cloud.afterSave("AvaxNFTOwners", async (request) => {
  await afterSaveNFTOwners(request.object, FujiMatchedBets);
});

Moralis.Cloud.afterSave("FujiPlacedOfferings", async (request) => {
  await afterSavePlacedOffering(request.object, AvaxNFTOwners);
});

Moralis.Cloud.afterSave("FujiClosedOfferings", async (request) => {
  await afterSaveClosedOfferings(
    request.object,
    FujiPlacedOfferings,
    AvaxNFTOwners
  );
});

Moralis.Cloud.beforeSave("FujiResult", async (request) => {
  await beforeResult(request.object);
});

Moralis.Cloud.afterSave("FujiResult", async (request) => {
  if (
    request.object.get("confirmed") == undefined &&
    request.object.get("isWithdrawn") != true
  ) {
    const contractAddr = await getConfig("fuji_betting_contract");

    try {
      await afterSaveResult(
        request.object,
        fujiWeb3,
        contractAddr,
        "fujiResult"
      );
    } catch (e) {
      const { log } = request;
      log.error(e.toString());
    }
  }
});
