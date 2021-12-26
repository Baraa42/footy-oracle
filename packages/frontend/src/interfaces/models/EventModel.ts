import { LeagueModel } from "./LeagueModel";
import { MatchedBetModel } from "./MatchedBetModel";
import { UnmatchedBetModel } from "./UnmatchedBetModel";
import Moralis from "moralis/types";
import { TeamModel } from "./TeamModel";

export interface EventModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    id: string;
    apiId: number;
    away: TeamModel;
    home: TeamModel;
    start: number;
    league: LeagueModel;
    status: string;
    isCompleted?: boolean;
    /**
     * Polygon
     */
    //polygonContract: string;
    polygonVolume: number;
    polygonUnmatchedBets?: Array<UnmatchedBetModel>;
    polygonMatchedBets?: Array<MatchedBetModel>;
    /**
     * Avax
     */
    //axaxContract: string;
    axaxVolume: number;
    axaxUnmatchedBets?: Array<UnmatchedBetModel>;
    axaxMatchedBets?: Array<MatchedBetModel>;
  };
  unmatchedBets?: UnmatchedBetModel[][][]; //[betType][selection]
  getName(): string;
  loadUnmatchedBets(): void;
  getDetailLink(): {};
}
