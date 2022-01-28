import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useContract } from "./contract";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { BigNumber } from "bignumber.js";

const types = BetTypeEnum;

export const marketMakerBet = () => {
  const { userAddress } = useMoralis();
  const { bettingContractAddress, bettingContract, marketMakerContractAddress, marketMakerContract } = useContract();

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

    var totalBalance = await marketMakerContract.value.methods.getTotalDeposit().call();
    console.log("Contract address = " + marketMakerContractAddress.value + ", totalBalance = " + totalBalance);

    console.log(String(unmatchedBet.get("apiId")));
    console.log('unmatchedBet.get("betSide") = ', unmatchedBet.get("betSide"));


    const oddsDivided = new BigNumber(unmatchedBet.get("odds")).minus(1000).div(1000);
    const liability = new BigNumber(unmatchedBet.get("amount")).times(oddsDivided).toNumber();

    console.log('oddsDivided = ', oddsDivided);
    console.log('liability = ', liability);

    // If user created a Back Bet, MM will create a Lay bet
    if (unmatchedBet.get("betSide") == 0) {
      marketMakerContract.value.methods
        .createOpposingLayBet(
          bettingContractAddress.value,
          String(unmatchedBet.get("apiId")),
          unmatchedBet.get("betType"),
          unmatchedBet.get("selection"),
          unmatchedBet.get("odds"),
          unmatchedBet.get("amount"),
          liability.toString()
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
    }
    else if (unmatchedBet.get("betSide") == 1) { // If user created a Lay Bet, MM will create a Back Bet
      marketMakerContract.value.methods
        .createOpposingBackBet(
          bettingContractAddress.value,
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
