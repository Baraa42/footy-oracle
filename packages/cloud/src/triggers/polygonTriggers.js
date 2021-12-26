/**
 * After save trigger for unmatched bet
 *
 * Create realation from user to unmatched bet
 * and event to unmatched bet
 */
Moralis.Cloud.afterSave("PolygonUnmatchedBets", async (request) => {
  const unmatchedBet = request.object;

  /**
   * Only real unmatched bets
   */
  if (unmatchedBet.get("isPartMatched") == undefined) {
    /**
     * Create relation to event
     */
    const eventQuery = new Moralis.Query(Event);
    eventQuery.equalTo("apiId", Number(unmatchedBet.get("apiId")));
    const eventResult = await eventQuery.first();
    if (eventResult) {
      const relation = eventResult.relation("polygonUnmatchedBets");
      relation.add(unmatchedBet);
      await eventResult.save();
    }

    /**
     * Create relation to user
     */
    const userQuery = new Moralis.Query(Moralis.User);
    userQuery.equalTo("ethAddress", unmatchedBet.get("from"));
    const user = await userQuery.first({ useMasterKey: true });

    if (user) {
      const userRelation = user.relation("polygonUnmatchedBets");
      userRelation.add(unmatchedBet);
      await user.save(null, { useMasterKey: true });
    }
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
 * After save trigger for matched bet
 *
 * Mark opposite bet as matched or part matched
 * and create relations to user and event
 */
Moralis.Cloud.afterSave("PolygonMatchedBets", async (request) => {
  const matchedBet = request.object;

  /**
   * Create relation to event
   */
  const eventQuery = new Moralis.Query(Event);
  eventQuery.equalTo("apiId", Number(matchedBet.get("apiId")));
  const eventResult = await eventQuery.first();

  if (eventResult) {
    const newReleation = eventResult.relation("polygonMatchedBets");
    newReleation.add(matchedBet);
    await eventResult.save();

    /**
     * Sum volume for event
     */
    let volume = 0;
    if (eventResult.get("polygonVolume")) {
      volume = eventResult.get("polygonVolume");
    }
    volume = Number(volume) + Number(matchedBet.get("amount"));
    eventResult.set("polygonVolume", volume);
    await eventResult.save();
  }

  /**
   * Create relation to user
   */
  const userQuery = new Moralis.Query(Moralis.User);
  userQuery.equalTo("ethAddress", matchedBet.get("from"));
  const user = await userQuery.first({ useMasterKey: true });

  if (user) {
    const userRelation = user.relation("polygonMatchedBets");
    userRelation.add(matchedBet);
    await user.save(null, { useMasterKey: true });
  }
});

/**
 * Check pendings nfts for the minting indicator
 * From undefined to pending
 */
Moralis.Cloud.afterSave("PolygonNFTOwnersPending", async (request) => {
  const pendingNFT = request.object;
  const metadata = await resolveMetadataFromNft(pendingNFT);
  if (metadata.name) {
    const eventApiId = parseEventApiIdFromNFTName(metadata.name);
    const betId = parseBetIdFromNFTName(metadata.name);

    const matcheBetQuery = new Moralis.Query(PolygonMatchedBets);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("betId", betId);
    matcheBetQuery.equalTo("polygonMintStatus", undefined);
    const matchedBet = await matcheBetQuery.first();

    if (matchedBet) {
      matchedBet.set("polygonMintStatus", "pending");
      await matchedBet.save();
    }
  }
});

/**
 * Check nfts owner for the minting indicator
 * From pending to completed
 */
Moralis.Cloud.afterSave("PolygonNFTOwners", async (request) => {
  const NFT = request.object;
  const metadata = await resolveMetadataFromNft(NFT);
  if (metadata.name) {
    const eventApiId = parseEventApiIdFromNFTName(metadata.name);
    const betId = parseBetIdFromNFTName(metadata.name);

    const matcheBetQuery = new Moralis.Query(
      Moralis.Object.extend(chainClass + "MatchedBets")
    );
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("betId", betId);
    matcheBetQuery.equalTo("polygonMintStatus", "pending");
    const matchedBet = await matcheBetQuery.first();

    if (matchedBet) {
      matchedBet.set("nft", NFT);
      matchedBet.set("polygonMintStatus", "completed");
      await matchedBet.save();
    }
  }
});
