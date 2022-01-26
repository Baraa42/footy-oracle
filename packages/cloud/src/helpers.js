/**
 * Add account for deploying smart contracts and sending tokens
 */
const addAccount = async (web3Chain) => {
  const config = await Moralis.Config.get({ useMasterKey: true });
  const privateKey = config.get("private_key");
  web3Chain.eth.accounts.wallet.add("0x" + privateKey);
};

/**
 * Helper for getting moralis config
 *
 * @param {*} name
 * @param {*} useMasterKey
 * @returns
 */
const getConfig = async (name, useMasterKey = false) => {
  const config = await Moralis.Config.get({ useMasterKey: useMasterKey });
  return config.get(name);
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

  if (user) {
    return user;
  }
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
