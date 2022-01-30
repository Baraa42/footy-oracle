import { SelectionEnum } from './../../interfaces/enums/SelectionEnum';
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useContract } from "./contract";
import { EventModel } from "../../interfaces/models/EventModel";
import BigNumber from "bignumber.js";

export const useLosslessBet = () => {
  const { userAddress, web3 } = useMoralis();
  const { losslessManagerContractAddress, losslessManagerContract } = useContract();
  const { showError, showSuccess } = useAlert();

  /**
   * Accept new bet from betslip
   *
   * @param  {EventModel} event  Details of the match
   * @param  {SelectionEnum} select HOME/AWAY/DRAW
   * @param  {number} amount Bet Amount
   * @returns Promise
   */
  const createLosslessBet = async (event: EventModel, select: SelectionEnum, amount : number): Promise<void> => {
    if (!userAddress.value) {
      showError("You need to connect your wallet");
      return;
    }

    if (!losslessManagerContract.value) {
      showError("No contract deployed for this game");
      return;
    }
    var betAmount = new BigNumber(amount).toString();
    console.log('losslessManagerContractAddress = ', losslessManagerContractAddress.value);

    /*
    var balance = await losslessManagerContract.value.methods.getQiTokenBalance(event.attributes.apiId).call();
    console.log("total balance before = ", balance);

    balance = await losslessManagerContract.value.methods.getQiTokenBalanceOfContract().call();
    console.log("qi balance = ", balance);

    var gameAddress = await losslessManagerContract.value.methods.getGameAddress(String(event.attributes.apiId)).call();
    console.log("Get game address = ", gameAddress);
    */

    losslessManagerContract.value.methods
      .placeBet(String(event.attributes.apiId), select)
      .send(
        {
          from: userAddress.value,
          value: web3.value.utils.toWei(betAmount, "ether"),
        },
        async (err: any, result: any) => {
          if (!err) {
            showSuccess("Lossless Bet successfully placed");
          }
          console.log(result);
        }
      );
  };
  return {createLosslessBet};
};
