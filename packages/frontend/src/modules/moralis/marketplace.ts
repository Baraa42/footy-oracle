import { MumbaiDepositLPModel, NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { useAlert } from "../layout/alert";
import { useMoralis } from "./moralis";

const nftMarketPlaceAddress = "0xDC81312829E51220e1882EE26f5976d432CC7a43";

export const useMarketplace = () => {
  const { moralisUser, web3, Moralis } = useMoralis();
  const { showError, showSuccess } = useAlert();
  const ethereum = window.ethereum;

  const listOnMarketplace = async (nft: NftOwnerModel, price: any): Promise<boolean> => {
    try {
      const approval = await approveMarketPlace(nft.attributes.token_address, nft.attributes.token_id);
      const offering = await placeOffering(nft.attributes.token_address, nft.attributes.token_id, price);
      showSuccess("NFT successfully put for sale, please wait for confirmation");
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
    const result = await Moralis.Cloud.run("placeOffering", params);
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
      [nftMarketPlaceAddress, tokenId]
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
      to: nftMarketPlaceAddress,
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
