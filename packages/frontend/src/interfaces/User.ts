import { Betslip } from "./Betslip";
import { FavoriteModel } from "./models/FavoriteModel";
import { MatchedBetModel } from "./models/MatchedBetModel";
import { NftOwnerModel } from "./models/NftOwnerModel";
import { UnmatchedBetModel } from "./models/UnmatchedBetModel";
import { UserModel } from "./models/UserModel";
import { TokenBalance } from "./TokenBalance";

export interface User {
  isAuthenticated: boolean;
  balances: {
    available: number;
    liability: number;
    tokens: Array<TokenBalance>;
  };
  moralis?: UserModel;
  favorites?: Array<FavoriteModel>;
  unmatchedBets?: Array<UnmatchedBetModel>;
  matchedBets?: Array<MatchedBetModel>;
  nfts?: Array<NftOwnerModel>;
  betslip?: Array<Betslip>;
  listedNfts?: Array<any>;
}
