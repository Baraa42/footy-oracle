import { Event } from 'ethers';
import { placeBet } from './../../../../hardhat/test/helpers';
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
   * @param  {Betslip} betslipItem
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
    console.log(event);
    console.log("eventid = ", event.attributes.apiId);

    var betAmount = new BigNumber(amount).toString();
    console.log(betAmount);
    var v = web3.value.utils.toWei(betAmount, "ether");
    console.log(v);
    console.log('losslessManagerContractAddress = ', losslessManagerContractAddress.value);

    var balance = await losslessManagerContract.value.methods.getQiTokenBalance(event.attributes.apiId).call();
    console.log("total balance = ", balance);

    /*
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
          value: v,
        },
        async (err: any, result: any) => {
          if (!err) {
            showSuccess("Lossless Bet successfully placed");
          }
          console.log(result);
        }
      );
   /*
   // This works
      losslessManagerContract.value.methods
      .mintQiToken()
      .send(
        {
          from: userAddress.value,
          value: v,
        },
        async (err: any, result: any) => {
          if (!err) {
            showSuccess("Lossless Bet mintQiToken successfully created");
          }
          console.log(result);
        }
      );
      */
    /*

    if (betslipItem.type === types.BACK) {
      bettingContract.value.methods
        .createBackBet(
          String(betslipItem.event.attributes.apiId),
          0,
          betslipItem.selection,
          encodeOdds(betslipItem.odds),
          web3.value.utils.toWei(betslipItem.stake.toString(), "ether")
        )
        .send(
          {
            from: userAddress.value,
            value: web3.value.utils.toWei(betslipItem.stake.toString(), "ether"),
          },
          async (err: any, result: any) => {
            if (!err) {
              removeFromBetslip(betslipItem);
              showSuccess("Bet successfully placed");
            }
            console.log(result);
          }
        );
    } else if (betslipItem.type === types.LAY) {
      bettingContract.value.methods
        .createLayBet(
          String(betslipItem.event.attributes.apiId),
          0,
          betslipItem.selection,
          encodeOdds(betslipItem.odds),
          web3.value.utils.toWei(betslipItem.stake.toString(), "ether")
        )
        .send(
          {
            from: userAddress.value,
            value: web3.value.utils.toWei(betslipItem.liability.toString(), "ether"),
          },
          async (err: any, result: any) => {
            if (!err) {
              removeFromBetslip(betslipItem);
              showSuccess("Bet successfully placed");
            }
            console.log(result);
          }
        );
    }
    */
  };
  return {createLosslessBet};
};
