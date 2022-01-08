import { markRaw } from "vue";
import { Betslip } from "../../interfaces/Betslip";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useActionBar } from "../layout/actionBar";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useContract } from "./contract";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { EventModel } from "../../interfaces/models/EventModel";
import { useOdds } from "../settings/odds";
import { ActionBarItem } from "../../interfaces/layout/ActionBarItem";
import MyBetsOverlay from "../../components/overlays/bets/MyBetsOverlay.vue";

const selections = SelectionEnum;
const types = BetTypeEnum;

export const useBetslip = () => {
  const { encodeOdds, decodeOdds, minOdds } = useOdds();
  const { betslip, userAddress, web3 } = useMoralis();
  const { bettingAbi, getBettingContract } = useContract();
  const { showError, showSuccess } = useAlert();
  const { setActionBarItem, activeActionBarItem } = useActionBar();

  const betSlipActionBar: ActionBarItem = {
    name: "My Bets",
    component: markRaw(MyBetsOverlay),
  };

  /**
   * Add item to betslip and open action bar if not active
   * Possible as new bet or with odds from selected unmatched bet
   *
   * @param  {EventModel} event
   * @param  {BetTypeEnum} type
   * @param  {SelectionEnum} selection
   * @param  {UnmatchedBetModel} unmatchedBet?
   * @returns void
   */
  const addToBetslip = (event: EventModel, type: BetTypeEnum, selection: SelectionEnum, unmatchedBet?: UnmatchedBetModel): void => {
    let odds: number = minOdds;
    if (unmatchedBet) {
      odds = Number(decodeOdds(unmatchedBet.get("odds")));
    }

    betslip.value?.push({
      event: event,
      selection: selection,
      type: type,
      odds: odds,
      stake: 0,
      profit: 0,
      liability: 0,
    });

    //Open action bar if its not active
    if (activeActionBarItem.value != betSlipActionBar.name) {
      setActionBarItem(betSlipActionBar);
    }
  };

  /**
   * Remove item from betslip
   *
   * @param  {Betslip} betslipItem
   * @returns void
   */
  const removeFromBetslip = (betslipItem: Betslip): void => {
    const index: number | undefined = betslip.value?.findIndex((item: Betslip) => item == betslipItem);
    if (index != undefined) {
      betslip.value?.splice(index, 1);
    }
  };

  /**
   * Accept new bet from betslip
   *
   * @param  {Betslip} betslipItem
   * @returns Promise
   */
  const acceptBet = async (betslipItem: Betslip): Promise<void> => {
    if (!userAddress.value) {
      showError("You need to connect your wallet");
      return;
    }

    const contractAddr = await getBettingContract();

    if (!contractAddr) {
      showError("No contract deployed for this game");
      return;
    }

    const contract = new web3.value.eth.Contract(bettingAbi, contractAddr);

    if (betslipItem.type === types.BACK) {
      contract.methods
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
      contract.methods
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
  };

  /**
   * Remove unmatched bet
   *
   * @param  {UnmatchedBetModel} unmatchedBet
   * @returns Promise
   */
  const removeUnmatchedBet = async (unmatchedBet: UnmatchedBetModel): Promise<void> => {
    if (userAddress.value) {
      const contractAddr = await getBettingContract();
      const contract = new web3.value.eth.Contract(bettingAbi, contractAddr);
      contract.methods
        .removeUnmatchedBet(
          unmatchedBet.get("apiId"),
          encodeOdds(unmatchedBet.get("odds")),
          unmatchedBet.get("amount"),
          unmatchedBet.get("selection"),
          unmatchedBet.get("betType")
        )
        .send(
          {
            from: userAddress.value,
          },
          async (err: any, result: any) => {
            if (!err) {
              showSuccess("Bet successfully removed");
              unmatchedBet.set("isCanceld", true);
              await unmatchedBet.save();
            }
            console.log(result);
          }
        );
    }
  };

  return {
    betslip,
    selections,
    types,
    addToBetslip,
    removeFromBetslip,
    acceptBet,
    removeUnmatchedBet,
  };
};
