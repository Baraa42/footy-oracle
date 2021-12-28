import { Ref, ref } from "vue";
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { useContract } from "./contract";
import { useToggle } from "../layout/toggle";
import Moralis from "moralis/dist/moralis.js";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useBet } from "./bets";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";

const selectedNft: Ref<NftOwnerModel | undefined> = ref();
const { isToggled: isWithdrawDialogOpen, toggle: toggleWithdrawDialog } = useToggle();

/**
 * Toggle withdraw dialog for NFT
 *
 * @param  {NftOwnerModel} nft
 * @returns void
 */
const toogleWithdraw = (nft: NftOwnerModel): void => {
  selectedNft.value = nft;
  toggleWithdrawDialog();
};

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

    if (matchedBet && matchedBet.event && matchedBet.event.attributes.isCompleted) {
      const web3 = await Moralis.Web3.enable();
      const contract = new web3.eth.Contract(bettingAbi, polygonContract);

      contract.methods.withdrawWithNFT(String(matchedBet.event.attributes.apiId), nft.attributes.token_id).send(
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
  return { selectedNft, toogleWithdraw, isWithdrawDialogOpen, toggleWithdrawDialog, withdraw };
};
