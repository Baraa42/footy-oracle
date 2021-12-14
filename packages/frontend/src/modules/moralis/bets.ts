import { Ref, ref } from "vue";
import Moralis, { Moralis as MoralisTypes } from "moralis/types";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { useEvents } from "./event";
import { useMoralis } from "./moralis";
import { useMoralisObject } from "./moralisObject";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { useNFTs } from "./nfts";
import { EventModel } from "../../interfaces/models/EventModel";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";

const unmatchedBets: Ref<Array<UnmatchedBetModel> | undefined> = ref();
const unmatchedBetsSubscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getUnmatchedBets = async (): Promise<Ref<Array<UnmatchedBetModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  const { getEventByApiId } = useEvents();

  if (moralisUser.value) {
    /**
     * Get unmatched bets from user
     */
    const relation: Moralis.Relation = moralisUser.value.relation("unmatchedBets");
    const unmatchedBetsQuery: Moralis.Query<any> = relation
      .query()
      .notEqualTo("matched", true)
      .notEqualTo("canceld", true)
      .select("amount", "betType", "odds", "selection", "eventId", "confirmed");
    unmatchedBets.value = (await unmatchedBetsQuery.find()) as Array<UnmatchedBetModel>;

    /**
     * Append event to bet
     */
    unmatchedBets.value.forEach(async (bet: UnmatchedBetModel) => {
      const event = await getEventByApiId(Number(bet.attributes.eventId));
      bet.event = event;
    });

    /**
     * Create live subscription
     */
    const { Object: Unmatchedbet, createQuery } = useMoralisObject("UnmatchedBet");
    const subscriptionQuery: MoralisTypes.Query<UnmatchedBetModel> = await createQuery();
    subscriptionQuery.equalTo("addr", moralisUser.value.get("ethAddress")).notEqualTo("matched", true).notEqualTo("canceld", true);

    if (unmatchedBetsSubscription.value) {
      unmatchedBetsSubscription.value.unsubscribe();
    }
    unmatchedBetsSubscription.value = await subscriptionQuery.subscribe();

    /**
     * Subscription on create
     */
    unmatchedBetsSubscription.value.on("create", async (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      if (unmatchedBets.value) {
        const bet = object as UnmatchedBetModel;
        const event = await getEventByApiId(Number(bet.attributes.eventId));
        bet.event = event;
        unmatchedBets.value.push(bet);
        console.log("Subscription: UnmatchedBet created " + bet.id);
      }
    });

    /**
     * Subscription on update
     */
    unmatchedBetsSubscription.value.on("update", async (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      if (unmatchedBets.value) {
        const bet = object as UnmatchedBetModel;
        const index = unmatchedBets.value.findIndex((item: UnmatchedBetModel) => item.id == bet.id);
        const event = await getEventByApiId(Number(bet.attributes.eventId));
        bet.event = event;
        unmatchedBets.value[index] = bet;
        console.log("Subscription: UnmatchedBet updated " + object.id);
      }
    });

    /**
     * Subscription on leave
     */
    unmatchedBetsSubscription.value.on("leave", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      if (unmatchedBets.value) {
        const index = unmatchedBets.value.findIndex((item: any) => item.id == object.id);
        unmatchedBets.value.splice(index, 1);
        console.log("Subscription: UnmatchedBet leaved " + object.id);
      }
    });
  }
  return unmatchedBets;
};

const matchedBets: Ref<Array<MatchedBetModel> | undefined> = ref();
const matchedBetsSubscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();

/**
 *  Get all unmatched bets from user
 *  It will keep a live subsription open
 *
 * @returns Promise
 */
const getMatchedBets = async (): Promise<Ref<Array<MatchedBetModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  const { getEventByApiId } = useEvents();
  const { resolveMetadataFromNft } = useNFTs();

  if (moralisUser.value) {
    /**
     * Get matched bets from user
     */
    const relation: Moralis.Relation = moralisUser.value.relation("matchedBets");
    const matchedBetsQuery: MoralisTypes.Query<any> = relation
      .query()
      .equalTo("won", undefined)
      .select("amount", "betType", "odds", "selection", "eventId", "betId", "isMinted", "nft", "confirmed", "mintStatus");
    matchedBets.value = await matchedBetsQuery.find();

    /**
     * Append event to bet
     */
    matchedBets.value.forEach(async (bet: MatchedBetModel) => {
      const event = await getEventByApiId(Number(bet.get("eventId")));
      bet.event = event;

      if (bet.attributes.nft) {
        const metadata = await resolveMetadataFromNft(bet.attributes.nft);
        if (metadata) {
          bet.attributes.nft.parsed_metadata = metadata;
        }
      }
    });

    /**
     * Create live subscription
     */
    const { Object: MatchedBets, createQuery } = useMoralisObject("MatchedBet");
    const subscriptionQuery: MoralisTypes.Query<MatchedBetModel> = await createQuery();
    subscriptionQuery.equalTo("addr", moralisUser.value.get("ethAddress"));

    if (matchedBetsSubscription.value) {
      matchedBetsSubscription.value.unsubscribe();
    }
    matchedBetsSubscription.value = await subscriptionQuery.subscribe();

    /**
     * Subscription on create
     */
    matchedBetsSubscription.value.on("create", async (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      if (matchedBets.value) {
        const bet = object as MatchedBetModel;
        const event = await getEventByApiId(Number(bet.attributes.eventId));
        bet.event = event;
        if (bet.attributes.nft) {
          const metadata = await resolveMetadataFromNft(bet.attributes.nft);
          if (metadata) {
            bet.attributes.nft.parsed_metadata = metadata;
          }
        }
        matchedBets.value.push(bet);
        console.log("Subscription: MatchedBet created " + bet.id);
      }
    });

    /**
     * Subscription on update
     */
    matchedBetsSubscription.value.on("update", async (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      if (matchedBets.value) {
        const bet = object as MatchedBetModel;
        const index = matchedBets.value.findIndex((item: MatchedBetModel) => item.id == object.id);
        const event = await getEventByApiId(Number(object.get("eventId")));
        bet.event = event;
        if (bet.attributes.nft) {
          const metadata = await resolveMetadataFromNft(bet.attributes.nft);
          if (metadata) {
            bet.attributes.nft.parsed_metadata = metadata;
          }
        }
        matchedBets.value[index] = bet;
        console.log("Subscription: MatchedBet updated " + bet.id);
      }
    });
  }

  return matchedBets;
};

const settledBets: Ref<Array<MatchedBetModel> | undefined> = ref();

/**
 *  Get all settled bets
 *
 * @returns Promise

const getHistoryBets = async (): Promise<Ref<Array<UnmatchedBetModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  const { getEventById } = useEvents();

  if (moralisUser.value) {
    const relation: MoralisTypes.Relation = moralisUser.value.relation("matchedBets");
    const matchedBetsQuery: MoralisTypes.Query<any> = relation.query().select("amount", "betType", "odds", "selection", "eventId", "won");
    settledBets.value = (await matchedBetsQuery.find()) as Array<MatchedBetModel>;

    settledBets.value = settledBets.value.filter((bet: any) => {
      if (bet.get("won") == undefined) {
        return false;
      } else {
        return true;
      }
    });

    settledBets.value.forEach(async (bet: MatchedBetModel) => {
      const event = await getEventById(bet.attributes.eventId, false);
      bet.event = event.value;
    });
  }
  return settledBets;
};
 */

const getMatchedBetFromNft = async (nft: NftOwnerModel): Promise<MatchedBetModel | undefined> => {
  const { moralisUser } = useMoralis();
  const { getEventByApiId } = useEvents();
  if (moralisUser.value) {
    /**
     * Get matched bets from nft
     */
    const relation: Moralis.Relation = moralisUser.value.relation("matchedBets");
    const matchedBetsQuery: MoralisTypes.Query<any> = relation
      .query()
      .equalTo("nft", nft)
      .include("nft")
      .select("amount", "betType", "odds", "selection", "eventId", "betId", "isMinted", "nft", "confirmed", "mintStatus");

    const matchedBet: MatchedBetModel | undefined = await matchedBetsQuery.first();

    /**
     * Append event to matched bet
     */
    if (matchedBet) {
      const event = await getEventByApiId(Number(matchedBet.get("eventId")));
      matchedBet.event = event;
      return matchedBet;
    }
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
