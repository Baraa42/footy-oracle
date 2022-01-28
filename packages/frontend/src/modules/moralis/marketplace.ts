import { useContract } from "./contract";
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import BigNumber from "bignumber.js";
import { useAlert } from "../layout/alert";
import { useChain } from "./chain";
import { useMoralis } from "./moralis";

export const useMarketplace = () => {
  const { getAttributeName } = useChain();
  const { moralisUser, web3, Moralis } = useMoralis();
  const { showError, showSuccess } = useAlert();
  const ethereum = window.ethereum;
  const { nftMarketplaceContractAddress } = useContract();

  const listOnMarketplace = async (nft: NftOwnerModel, price: number): Promise<boolean> => {
    try {
      const formatPrice = new BigNumber(price).toString();
      await approveMarketPlace(nft.attributes.token_address, nft.attributes.token_id);
      await placeOffering(nft.attributes.token_address, nft.attributes.token_id, formatPrice);

      showSuccess("NFT successfully put for sale, please wait for confirmation");
      return true;
    } catch (err: any) {
      if (err.message) {
        showError(err.message);
      } else {
        showError("Oops! Something went wrong, please try again later");
      }
      return false;
    }
  };

  const buyNFT = async (nft: NftOwnerModel): Promise<boolean> => {
    if (nft.attributes.offer?.attributes && nft.attributes.offer.attributes.offerer != moralisUser?.value?.get("ethAddress")) {
      try {
        const priceHexString = BigInt(nft.attributes.offer.attributes.price).toString(16);
        const closedOffering = await closeOffering(nft.attributes.offer.attributes.offeringId, priceHexString);
        showSuccess("NFT successfully bought, please wait for confirmation");
        return true;
      } catch (err: any) {
        if (err.message) {
          showError(err.message);
        } else {
          showError("Oops! Something went wrong, please try again later");
        }
        console.log(err);
        return false;
      }
    } else {
      showError("You can not buy your own NFT");
      return false;
    }
  };

  const placeOffering = async (_hostContract: string, _tokenId: string, _price: string): Promise<any> => {
    const params = { hostContract: _hostContract, offerer: moralisUser?.value?.get("ethAddress"), tokenId: _tokenId, price: _price };

    const result = await Moralis.Cloud.run(getAttributeName("placeOffering") as string, params);
    return result;
  };

  const approveMarketPlace = async (hostContract: string, tokenId: string): Promise<any> => {
    const encodedFunction = web3.value.eth.abi.encodeFunctionCall(
      {
        name: "approve",
        type: "function",
        inputs: [
          { type: "address", name: "to" },
          { type: "uint256", name: "tokenURI" },
        ],
      },
      [nftMarketplaceContractAddress.value, tokenId]
    );

    const transactionParameters = {
      to: hostContract,
      from: moralisUser?.value?.get("ethAddress"),
      data: encodedFunction,
    };

    const txt = await ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return txt;
  };

  const closeOffering = async (offeringId: string, priceEncoded: any): Promise<any> => {
    const encodedFunction = web3.value.eth.abi.encodeFunctionCall(
      {
        name: "closeOffering",
        type: "function",
        inputs: [{ type: "bytes32", name: "_offeringId" }],
      },
      [offeringId]
    );

    const transactionParameters = {
      to: nftMarketplaceContractAddress.value,
      from: moralisUser?.value?.get("ethAddress"),
      value: priceEncoded,
      data: encodedFunction,
    };
    const txt = await ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return txt;
  };

  return { listOnMarketplace, buyNFT, closeOffering };
};
