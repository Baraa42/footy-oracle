/**
 * After save trigger for unmatched bet
 *
 * Create realation from user to unmatched bet
 * and event to unmatched bet
 */
Moralis.Cloud.afterSave("PolygonUnmatchedBet", async (request) => {
  const unmatchedBet = request.object;

  /**
   * Only real unmatched bets
   */
  if (unmatchedBet.get("matched") == undefined || unmatchedBet.get("partMatched") == undefined) {
    /**
     * Create relation to event
     */
    const eventQuery = new Moralis.Query(Event);
    eventQuery.equalTo("apiId", Number(unmatchedBet.get("eventId")));
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
    userQuery.equalTo("ethAddress", unmatchedBet.get("addr"));
    const user = await userQuery.first({ useMasterKey: true });

    if (user) {
      const userRelation = user.relation("polygonUnmatchedBets");
      userRelation.add(unmatchedBet);
      await user.save(null, { useMasterKey: true });
    }
  }
});

/**
 * After save trigger for matched bet
 *
 * Mark opposite bet as matched or part matched
 * and create relations to user and event
 */
Moralis.Cloud.afterSave("PolygonMatchedBet", async (request) => {
  const matchedBet = request.object;

  /**
   * Create relation to event
   */
  const eventQuery = new Moralis.Query(Event);
  eventQuery.equalTo("apiId", Number(matchedBet.get("eventId")));
  const eventResult = await eventQuery.first();

  if (eventResult) {
    const newReleation = eventResult.relation("polygonMatchedBets");
    newReleation.add(matchedBet);
    await eventResult.save();

    /**
     * Get the opposite bet and mark as matched or part matched
     * @TODO change to some uniqe id, that is also used inside the smart contract
     */
    const oppositeBetType = Number(!matchedBet.get("betType"));
    const relation = eventResult.relation("polygonUnmatchedBets");
    const unmatchedBetsQuery = await relation
      .query()
      .equalTo("odds", matchedBet.get("odds"))
      .equalTo("betType", oppositeBetType)
      .equalTo("selection", matchedBet.get("selection"))
      .lessThanOrEqualTo("amount", matchedBet.get("amount"));
    const unmatchedBets = await unmatchedBetsQuery.first();

    if (unmatchedBets) {
      if (unmatchedBets.get("amount") == matchedBet.get("amount")) {
        unmatchedBets.set("matched", true);
        await unmatchedBets.save();
      } else {
        let calc = unmatchedBets.get("amount") - matchedBet.get("amount");
        unmatchedBets.set("amount", calc.toString());
        unmatchedBets.set("partMatched", true);
        await unmatchedBets.save();
      }

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
    userQuery.equalTo("ethAddress", matchedBet.get("addr"));
    const user = await userQuery.first({ useMasterKey: true });

    if (user) {
      const userRelation = user.relation("polygonMatchedBets");
      userRelation.add(matchedBet);
      await user.save(null, { useMasterKey: true });
    }
  }
});

/**
 * Check pendings nfts for the minting indicator
 * From undefined to pending
 */
Moralis.Cloud.afterSave("PolygonNFTOwnersPending", async (request) => {
  const pendingNFT = request.object;
  if (pendingNFT.get("name") === "xyz") {
    const metadata = await resolveMetadataFromNft(pendingNFT);
    if (metadata.name) {
      const eventApiId = parseEventApiIdFromNFTName(metadata.name);
      const betId = parseBetIdFromNFTName(metadata.name);

      const matcheBetQuery = new Moralis.Query(PolygonMatchedBet);
      matcheBetQuery.equalTo("eventId", eventApiId);
      matcheBetQuery.equalTo("betId", betId);
      matcheBetQuery.equalTo("mintStatus", undefined);
      const matchedBet = await matcheBetQuery.first();

      if (matchedBet) {
        matchedBet.set("mintStatus", "pending");
        await matchedBet.save();
      }
    }
  }
});

/**
 * Check nfts owner for the minting indicator
 * From pending to completed
 */
Moralis.Cloud.afterSave("PolygonNFTOwners", async (request) => {
  const NFT = request.object;
  if (NFT.get("name") === "xyz") {
    const metadata = await resolveMetadataFromNft(NFT);
    if (metadata.name) {
      const eventApiId = parseEventApiIdFromNFTName(metadata.name);
      const betId = parseBetIdFromNFTName(metadata.name);

      const matcheBetQuery = new Moralis.Query(PolygonMatchedBet);
      matcheBetQuery.equalTo("eventId", eventApiId);
      matcheBetQuery.equalTo("betId", betId);
      matcheBetQuery.equalTo("mintStatus", "pending");
      const matchedBet = await matcheBetQuery.first();

      if (matchedBet) {
        matchedBet.set("nft", NFT);
        matchedBet.set("mintStatus", "completed");
        await matchedBet.save();
      }
    }
  }
});
