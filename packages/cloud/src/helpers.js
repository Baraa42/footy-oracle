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
  const urlReg = /^(https):\/\/[^ "]+$/;
  if (
    !nft.get("token_uri") ||
    nft.get("token_uri") == "" ||
    !urlReg.test(nft.get("token_uri"))
  ) {
    return {};
  }

  const timeout = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject("Time out! Your promise couldnt be fulfilled in 10 seconds :c");
    }, 10000);
  });

  const request = Moralis.Cloud.httpRequest({
    url: nft.get("token_uri"),
    followRedirects: true,
  });

  try {
    const response = await Promise.race([request, timeout]);
    if (response) {
      return Object.assign({}, response.data);
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
  try {
    return metadata.attributes.filter(
      (attribute) => attribute.trait_type === "Event Id"
    )[0].value;
  } catch (e) {
    return undefined;
  }
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
 * Get event by its api id
 *
 * @param  {} apiId
 * @returns
 */
const getEventByApiId = async (apiId) => {
  const eventQuery = new Moralis.Query(Event);
  eventQuery.equalTo("apiId", Number(apiId));
  const eventResult = await eventQuery.first();

  if (!eventResult) throw "No valid event id";
  return eventResult;
};

/**
 * Get user by its address
 *
 * @param  {} address
 * @returns
 */
const getUserByAddress = async (address) => {
  const userQuery = new Moralis.Query(Moralis.User);
  userQuery.equalTo("ethAddress", address);
  const user = await userQuery.first({ useMasterKey: true });

  if (!user) throw "No valid address";
  return user;
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
