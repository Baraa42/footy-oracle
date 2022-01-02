import { Moralis as MoralisTypes } from "moralis/types";
import { Ref, ref } from "vue";

/**
 * Helper for push new object into array
 *
 * @param  {MoralisTypes.Object<MoralisTypes.Attributes>} object
 * @param  {Array<any>} array
 * @returns void
 */
const onCreateFunction = (object: MoralisTypes.Object<MoralisTypes.Attributes>, array: Array<any> | undefined): void => {
  if (array) {
    array.push(object);
  }
};

/**
 * Helper for updating object inside array
 *
 * @param  {MoralisTypes.array<MoralisTypes.Attributes>} object
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns
 */
const onUpdateFunction = (object: MoralisTypes.Object<MoralisTypes.Attributes>, array: Array<any> | undefined, findByKey: string) => {
  if (array) {
    let check = (object as any)[findByKey];
    if (!check) {
      check = object.attributes[findByKey];
    }
    const index = array.findIndex((item: any) => item[findByKey] == check);

    if (index != -1) {
      array[index] = object;
      return array[index];
    }
  }
};

/**
 * Helper for removing object inside array
 *
 * @param  {MoralisTypes.Object<MoralisTypes.Attributes>} object
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const onRemoveFunction = (object: MoralisTypes.Object<MoralisTypes.Attributes>, array: Array<any> | undefined, findByKey: string): void => {
  if (array) {
    let check = (object as any)[findByKey];
    if (!check) {
      check = object.attributes[findByKey];
    }
    const index = array.findIndex((item: any) => item[findByKey] == check);

    if (index != -1) {
      array.splice(index, 1);
    }
  }
};

/**
 * Subscribes to on create with helper function
 *
 * @param  {MoralisTypes.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @returns void
 */
const subscribeToCreate = (subscription: MoralisTypes.LiveQuerySubscription, array: Array<any> | undefined): void => {
  subscription.on("create", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => onCreateFunction(object, array));
};

/**
 * Subscribes to on update with helper function
 *
 * @param  {MoralisTypes.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToUpdate = (subscription: MoralisTypes.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("update", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => onUpdateFunction(object, array, findByKey));
};

/**
 * Subscribes to on delete with helper function
 *
 * @param  {MoralisTypes.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToDelete = (subscription: MoralisTypes.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("delete", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => onRemoveFunction(object, array, findByKey));
};

/**
 * Subscribes to on leave with helper function
 *
 * @param  {MoralisTypes.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToLeave = (subscription: MoralisTypes.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("leave", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => onRemoveFunction(object, array, findByKey));
};

/**
 * Subscription helper
 *
 * @returns
 */
export const useSubscription = () => {
  const subscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();

  const subscribe = async (query: MoralisTypes.Query<any>): Promise<MoralisTypes.LiveQuerySubscription> => {
    subscription.value = await query.subscribe();
    return subscription.value;
  };

  const unsubscribe = () => {
    subscription.value?.unsubscribe();
  };

  return {
    subscribe,
    unsubscribe,
    onCreateFunction,
    onUpdateFunction,
    onRemoveFunction,
    subscribeToCreate,
    subscribeToUpdate,
    subscribeToDelete,
    subscribeToLeave,
  };
};
