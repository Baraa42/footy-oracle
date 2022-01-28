import Moralis from "moralis/dist/moralis.js";
import { onUnmounted, Ref, ref } from "vue";

/**
 * Helper for push new object into array
 *
 * @param  {Moralis.Object<Moralis.Attributes>} object
 * @param  {Array<any>} array
 * @returns void
 */
const onCreateFunction = (object: Moralis.Object<Moralis.Attributes>, array: Array<any> | undefined): void => {
  if (array) {
    array.push(object);
  }
};

/**
 * Helper for updating object inside array
 *
 * @param  {Moralis.array<Moralis.Attributes>} object
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns
 */
const onUpdateFunction = (object: Moralis.Object<Moralis.Attributes>, array: Array<any> | undefined, findByKey: string) => {
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
 * @param  {Moralis.Object<Moralis.Attributes>} object
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const onRemoveFunction = (object: Moralis.Object<Moralis.Attributes>, array: Array<any> | undefined, findByKey: string): void => {
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
 * @param  {Moralis.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @returns void
 */
const subscribeToCreate = (subscription: Moralis.LiveQuerySubscription, array: Array<any> | undefined): void => {
  subscription.on("create", (object: Moralis.Object<Moralis.Attributes>) => onCreateFunction(object, array));
};

/**
 * Subscribes to on update with helper function
 *
 * @param  {Moralis.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToUpdate = (subscription: Moralis.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("update", (object: Moralis.Object<Moralis.Attributes>) => onUpdateFunction(object, array, findByKey));
};

/**
 * Subscribes to on delete with helper function
 *
 * @param  {Moralis.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToDelete = (subscription: Moralis.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("delete", (object: Moralis.Object<Moralis.Attributes>) => onRemoveFunction(object, array, findByKey));
};

/**
 * Subscribes to on leave with helper function
 *
 * @param  {Moralis.LiveQuerySubscription} subscription
 * @param  {Array<any>} array
 * @param  {string} findByKey
 * @returns void
 */
const subscribeToLeave = (subscription: Moralis.LiveQuerySubscription, array: Array<any> | undefined, findByKey: string): void => {
  subscription.on("leave", (object: Moralis.Object<Moralis.Attributes>) => onRemoveFunction(object, array, findByKey));
};

/**
 * Subscription helper
 *
 * @returns
 */
export const useSubscription = () => {
  const subscription: Ref<Moralis.LiveQuerySubscription | undefined> = ref();

  const subscribe = async (query: Moralis.Query<any>): Promise<Moralis.LiveQuerySubscription> => {
    subscription.value = await query.subscribe();
    return subscription.value;
  };

  const unsubscribe = () => {
    subscription.value?.unsubscribe();
  };

  onUnmounted(() => {
    console.log("onUnmounted");
    unsubscribe();
  });

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
