import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { useContract } from "./contract";
import Moralis from "moralis/dist/moralis.js";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useBet } from "./bets";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";

/**
 * Withdraw with NFT
 *
 * @param  {NftOwnerModel} nft
 * @returns Promise
 */
const withdraw = async (nft: NftOwnerModel): Promise<void> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    const { getMatchedBetFromNft } = useBet();
    const { showSuccess, showError } = useAlert();
    const { bettingAbi } = useContract();
    const config = await Moralis.Config.get({ useMasterKey: false });
    const polygonContract = config.get("polygon_contract");

    const matchedBet: MatchedBetModel | undefined = await getMatchedBetFromNft(nft);

    console.log(matchedBet);

    if (matchedBet && matchedBet.attributes.event && matchedBet.attributes.event.attributes.isCompleted) {
      const web3 = await Moralis.Web3.enable();
      const contract = new web3.eth.Contract(bettingAbi, polygonContract);

      contract.methods.withdrawWithNFT(String(matchedBet.attributes.event.attributes.apiId), nft.attributes.token_id).send(
        {
          from: moralisUser.value.get("ethAddress"),
        },
        async (err: any, result: any) => {
          if (!err) {
            showSuccess("Bet successfully withdrawn.");
            console.log(result);
          } else {
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
