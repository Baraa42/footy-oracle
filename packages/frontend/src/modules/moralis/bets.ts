import { Ref, ref } from "vue";
import Moralis from "moralis/dist/moralis.js";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { useMoralis } from "./moralis";
import { useMoralisObject } from "./moralisObject";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { EventModel } from "../../interfaces/models/EventModel";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useSubscription } from "./subscription";
import { BetQueryParms } from "@/interfaces/queries/BetQueryParms";
import { useCurrency } from "../settings/currency";
import { BigNumber } from "bignumber.js";
import { useChain } from "./chain";
import {  useMarketMaker } from "./contract"

const unmatchedBets: Ref<Array<UnmatchedBetModel> | undefined> = ref();
const matchedBets: Ref<Array<MatchedBetModel> | undefined> = ref();
const marketMakerMatchedBets: Ref<Array<MatchedBetModel> | undefined> = ref();

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getUnmatchedBets = async (): Promise<Ref<Array<UnmatchedBetModel> | undefined>> => {
  const { userAddress } = useMoralis();
  if (userAddress.value) {
    // Get all unmatched bets from user
    const { getClassName } = useChain();
    const { createQuery } = useMoralisObject(getClassName("UnmatchedBets"));
    const query: Moralis.Query<any> = createQuery();
    const unmatchedBetsQuery: Moralis.Query<any> = query
      .equalTo("from", userAddress.value)
      .include("event", "event.home", "event.away", "event.league")
      .select("amount", "betType", "betSide", "odds", "selection", "apiId", "confirmed", "isPartMatched", "event");
    unmatchedBets.value = (await unmatchedBetsQuery.find()) as Array<UnmatchedBetModel>;

    // Create live subscriptions
    const { subscribe, subscribeToCreate, subscribeToUpdate, subscribeToDelete } = useSubscription();
    subscribe(unmatchedBetsQuery).then((subscription: Moralis.LiveQuerySubscription) => {
      subscribeToCreate(subscription, unmatchedBets.value);
      subscribeToUpdate(subscription, unmatchedBets.value, "id");
      subscribeToDelete(subscription, unmatchedBets.value, "id");
    });
  }
  return unmatchedBets;
};

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getMatchedBets = async (): Promise<Ref<Array<MatchedBetModel> | undefined>> => {
  const { userAddress } = useMoralis();
  if (userAddress.value) {
    // Get all matched bets from user
    const { getClassName } = useChain();
    const { createQuery } = useMoralisObject(getClassName("MatchedBets"));
    const query: Moralis.Query<any> = createQuery();
    const matchedBetsQuery: Moralis.Query<MatchedBetModel> = query
      .equalTo("from", userAddress.value)
      .include("event", "event.home", "event.away", "event.league")
      .select("amount", "betType", "odds", "betSide", "selection", "apiId", "isMinted", "nft", "tokenId", "confirmed", "mintStatus", "event");
    matchedBets.value = (await matchedBetsQuery.find()) as Array<MatchedBetModel>;

    // Create live subscriptions
    const { subscribe, subscribeToCreate, subscribeToUpdate } = useSubscription();
    subscribe(matchedBetsQuery).then((subscription: Moralis.LiveQuerySubscription) => {
      subscribeToCreate(subscription, matchedBets.value);
      subscribeToUpdate(subscription, matchedBets.value, "id");
    });
  }

  return matchedBets;
};

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getMarketMakerMatchedBets = async (): Promise<Ref<Array<MatchedBetModel> | undefined>> => {
  const { marketMakerAbi, getMarketMakerContractAddress } = useMarketMaker();
  const marketMakerContractAddress = (await getMarketMakerContractAddress()).toLowerCase();

  //console.log('In getMarketMakerMatchedBets marketMakerContractAddress = ', marketMakerContractAddress);

  if (marketMakerContractAddress) {
    // Get all matched bets from user
    const { getClassName } = useChain();
    const { createQuery } = useMoralisObject(getClassName("MatchedBets"));
    const query: Moralis.Query<any> = createQuery();
    const matchedBetsQuery: Moralis.Query<MatchedBetModel> = query
      .equalTo("from", marketMakerContractAddress)
      .include("event", "event.home", "event.away", "event.league")
      .select("amount", "betType", "odds", "betSide", "selection", "apiId", "isMinted", "nft", "tokenId", "confirmed", "mintStatus", "event");
    marketMakerMatchedBets.value = (await matchedBetsQuery.find()) as Array<MatchedBetModel>;
    
    // Create live subscriptions
    const { subscribe, subscribeToCreate, subscribeToUpdate } = useSubscription();
    subscribe(matchedBetsQuery).then((subscription: Moralis.LiveQuerySubscription) => {
      subscribeToCreate(subscription, marketMakerMatchedBets.value);
      subscribeToUpdate(subscription, marketMakerMatchedBets.value, "id");
    });
  }
  return marketMakerMatchedBets;
};

const calculatePotentialProfit = (bet: MatchedBetModel | UnmatchedBetModel): string | undefined => {
  const { convertCurrency } = useCurrency();
  if (bet.attributes.betSide == BetTypeEnum.LAY) {
    return convertCurrency(bet.attributes.amount);
  } else if (bet.attributes.betSide == BetTypeEnum.BACK) {
    const oddsTimes = new BigNumber(bet.attributes.odds).minus(1000);
    return convertCurrency(new BigNumber(bet.attributes.amount).times(oddsTimes).div(1000).toString());
  }
};

/**
 * Get unmatched bet by index for specific arguments
 * Used for Odds Button
 *
 * @param  {EventModel} event
 * @param  {BetTypeEnum} type
 * @param  {SelectionEnum} selection
 * @returns UnmatchedBetModel
 */
const getUnmatchedBetByIndex = (event: EventModel, type: BetTypeEnum, selection: SelectionEnum, index: number): UnmatchedBetModel | undefined => {
  if (event.unmatchedBets && event.unmatchedBets[type] && event.unmatchedBets[type][selection] && event.unmatchedBets[type][selection][index]) {
    return event.unmatchedBets[type][selection][index];
  } else {
    return undefined;
  }
};

/**
 * Get first unmatched bet for specific arguments
 * Used for Odds Button
 *
 * @param  {EventModel} event
 * @param  {BetTypeEnum} type
 * @param  {SelectionEnum} selection
 * @returns UnmatchedBetModel
 */
const firstUnmatchedBet = (event: EventModel, type: BetTypeEnum, selection: SelectionEnum): UnmatchedBetModel | undefined => {
  return getUnmatchedBetByIndex(event, type, selection, 0);
};

const getMatchedBetQuery = (parms: BetQueryParms): Moralis.Query => {
  const { getClassName } = useChain();
  const { createQuery, handleQuery } = useMoralisObject(getClassName("MatchedBets"));
  const query: Moralis.Query = createQuery();
  handleQuery(query, parms);

  if (parms.filter?.betSide) {
    query.equalTo("betSide", parms.filter?.betSide);
  }

  if (parms.filter?.betType) {
    query.equalTo("betType", parms.filter?.betType);
  }

  if (parms.filter?.selection) {
    query.equalTo("betType", parms.filter?.selection);
  }

  return query;
};

export const useBet = () => {
  return { getUnmatchedBets, getMatchedBets, getUnmatchedBetByIndex, firstUnmatchedBet, getMatchedBetQuery, calculatePotentialProfit, getMarketMakerMatchedBets };
};
