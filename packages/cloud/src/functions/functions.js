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
  const hostContract = request.params.hostContract;
  const offerer = request.params.offerer;
  const tokenId = request.params.tokenId;
  const price = request.params.price;
  const logger = Moralis.Cloud.getLogger();
  const nonceOperator = (await web3Chain.eth.getTransactionCount(account)) + 10;
  logger.info("nonceOperator = " + nonceOperator);

  const privateKey = await getConfig("private_key", true);

  const nftMarketPlaceContract = new web3Chain.eth.Contract(
    NFTMarketPlaceABI,
    nftMarketPlaceAddr
  );

  const functionCall = nftMarketPlaceContract.methods
    .placeOffering(
      offerer,
      hostContract,
      tokenId,
      web3Chain.utils.toWei(price, "ether")
    )
    .encodeABI();
  /*
      transactionBody = {
          to: nftMarketPlaceAddr,
            nonce: nonceOperator,
            data:functionCall,
            gas:1000000,
            gasPrice:web3Chain.utils.toWei("2", "gwei")
      }
      */
  const gasPrice = await web3Chain.eth.getGasPrice();
  logger.info("gasPrice = " + gasPrice);

  transactionBody = {
    to: nftMarketPlaceAddr,
    data: functionCall,
    gasPrice: Math.round(gasPrice * 1.2),
    gas: Math.round(1000000 * 2),
  };
  signedTransaction = await web3Chain.eth.accounts.signTransaction(
    transactionBody,
    privateKey
  );
  logger.info("Completed signedTxn");
  logger.info(signedTransaction);

  fulfillTx = await web3Chain.eth.sendSignedTransaction(
    signedTransaction.rawTransaction
  );
  logger.info("After sending signed txn " + fulfillTx);
  return fulfillTx;
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
