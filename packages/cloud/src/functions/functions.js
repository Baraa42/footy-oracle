/**
 * HelloWorld
 */
Moralis.Cloud.define("HelloWorld", async (request) => {
  const msg = "Hello World from IDE y12";
  const logger = Moralis.Cloud.getLogger();
  logger.info(msg);
  return msg;
});

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
    const nonceOperator =
      (await mumbaiWeb3.eth.getTransactionCount(account)) + 10;
    logger.info("nonceOperator = " + nonceOperator);

    const config = await Moralis.Config.get({ useMasterKey: true });
    const privateKey = config.get("private_key");

    const functionCall = marketPlace.methods
      .placeOffering(
        offerer,
        hostContract,
        tokenId,
        mumbaiWeb3.utils.toWei(price, "ether")
      )
      .encodeABI();
    /*
      transactionBody = {
        to: nftMarketPlaceAddr,
          nonce: nonceOperator,
          data:functionCall,
          gas:1000000,
          gasPrice:mumbaiWeb3.utils.toWei("2", "gwei")
      }
      */
    const gasPrice = await mumbaiWeb3.eth.getGasPrice();
    logger.info("gasPrice = " + gasPrice);

    transactionBody = {
      to: nftMarketPlaceAddr,
      data: functionCall,
      gasPrice: Math.round(gasPrice * 1.2),
      gas: Math.round(1000000 * 2),
    };
    signedTransaction = await mumbaiWeb3.eth.accounts.signTransaction(
      transactionBody,
      privateKey
    );
    logger.info("Completed signedTxn");
    logger.info(signedTransaction);

    fulfillTx = await mumbaiWeb3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("After sending signed txn " + fulfillTx);
    return fulfillTx;
  } catch (e) {
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
