/**
 * Add account for deploying smart contracts and sending tokens
 */
const addAccount = async () => {
  const config = await Moralis.Config.get({ useMasterKey: true });
  const privateKey = config.get("private_key");
  web3.eth.accounts.wallet.add("0x" + privateKey);
};

/**
 * Send 0.1 link token to smart contract
 *
 * @param {string} receiver
 * @returns
 */
const sendLink = async (receiver) => {
  const gasPrice = await web3.eth.getGasPrice();
  const gas = await chainlink.methods
    .transfer(receiver, "100000000000000000")
    .estimateGas({ from: account });
  const result = await chainlink.methods
    .transfer(receiver, "100000000000000000")
    .send({
      from: account,
      gasPrice: gasPrice * 1.2,
      gas: gas * 2,
    });
  return result;
};

/**
 * Resolve metadata from nft
 *
 * @param {*} nft
 * @returns
 */
const resolveMetadataFromNft = async (nft) => {
  try {
    const response = await Moralis.Cloud.httpRequest({
      url: nft.get("token_uri"),
    });
    if (response) {
      return response.data;
    }
  } catch (e) {
    const logger = Moralis.Cloud.getLogger();
    logger.error(e.toString());
    return {};
  }
};

/**
 * Parse event api id from nft metadata
 *
 * @param {*} string
 * @returns
 */
const parseEventApiIdFromMetadata = (metadata) => {
  return metadata.attributes.filter(
    (attribute) => attribute.trait_type === "Event Id"
  )[0].value;
};

/**
 * Parse token id from nft metadata
 *
 * @param {*} string
 * @returns
 */
const parseTokenIdFromMetadata = (metadata) => {
  return metadata.name.match(/(?<=#).*$/gs)[0].trim();
};

/**
 * Helper for create new team
 *
 * @param  {} apiId
 * @param  {} name
 * @param  {} isNational
 * @param  {} logo
 * @param  {} country
 */
const createTeam = async (apiId, name, isNational, logo, country) => {
  const team = new Team();
  team.set("apiId", apiId);
  team.set("name", name);
  team.set("isNational", isNational);
  team.set("logo", logo);
  team.set("country", country);
  await team.save();
  return team;
};
