import Moralis from "moralis/dist/moralis.js";
import { EventModel } from "../../interfaces/models/EventModel";
import { FavoriteModel } from "../../interfaces/models/FavoriteModel";
import { useAlert } from "../layout/alert";
import { useMoralis } from "./moralis";
import { useMoralisObject } from "./moralisObject";

const { Object: Favorite, createQuery } = useMoralisObject("Favorite");
const { showError, showSuccess } = useAlert();

export const useFavorites = () => {
  const { isAuthenticated, moralisUser, favorites } = useMoralis();

  /**
   * Get favorite events from logged in user
   *
   * @returns Promise
   */
  const getFavorites = async (): Promise<Array<FavoriteModel> | undefined> => {
    if (isAuthenticated.value && moralisUser.value) {
      const query = createQuery() as Moralis.Query<FavoriteModel>;

      query.equalTo("user", moralisUser.value);
      query.include(["event"]);

      return await query.find();
    }
    return undefined;
  };

  /**
   * Check if event is already a favorite event
   *
   * @param  {EventModel} event
   * @returns boolean
   */
  const isFavorite = (event: EventModel): boolean => {
    if (favorites.value) {
      for (let i = 0; i < favorites.value.length; i++) {
        const favorite: FavoriteModel = favorites.value[i];
        if (favorite.attributes.event && favorite.attributes.event.id == event.id) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Set a event as new favorite event otherwise remove
   *
   * @param  {EventModel} event
   * @returns Promise
   */
  const setFavorite = async (event: EventModel): Promise<void> => {
    if (isAuthenticated.value) {
      if (!isFavorite(event)) {
        const favorite: FavoriteModel = new Favorite();
        favorite.set("user", moralisUser.value);
        favorite.set("event", event);
        await favorite.save();

        if (favorites.value) {
          favorites.value.push(favorite);
          showSuccess("Event saved to favorites");
        }
      } else {
        await removeFavorite(event);
      }
    } else {
      showError("You need to connect your wallet");
    }
  };

  /**
   * Remove event from favortie events
   *
   * @param  {EventModel} event
   * @returns Promise
   */
  const removeFavorite = async (event: EventModel): Promise<void> => {
    if (favorites.value) {
      try {
        const index = favorites.value.findIndex((item: FavoriteModel) => item.attributes.event.id == event.id);
        const favorite: FavoriteModel = new Favorite();
        favorite.id = favorites.value[index].id;
        await favorite.destroy();
        favorites.value.splice(index, 1);
        showSuccess("Event removed from favorites");
      } catch (e) {
        console.error(e);
      }
    }
  };

  return { Favorite, getFavorites, setFavorite, isFavorite };
};
