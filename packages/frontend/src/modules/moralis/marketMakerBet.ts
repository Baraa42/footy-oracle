import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useContract } from "./contract";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { useOdds } from "../settings/odds";

const selections = SelectionEnum;
const types = BetTypeEnum;

export const marketMakerBet = () => {
  const { encodeOdds, decodeOdds, minOdds } = useOdds();
  const { betslip, userAddress, web3 } = useMoralis();
  const { bettingAbi, getBettingContract } = useContract();
  const { marketMakerAbi, getMarketMakerContractAddress } = useContract();

  const { showError, showSuccess } = useAlert();
  /**
   * Request Market Maker to take the opposite side of this bet.
   *
   * @param  {Betslip} betslipItem
   * @returns Promise
   */
  const marketMakerJoinBet = async (unmatchedBet: UnmatchedBetModel): Promise<void> => {
    if (!userAddress.value) {
      showError("You need to connect your wallet");
      return;
    }

    const bettingContractAddress = await getBettingContract();
    if (!bettingContractAddress) {
      showError("No contract deployed for this game");
      return;
    }
    const bettingContract = new web3.value.eth.Contract(bettingAbi, bettingContractAddress);

    const marketMakerContractAddress = await getMarketMakerContractAddress();
    const marketMakerContract = new web3.value.eth.Contract(marketMakerAbi, marketMakerContractAddress);
    var totalBalance = await marketMakerContract.methods.getTotalDeposit().call();
    console.log("Contract address = " + marketMakerContractAddress + ", totalBalance = " + totalBalance);

    console.log(String(unmatchedBet.get("apiId")));
    console.log('unmatchedBet.get("betSide") = ', unmatchedBet.get("betSide"));

    if (unmatchedBet.get("betSide") == 0) {
      marketMakerContract.methods
        .createOpposingLayBet(
          bettingContractAddress,
          String(unmatchedBet.get("apiId")),
          unmatchedBet.get("betType"),
          unmatchedBet.get("selection"),
          unmatchedBet.get("odds"),
          "backBetAmount",
          "liabilityAmount"
        )
        .send(
          {
            from: userAddress.value,
          },
          async (err: any, result: any) => {
            if (!err) {
              showSuccess("Bet successfully placed");
            }
            console.log(result);
          }
        );
    } else if (unmatchedBet.get("betSide") == 1) {
      marketMakerContract.methods
        .createOpposingBackBet(
          bettingContractAddress,
          String(unmatchedBet.get("apiId")),
          unmatchedBet.get("betType"),
          unmatchedBet.get("selection"),
          unmatchedBet.get("odds")
        )
        .send(
          {
            from: userAddress.value,
          },
          async (err: any, result: any) => {
            if (!err) {
              showSuccess("Bet successfully placed");
            }
            console.log(result);
          }
        );
    } else {
      console.log("betside else");
      console.log('unmatchedBet.get("betSide") == types.LAY ', unmatchedBet.get("betSide") == types.LAY);
      console.log('unmatchedBet.get("betSide") == types.BACK ', unmatchedBet.get("betSide") == types.BACK);
    }
  };
  return {
    marketMakerJoinBet,
  };
};
