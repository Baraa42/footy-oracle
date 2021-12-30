import { Ref, ref } from "vue";
import Moralis, { Moralis as MoralisTypes } from "moralis/types";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { useMoralis } from "./moralis";
import { useMoralisObject } from "./moralisObject";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { EventModel } from "../../interfaces/models/EventModel";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { useSubscription } from "./subscription";

const unmatchedBets: Ref<Array<UnmatchedBetModel> | undefined> = ref();
const matchedBets: Ref<Array<MatchedBetModel> | undefined> = ref();

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getUnmatchedBets = async (): Promise<Ref<Array<UnmatchedBetModel> | undefined>> => {
  const { moralisUser } = useMoralis();

  if (moralisUser.value) {
    // Get all unmatched bets from user
    const { createQuery } = useMoralisObject("PolygonUnmatchedBets");
    const query: MoralisTypes.Query<UnmatchedBetModel> = await createQuery();
    const unmatchedBetsQuery: Moralis.Query<any> = query
      .equalTo("from", moralisUser.value.get("ethAddress"))
      .include("event")
      .select("amount", "betType", "betSide", "odds", "selection", "apiId", "confirmed", "isPartMatched", "event");
    unmatchedBets.value = (await unmatchedBetsQuery.find()) as Array<UnmatchedBetModel>;

    // Create live subscriptions
    const { subscribe, subscribeToCreate, subscribeToUpdate, subscribeToDelete } = useSubscription();
    subscribe(unmatchedBetsQuery).then((subscription: MoralisTypes.LiveQuerySubscription) => {
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
  const { moralisUser } = useMoralis();

  if (moralisUser.value) {
    // Get all matched bets from user
    const { createQuery } = useMoralisObject("PolygonMatchedBets");
    const query: MoralisTypes.Query<any> = await createQuery();
    const matchedBetsQuery: Moralis.Query<MatchedBetModel> = query
      .equalTo("from", moralisUser.value.get("ethAddress"))
      .include("event")
      .select("amount", "betType", "odds", "betSide", "selection", "apiId", "isMinted", "nft", "confirmed", "mintStatus", "event");
    matchedBets.value = (await matchedBetsQuery.find()) as Array<MatchedBetModel>;

    // Create live subscriptions
    const { subscribe, subscribeToCreate, subscribeToUpdate } = useSubscription();
    subscribe(matchedBetsQuery).then((subscription: MoralisTypes.LiveQuerySubscription) => {
      subscribeToCreate(subscription, matchedBets.value);
      subscribeToUpdate(subscription, matchedBets.value, "id");
    });
  }

  return matchedBets;
};

/**
 * Gets matched bet from nft
 *
 * @param  {NftOwnerModel} nft
 * @returns Promise
 */
const getMatchedBetFromNft = async (nft: NftOwnerModel): Promise<MatchedBetModel | undefined> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    const relation: Moralis.Relation = moralisUser.value.relation("polygonMatchedBets");
    const matchedBetsQuery: MoralisTypes.Query<any> = relation
      .query()
      .equalTo("nft", nft)
      .include("nft", "bet")
      .select("amount", "bet", "betType", "odds", "selection", "apiId", "isMinted", "nft", "confirmed", "mintStatus");

    const matchedBet: MatchedBetModel | undefined = await matchedBetsQuery.first();
    return matchedBet;
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

export const useBet = () => {
  return { getUnmatchedBets, getMatchedBets, getMatchedBetFromNft, getUnmatchedBetByIndex, firstUnmatchedBet };
};
