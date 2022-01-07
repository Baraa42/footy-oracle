/**
 * Adds pointer from event and user to unmatched bet
 */
Moralis.Cloud.beforeSave("PolygonUnmatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

/**
 * Adds pointer from event and user to unmatched bet
 */
Moralis.Cloud.beforeSave("PolygonMatchedBets", async (request) => {
  await beforeSaveBet(request.object);
});

/**
 * Create realation from user and event to unmatched bet
 */
Moralis.Cloud.afterSave("PolygonUnmatchedBets", async (request) => {
  if (request.object.get("isPartMatched") == undefined) {
    await afterSaveBet(request.object, "polygonUnmatchedBets");
  }
});

/**
 * Create realation from user and event to matched bet
 * Also calulates volume
 */
Moralis.Cloud.afterSave("PolygonMatchedBets", async (request) => {
  if (request.object.get("confirmed") == undefined) {
    const event = await afterSaveBet(request.object, "polygonMatchedBets");

    // sum volume for event
    let volume = 0;
    if (event.get("polygonVolume")) {
      volume = event.get("polygonVolume");
    }
    volume = Number(volume) + Number(request.object.get("amount"));
    event.set("polygonVolume", volume);
    await event.save();
  }
});

/**
 * After save trigger for unmatched bet removed
 */
Moralis.Cloud.afterSave("PolygonUnmatchedBetsRemoved", async (request) => {
  const unmatchedBet = request.object;

  const unmatcheBetQuery = new Moralis.Query(PolygonUnmatchedBets);
  unmatcheBetQuery.equalTo("from", unmatchedBet.get("from"));
  unmatcheBetQuery.equalTo("odds", unmatchedBet.get("odds"));
  unmatcheBetQuery.equalTo("betSide", unmatchedBet.get("betSide"));
  unmatcheBetQuery.equalTo("betType", unmatchedBet.get("betType"));
  unmatcheBetQuery.equalTo("selection", unmatchedBet.get("selection"));
  unmatcheBetQuery.equalTo("apiId", unmatchedBet.get("apiId"));
  unmatcheBetQuery.equalTo("amount", unmatchedBet.get("amount"));
  const bet = await unmatcheBetQuery.first();
  if (bet) {
    await bet.destroy();
  }
});

/**
 * After save trigger for unmatched bet removed
 */
Moralis.Cloud.afterSave("PolygonUnmatchedBetsUpdated", async (request) => {
  const unmatchedBet = request.object;

  const unmatcheBetQuery = new Moralis.Query(PolygonUnmatchedBets);
  unmatcheBetQuery.equalTo("from", unmatchedBet.get("from"));
  unmatcheBetQuery.equalTo("odds", unmatchedBet.get("odds"));
  unmatcheBetQuery.equalTo("betSide", unmatchedBet.get("betSide"));
  unmatcheBetQuery.equalTo("betType", unmatchedBet.get("betType"));
  unmatcheBetQuery.equalTo("selection", unmatchedBet.get("selection"));
  unmatcheBetQuery.equalTo("apiId", unmatchedBet.get("apiId"));
  const bet = await unmatcheBetQuery.first();
  if (bet) {
    bet.set("amount", unmatchedBet.get("amount"));
    bet.set("isPartMatched", true);
    await bet.save();
  }
});

/**
 * Check pendings nfts for the minting indicator
 * From undefined to pending
 */
Moralis.Cloud.afterSave("PolygonNFTOwnersPending", async (request) => {
  const pendingNFT = request.object;
  const metadata = await resolveMetadataFromNft(pendingNFT);
  if (metadata) {
    const eventApiId = parseEventApiIdFromMetadata(metadata);

    const matcheBetQuery = new Moralis.Query(PolygonMatchedBets);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("tokenId", pendingNFT.get("token_id"));
    matcheBetQuery.equalTo("mintStatus", undefined);
    const matchedBet = await matcheBetQuery.first();

    if (matchedBet) {
      matchedBet.set("mintStatus", "pending");
      await matchedBet.save();
    }
  }
});

/**
 * Resolves metadata and bet to object before save
 */
Moralis.Cloud.beforeSave("PolygonNFTOwners", async (request) => {
  const metadata = await resolveMetadataFromNft(request.object);
  request.object.set("metadata", metadata);

  const eventApiId = parseEventApiIdFromMetadata(metadata);
  const matcheBetQuery = new Moralis.Query(PolygonMatchedBets);
  matcheBetQuery.equalTo("apiId", eventApiId);
  matcheBetQuery.equalTo("tokenId", request.object.get("token_id"));
  const matchedBet = await matcheBetQuery.first();
  if (matchedBet) {
    request.object.set("bet", matchedBet);
  }
});

/**
 * Check nfts owner for the minting indicator
 * From pending to completed
 */
Moralis.Cloud.afterSave("PolygonNFTOwners", async (request) => {
  const nft = request.object;
  if (nft.get("metadata") && nft.get("metadata") != {}) {
    const eventApiId = parseEventApiIdFromMetadata(nft.get("metadata"));

    const matcheBetQuery = new Moralis.Query(PolygonMatchedBets);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("tokenId", nft.get("token_id"));
    matcheBetQuery.equalTo("mintStatus", "pending");
    const matchedBet = await matcheBetQuery.first();

    if (matchedBet) {
      matchedBet.set("nft", nft);
      matchedBet.set("mintStatus", "completed");
      await matchedBet.save();
    }
  }
});

Moralis.Cloud.afterSave("MumbaiPlacedOfferings", async (request) => {
  const offer = request.object;

  const nftsQuery = new Moralis.Query(PolygonNFTOwners);
  nftsQuery.equalTo("token_id", offer.get("tokenId"));
  nftsQuery.equalTo("token_address", offer.get("hostContract"));
  const nft = await nftsQuery.first();

  if (nft) {
    nft.set("offer", offer);
    await nft.save(null, { useMasterKey: true });
  }
});
