import { Moralis as MoralisTypes } from "moralis/types";
import { EventModel } from "./EventModel";
import { UserModel } from "./UserModel";

export interface FavoriteModel
  extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    event: EventModel;
    user: UserModel;
  };
}
