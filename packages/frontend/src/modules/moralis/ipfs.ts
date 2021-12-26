import Moralis from "moralis/dist/moralis.js";

/**
 * Save json file to ipfs
 *
 * @param  {string} name
 * @param  {object} json
 * @returns Promise
 */
const saveJsonToIPFS = async (name: string, json: object): Promise<any> => {
  const file = new Moralis.File(name + ".json", {
    base64: btoa(JSON.stringify(json)),
  });
  await file.saveIPFS();
  return file;
};

/**
 * Save base64 image to ipfs
 *
 * @param  {string} name
 * @param  {object} json
 * @returns Promise
 */
const saveBase64ImageToIPFS = async (name: string, image: string): Promise<any> => {
  const file = new Moralis.File(name + ".png", { base64: image });
  await file.saveIPFS();
  return file;
};

/**
 * Save base64 image to ipfs
 *
 * @param  {string} name
 * @param  {object} json
 * @returns Promise
 */
const saveBlobToIPFS = async (name: string, image: string): Promise<any> => {
  const file = new Moralis.File(name + ".png", { base64: image });
  await file.saveIPFS();
  return file;
};

export const useIPFS = () => {
  return { saveJsonToIPFS, saveBase64ImageToIPFS };
};
