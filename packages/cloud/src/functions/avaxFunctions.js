Moralis.Cloud.define("fujiPlaceOffering", async (request) => {
  const nftMarketPlaceAddr = await getConfig("fuji_nft_marketplace_contract");
  const result = await placeOffering(request, fujiWeb3, nftMarketPlaceAddr);
  return result;
});

Moralis.Cloud.define("fujiGetBalance", async (request) => {
  const nftMarketPlaceAddr = await getConfig("fuji_nft_marketplace_contract");
  const result = await getBalance(request, fujiWeb3, nftMarketPlaceAddr);
  return result;
});
