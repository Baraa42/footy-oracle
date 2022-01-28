

/**
 * NFT Marketplace place offering
 *
 * @param {*} request
 * @param {*} web3Chain
 * @param {*} nftMarketPlaceAddr
 */
const placeOffering = async (request, web3Chain, nftMarketPlaceAddr) => {
  try {
    const hostContract = request.params.hostContract;
    const offerer = request.params.offerer;
    const tokenId = request.params.tokenId;
    const price = request.params.price;
    /*
    logger.info("hostContract = "+ hostContract);
    logger.info(" offerer = "+ offerer);
    logger.info(" tokenId = "+ tokenId);
    logger.info(" price = "+ price);
    */
    logger.info ("account = " + account);
    const nonceOperator = (await web3Chain.eth.getTransactionCount(account)) + 20;
    logger.info("nonceOperator = " + nonceOperator);

    const config = await Moralis.Config.get({ useMasterKey: true });
    const privateKey = config.get("private_key");

    const marketPlace = new web3Chain.eth.Contract(NFTMarketPlaceABI, nftMarketPlaceAddr);
    const functionCall = marketPlace.methods
      .placeOffering(
        offerer,
        hostContract,
        tokenId,
        web3Chain.utils.toWei(price, "ether")
      )
      .encodeABI();
    
    const gasPrice = await web3Chain.eth.getGasPrice();
    logger.info("gasPrice = " + gasPrice);

    transactionBody = {
      to: nftMarketPlaceAddr,
      data: functionCall,
      gasPrice: Math.round(gasPrice * 1.5),
      gas: Math.round(1000000 * 2),
    };
    signedTransaction = await web3Chain.eth.accounts.signTransaction(
      transactionBody,
      privateKey
    );
    logger.info("Completed signedTxn");

    fulfillTx = await web3Chain.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("After sending signed txn " + fulfillTx);
    return fulfillTx;
  } catch (e) {
    logger.error("reporting error:");
    logger.error(e.toString());
  }
};

/**
 * getBalance
 *
 * @param {*} request
 * @param {*} web3Chain
 * @param {*} nftMarketPlaceAddr
 * @returns
 */
const getBalance = async (request, web3Chain, nftMarketPlaceAddr) => {
  const nftMarketPlaceContract = new web3Chain.eth.Contract(
    NFTMarketPlaceABI,
    nftMarketPlaceAddr
  );
  const balance = await nftMarketPlaceContract.methods
    .viewBalances(request.params.address)
    .call();
  return balance;
};
