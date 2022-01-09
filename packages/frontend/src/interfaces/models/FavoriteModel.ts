import Moralis from "moralis/dist/moralis.js";
import { EventModel } from "./EventModel";
import { UserModel } from "./UserModel";

export interface FavoriteModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    event: EventModel;
    user: UserModel;
  };
}
