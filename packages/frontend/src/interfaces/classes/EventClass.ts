import { useChain } from "@/modules/moralis/chain";
import BigNumber from "bignumber.js";
import Moralis from "moralis/dist/moralis.js";
import { UnmatchedBetModel } from "../models/UnmatchedBetModel";

export class EventClass extends Moralis.Object {
  unmatchedBets?: UnmatchedBetModel[][][];

  constructor() {
    super("Event");
  }

  loadUnmatchedBets() {
    getUnmatchedBets(this).then((data) => (this.unmatchedBets = data));
  }

  getName() {
    return `${this.get("home").get("name")} vs. ${this.get("away").get("name")}`;
  }

  getDetailLink() {
    return {
      name: "event",
      params: {
        sport: "soccer",
        league: this.get("league")?.id,
        event: this.id,
      },
    };
  }
}

/**
 * Get all unmatched bets form event
 * and order by best odds
 *
 *
 * @param  {EventModel} event
 * @returns Promise
 */

const getUnmatchedBets = async (event: EventClass): Promise<UnmatchedBetModel[][][] | undefined> => {
  const { getAttributeName } = useChain();
  /**
   * Get unmatched bets from event
   */
  const relation = event.relation(getAttributeName("UnmatchedBets"));
  const unmatchedBetsQuery = relation.query().notEqualTo("isMatched", true).equalTo("confirmed", true).select("amount", "betType", "odds", "selection");
  const unmatchedBets = (await unmatchedBetsQuery.find()) as UnmatchedBetModel[];

  /**
   * Create new two dimensional array [betType][selection] = unmatchedBet
   */
  const unmatchedBetsGrouped: UnmatchedBetModel[][][] = new Array(2);

  for (var i = 0; i < unmatchedBetsGrouped.length; i++) {
    unmatchedBetsGrouped[i] = new Array(4);
  }

  /**
   * Return if no unmatchedBets
   */
  if (unmatchedBets.length === 0) {
    return unmatchedBetsGrouped;
  }

  /**
   * Add unmatched bet in right place
   * and sum amount with same type, selection and odds
   */
  unmatchedBets.forEach((bet: UnmatchedBetModel) => {
    if (!unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")]) {
      unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")] = [];
    }

    if (unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")].length === 0) {
      unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")].push(bet);
    } else {
      let hasSameOdds = false;
      unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")].forEach((element: UnmatchedBetModel, index: number) => {
        if (element.get("odds") == bet.get("odds")) {
          hasSameOdds = true;
          let amount1 = unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")][index].get("amount");
          let amount2 = bet.get("amount");
          const added = new BigNumber(amount1).plus(amount2).toString();
          unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")][index].set("amount", added);
        }
      });
      if (!hasSameOdds) {
        unmatchedBetsGrouped[bet.get("betType")][bet.get("selection")].push(bet);
      }
    }
  });

  /**
   * Sort unmatchedBets by odds
   */
  if (unmatchedBetsGrouped[0][1]) {
    unmatchedBetsGrouped[0][1].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }
  if (unmatchedBetsGrouped[0][2]) {
    unmatchedBetsGrouped[0][2].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }
  if (unmatchedBetsGrouped[0][3]) {
    unmatchedBetsGrouped[0][3].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }

  if (unmatchedBetsGrouped[1][1]) {
    unmatchedBetsGrouped[1][1].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }
  if (unmatchedBetsGrouped[1][2]) {
    unmatchedBetsGrouped[1][2].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }
  if (unmatchedBetsGrouped[1][3]) {
    unmatchedBetsGrouped[1][3].sort((a: UnmatchedBetModel, b: UnmatchedBetModel) => a.get("odds") - b.get("odds"));
  }

  return unmatchedBetsGrouped;
};
