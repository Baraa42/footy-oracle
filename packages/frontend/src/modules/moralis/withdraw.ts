import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { useContract } from "./contract";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";

/**
 * Withdraw with NFT
 *
 * @param  {NftOwnerModel} nft
 * @returns Promise
 */
const withdraw = async (nft: NftOwnerModel): Promise<void> => {
  const { userAddress, web3 } = useMoralis();
  const { showSuccess, showError } = useAlert();

  if (userAddress.value) {
    if (nft?.attributes.bet?.attributes.event?.attributes.isCompleted) {
      const { bettingContract } = useContract();

      console.log(String(nft?.attributes.bet?.attributes.event?.attributes.apiId));
      console.log(Number(nft.attributes.token_id));

      bettingContract.value.methods.withdrawWithNFT(String(nft?.attributes.bet?.attributes.event?.attributes.apiId), Number(nft.attributes.token_id)).send(
        {
          from: userAddress.value,
        },
        async (err: any, result: any) => {
          if (!err) {
            showSuccess("Profits successfully withdrawn.");
            console.log(result);
          } else {
            if (err?.code !== 4001) {
              showError("No profits withdrawn, your bet lost.");
            }
            console.log(err);
          }
        }
      );
    } else {
      showError("Please wait until the game is over.");
    }
  }
};

export const useWithdraw = () => {
  return { withdraw };
};
