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
     * Fuji
     */
    //polygonContract: string;
    fujiVolume: number;
    fujiUnmatchedBets?: Array<UnmatchedBetModel>;
    fujiMatchedBets?: Array<MatchedBetModel>;
    /**
     * Mumbai
     */
    //axaxContract: string;
    mumbaiVolume: number;
    mumbaiUnmatchedBets?: Array<UnmatchedBetModel>;
    mumbaiMatchedBets?: Array<MatchedBetModel>;
  };
  unmatchedBets?: UnmatchedBetModel[][][]; //[betType][selection]
  getName(): string;
  loadUnmatchedBets(): void;
  getDetailLink(): {};
}
