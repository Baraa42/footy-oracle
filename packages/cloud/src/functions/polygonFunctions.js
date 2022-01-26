Moralis.Cloud.define("mumbaiPlaceOffering", async (request) => {
  const nftMarketPlaceAddr = await getConfig("mumbai_nft_marketplace_contract");
  const result = await placeOffering(request, mumbaiWeb3, nftMarketPlaceAddr);
  return result;
});

Moralis.Cloud.define("mumbaiGetBalance", async (request) => {
  const nftMarketPlaceAddr = await getConfig("mumbai_nft_marketplace_contract");
  const result = await getBalance(request, mumbaiWeb3, nftMarketPlaceAddr);
  return result;
});
