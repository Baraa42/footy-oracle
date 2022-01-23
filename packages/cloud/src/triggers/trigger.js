/**
 * Creates pointer for event and user on bet
 *
 * @param  {} bet
 *
 */
const beforeSaveBet = async (bet) => {
  const event = await getEventByApiId(bet.get("apiId"));
  bet.set("event", event);
  const user = await getUserByAddress(bet.get("from"));
  if (user) {
    bet.set("user", user);
  }
};

/**
 * Adds relation to event and user from bet
 *
 * @param  {} bet
 * @param  {} relation
 */
const afterSaveUnmatchedBet = async (bet, relation) => {
  // get event from api id and add relation
  const event = await getEventByApiId(bet.get("apiId"));
  const eventRelation = event.relation(relation);
  eventRelation.add(bet);
  await event.save();

  // get user from address and add relation
  const user = await getUserByAddress(bet.get("from"));
  if (user) {
    const userRelation = user.relation(relation);
    userRelation.add(bet);
    await user.save(null, { useMasterKey: true });
  }

  return event;
};

/**
 * Adds relation to event and user from bet
 * Sums volume from bets
 *
 * @param  {} bet
 * @param  {} relation
 * @param  {} volumeAttribute
 */
const afterSaveMatchedBet = async (bet, relation, volumeAttribute) => {
  const event = await afterSaveUnmatchedBet(bet, relation);

  // sum volume for event
  let volume = 0;
  if (event.get(volumeAttribute)) {
    volume = event.get(volumeAttribute);
  }
  volume = Number(volume) + Number(bet.get("amount"));
  event.set(volumeAttribute, volume);
  await event.save();
};

/**
 * Searches for bet and removes it
 *
 * @param  {} unmatchedBet
 * @param  {} className
 */
const afterSaveUnmatchedBetsRemoved = async (unmatchedBet, className) => {
  const unmatcheBetQuery = new Moralis.Query(className);
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
};

/**
 * Searches for bet and updates it amount
 *
 * @param  {} unmatchedBet
 * @param  {} className
 */
const afterSaveUnmatchedBetsUpdated = async (unmatchedBet, className) => {
  const unmatcheBetQuery = new Moralis.Query(className);
  unmatcheBetQuery.equalTo("from", unmatchedBet.get("from"));
  unmatcheBetQuery.equalTo("odds", unmatchedBet.get("odds"));
  unmatcheBetQuery.equalTo("betSide", unmatchedBet.get("betSide"));
  unmatcheBetQuery.equalTo("betType", unmatchedBet.get("betType"));
  unmatcheBetQuery.equalTo("selection", unmatchedBet.get("selection"));
  unmatcheBetQuery.equalTo("apiId", unmatchedBet.get("apiId"));
  const bet = await unmatcheBetQuery.first();
  if (bet) {
    const BN = mumbaiWeb3.utils.BN;
    const amount = new BN(bet.get("amount"))
      .sub(new BN(unmatchedBet.get("amount")))
      .toString();

    bet.set("amount", amount);
    bet.set("isPartMatched", true);
    await bet.save();
  }
};

/**
 * Saves the metadata and adds pointer to bet
 *
 * @param  {} nft
 * @param  {} className
 */
const beforeSaveNFTOwners = async (nft, className) => {
  const metadata = await resolveMetadataFromNft(nft);
  nft.set("metadata", metadata);

  const eventApiId = parseEventApiIdFromMetadata(metadata);
  if (eventApiId) {
    const matcheBetQuery = new Moralis.Query(className);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("tokenId", nft.get("token_id"));
    const matchedBet = await matcheBetQuery.first();
    if (matchedBet) {
      nft.set("bet", matchedBet);
    }
  }
};

/**
 * Changes the corresponding bets mint status to pending
 *
 * @param  {} pendingNFT
 * @param  {} className
 */
const afterSaveNFTOwnersPending = async (pendingNFT, className) => {
  const metadata = await resolveMetadataFromNft(pendingNFT);
  if (metadata) {
    const eventApiId = parseEventApiIdFromMetadata(metadata);

    const matcheBetQuery = new Moralis.Query(className);
    matcheBetQuery.equalTo("apiId", eventApiId);
    matcheBetQuery.equalTo("tokenId", pendingNFT.get("token_id"));
    matcheBetQuery.equalTo("mintStatus", undefined);
    const matchedBet = await matcheBetQuery.first();

    if (matchedBet) {
      matchedBet.set("mintStatus", "pending");
      await matchedBet.save();
    }
  }
};

/**
 * Changes the corresponding bets mint status to completed and adds pointer
 *
 * @param  {} nft
 * @param  {} className
 */
const afterSaveNFTOwners = async (nft, className) => {
  if (nft.get("metadata") && nft.get("metadata") != {}) {
    const eventApiId = parseEventApiIdFromMetadata(nft.get("metadata"));

    const matcheBetQuery = new Moralis.Query(className);
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
};

/**
 * Add pointer to nft and resets closedOffer if avalible
 *
 * @param  {} offer
 * @param  {} className
 */
const afterSavePlacedOffering = async (offer, className) => {
  const nftsQuery = new Moralis.Query(className);
  nftsQuery.equalTo("token_id", offer.get("tokenId"));
  nftsQuery.equalTo("token_address", offer.get("hostContract"));
  const nft = await nftsQuery.first();

  if (nft) {
    nft.set("offer", offer);

    if (nft.get("closedOffer")) {
      nft.set("closedOffer", undefined);
    }

    await nft.save(null, { useMasterKey: true });
  }
};

/**
 * Add pointer to nft and resets offer
 *
 * @param  {} closedOffer
 * @param  {} offerClassName
 * @param  {} nftClassName
 */
const afterSaveClosedOfferings = async (
  closedOffer,
  offerClassName,
  nftClassName
) => {
  const innerQuery = new Moralis.Query(offerClassName);
  innerQuery.equalTo("offeringId", closedOffer.get("offeringId"));

  const nftsQuery = new Moralis.Query(nftClassName);
  nftsQuery.matchesQuery("offer", innerQuery);
  const nft = await nftsQuery.first();

  if (nft) {
    nft.set("closedOffer", closedOffer);
    nft.set("offer", undefined);
    await nft.save(null, { useMasterKey: true });
  }
};

const afterSaveGameEnded = async (gameEnded, web3Chain, contractAddr) => {
  const gasPrice = await web3Chain.eth.getGasPrice();
  const contract = new web3Chain.eth.Contract(
    BettingContract.abi,
    contractAddr
  );
  const gas = await contract.methods
    .withdraw(String(gameEnded.get("apiId")))
    .estimateGas({ from: account });
  const result = await contract.methods
    .withdraw(String(gameEnded.get("apiId")))
    .send({
      from: account,
      gasPrice: Math.round(gasPrice * 1.2),
      gas: Math.round(gas * 2),
    });
  gameEnded.set("isWithdrawn", true);
  await gameEnded.save(null, { useMasterKey: true });
};
