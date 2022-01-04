Moralis.Cloud.define("HelloWorld", async (request) => {

    const msg = "Hello World from IDE y12";
    const logger = Moralis.Cloud.getLogger();
    logger.info(msg); 
    return msg;
});


Moralis.Cloud.define("placeOffering", async(request) => {
	const hostContract = request.params.hostContract;
 	const offerer = request.params.offerer;
 	const tokenId = request.params.tokenId;
  	const price = request.params.price;
    const logger = Moralis.Cloud.getLogger();
    const nonceOperator = (await web3.eth.getTransactionCount(account)) + 10;
    logger.info('nonceOperator = ' + nonceOperator);
  
    const config = await Moralis.Config.get({ useMasterKey: true });
    const privateKey = config.get("private_key");

    const functionCall = marketPlace.methods.placeOffering(offerer,hostContract,tokenId,web3.utils.toWei(price,"ether")).encodeABI();
    /*
    transactionBody = {
    	to: nft_market_place_address,
      	nonce: nonceOperator,
      	data:functionCall,
      	gas:1000000,
      	gasPrice:web3.utils.toWei("2", "gwei")
    }
    */
   const gasPrice = await web3.eth.getGasPrice();
   logger.info("gasPrice = " + gasPrice);
   
    transactionBody = {
      to: nft_market_place_address,
      data:functionCall,
      gasPrice: gasPrice * 1.2,
      gas: 1000000 * 2,
    }
    signedTransaction = await web3.eth.accounts.signTransaction(transactionBody, privateKey);
    logger.info('Completed signedTxn');
    logger.info(signedTransaction);
    
    fulfillTx = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    logger.info('After sending signed txn ' + fulfillTx);
    return fulfillTx;  
});

Moralis.Cloud.define("getBalance", async(request) => {
const balance = await marketPlace.methods.viewBalances(request.params.address).call();
return balance;
});