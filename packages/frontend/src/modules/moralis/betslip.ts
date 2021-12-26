import { markRaw } from "vue";
import { Betslip } from "../../interfaces/Betslip";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useActionBar } from "../layout/actionBar";
import { useMoralis } from "./moralis";
import Moralis from "moralis/dist/moralis.js";
import { useAlert } from "../layout/alert";
import { BigNumber } from "bignumber.js";
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
  const { betslip, moralisUser } = useMoralis();
  const { bettingAbi } = useContract();
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
    if (!moralisUser.value) {
      showError("You need to connect your wallet");
      return;
    }

    const config = await Moralis.Config.get({ useMasterKey: false });
    const polygonContract = config.get("polygon_contract");

    if (!polygonContract) {
      showError("No contract deployed for this game");
      return;
    }

    const web3 = await Moralis.Web3.enable();
    const contract = new web3.eth.Contract(bettingAbi, polygonContract);

    if (betslipItem.type === types.BACK) {
      contract.methods
        .createBackBet(
          String(betslipItem.event.attributes.apiId),
          0,
          betslipItem.selection,
          encodeOdds(betslipItem.odds),
          web3.utils.toWei(betslipItem.stake.toString(), "ether")
        )
        .send(
          {
            from: moralisUser.value.get("ethAddress"),
            value: web3.utils.toWei(betslipItem.stake.toString(), "ether"),
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
          web3.utils.toWei(betslipItem.stake.toString(), "ether")
        )
        .send(
          {
            from: moralisUser.value.get("ethAddress"),
            value: web3.utils.toWei(betslipItem.liability.toString(), "ether"),
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
    if (moralisUser.value) {
      const config = await Moralis.Config.get({ useMasterKey: false });
      const polygonContract = config.get("polygon_contract");
      const web3 = await Moralis.Web3.enable();
      const contract = new web3.eth.Contract(bettingAbi, polygonContract);
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
            from: moralisUser.value.get("ethAddress"),
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
