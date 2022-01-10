import Moralis from "moralis/dist/moralis.js";
import { NftMetadata, NftOwnerModel, ListedNftModel, MumbaiDepositLPModel } from "../../interfaces/models/NftOwnerModel";
import axios from "axios";
import { useContract } from "./contract";
import { useMoralis } from "./moralis";
import { useAlert } from "../layout/alert";
import { useIPFS } from "./ipfs";
import { useCurrency } from "../settings/currency";
import { BigNumber } from "bignumber.js";
import { useMoralisObject } from "./moralisObject";
import { useOdds } from "../settings/odds";
import { NFTMintStatus } from "../../interfaces/enums/NFTMintStatus";
import { ref, Ref } from "vue";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useDownload } from "../download";
import { useTimezone } from "../settings/timezone";
import { useSubscription } from "./subscription";
import { NFTTQueryParms } from "@/interfaces/queries/NFTQueryParms";
import { useChain } from "./chain";

const { bettingAbi } = useContract();
const { showError, showSuccess } = useAlert();
const placeholder = "https://via.placeholder.com/600x600.png?text=Image%20not%20found";
const NftMintStatus = NFTMintStatus;

const nfts: Ref<Array<NftOwnerModel> | undefined> = ref();

const lpNfts: Ref<Array<MumbaiDepositLPModel> | undefined> = ref();

var delistedOfferingIds: Array<string> = [];
var listedNfts: Ref<Array<ListedNftModel> | undefined> = ref();
const collectionName = "xyz"; //contract = '0xb4de4d37e5766bc3e314f3eda244b1d0c097363c'

/**
 * Get user nfts and subscribe for new nfts
 *
 * @returns Promise
 */
const getNFTs = async (): Promise<Ref<Array<NftOwnerModel> | undefined>> => {
  const { userAddress } = useMoralis();
  if (userAddress.value) {
    const { getClassName } = useChain();

    const { createQuery } = useMoralisObject(getClassName("NFTOwners"));
    const nftQuery = createQuery() as Moralis.Query<NftOwnerModel>;
    //nftQuery.equalTo("name", collectionName);
    nftQuery.equalTo("owner_of", userAddress.value);
    nftQuery.descending("block_number");
    nfts.value = (await nftQuery.find()) as Array<NftOwnerModel>;

    // Create live subscriptions
    const { subscribe, subscribeToCreate } = useSubscription();
    subscribe(nftQuery).then((subscription: Moralis.LiveQuerySubscription) => {
      subscribeToCreate(subscription, nfts.value);
    });
  }

  return nfts;
};

/**
 * NFT query create helper
 *
 * @param  {NFTTQueryParms} parms
 * @returns Moralis
 */
const getNFTQuery = (parms: NFTTQueryParms): Moralis.Query => {
  const { getClassName } = useChain();
  const { createQuery, handleQuery } = useMoralisObject(getClassName("NFTOwners"));
  const query: Moralis.Query = createQuery();
  handleQuery(query, parms);

  if (parms.filter?.tokenId) {
    query.equalTo("token_id", parms.filter?.tokenId);
  }

  return query;
};

/**
 * Mint nft from matched bet
 * TODO can be more then one matched bet, becuase of partial matches
 *
 * @param object
 * @param base64
 * @returns Promise
 */
const mint = async (matchedBet: MatchedBetModel, blob: Blob, customMessage: any): Promise<void> => {
  const { userAddress, web3 } = useMoralis();

  if (userAddress.value) {
    const tokenId = getTokenId(matchedBet, userAddress.value);

    const { blobToB64 } = useDownload();
    const base64 = (await blobToB64(blob)) as string;

    const { saveJsonToIPFS, saveBase64ImageToIPFS } = useIPFS();
    const image = await saveBase64ImageToIPFS(matchedBet.id, base64); // save image to ipfs
    const metadata = generateMetadata(matchedBet, tokenId, image.ipfs()); // generate metadata with image

    if (metadata) {
      const tokenUri = await saveJsonToIPFS(matchedBet.id, metadata); // save metadata to ipfs

      const { getBettingContract } = useContract();
      const contractAddr = await getBettingContract();
      const contract = new web3.value.eth.Contract(bettingAbi, contractAddr);

      setTimeout(() => {
        customMessage.message = "Waiting for user confirmation";
      }, 2000);

      contract.methods
        .transferBetToNFT(matchedBet.get("apiId"), matchedBet.get("betSide"), 0, matchedBet.get("selection"), matchedBet.get("odds"), tokenUri.ipfs())
        .send(
          {
            from: userAddress.value,
          },
          async (err: any, result: any) => {
            if (!err) {
              matchedBet.set("isMinted", true);
              matchedBet.set("tokenId", tokenId);
              await matchedBet.save();
              customMessage.show = false;
              showSuccess("Bet successfully minted, wait for confirmation");
            } else {
              showError(err.message);
              customMessage.show = false;
            }
          }
        );
    }
  }
};

/**
 * Generates NFT Token Id from matched bet
 *
 * @param  {MatchedBetModel} matchedBet
 * @returns string
 */
const getTokenId = (matchedBet: MatchedBetModel, address: string): string => {
  const { web3 } = useMoralis();
  const hashedTokenId = web3.value.utils.keccak256(
    web3.value.eth.abi.encodeParameters(
      ["string", "address", "uint8", "uint8", "uint8", "uint16"],
      [
        matchedBet.attributes.apiId,
        address,
        Number(matchedBet.attributes.betSide),
        Number(matchedBet.attributes.betType),
        Number(matchedBet.attributes.selection),
        Number(matchedBet.attributes.odds),
      ]
    )
  );

  const converted = web3.value.utils.toBN(hashedTokenId);
  const convertedAnd = web3.value.utils.toBN("0xfff");

  const tokenId = converted.and(convertedAnd).toNumber();
  return String(tokenId);
};

/**
 * Generate metadata for nft
 *
 * @param  {MatchedBetModel} matchedBet
 * @param  {string} imageUrl
 * @returns NftMetadata
 */
const generateMetadata = (matchedBet: MatchedBetModel, tokenId: string, imageUrl: string): NftMetadata | undefined => {
  if (matchedBet.attributes.event) {
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const { format, selectedTimezone } = useTimezone();
    const eventName = matchedBet.attributes.event.getName();

    let position = "";
    if (matchedBet.get("selection") == 1) {
      position = "Home";
    } else if (matchedBet.get("selection") == 2) {
      position = "Away";
    } else if (matchedBet.get("selection") == 3) {
      position = "Draw";
    }

    return {
      name: eventName + " Bet #" + tokenId,
      description: "Bet Details from Match " + eventName,
      external_url: "",
      image: imageUrl,
      attributes: [
        {
          trait_type: "Match",
          value: eventName,
        },
        {
          trait_type: "Event Id",
          value: matchedBet.get("apiId"),
        },
        {
          trait_type: "Start",
          value: format(matchedBet.attributes.event.get("start"), "YYYY-MM-DD HH:mm") + " " + selectedTimezone.value.tzCode,
        },
        {
          trait_type: "League",
          value: matchedBet.attributes.event.attributes.league.attributes.name,
        },
        {
          trait_type: "Season",
          value: String(matchedBet.attributes.event.attributes.league.attributes.season),
        },
        {
          trait_type: "Side",
          value: matchedBet.get("betSide") == 0 ? "Back" : "Lay",
        },
        {
          trait_type: "Bet Type",
          value: "Match Winner",
        },
        {
          trait_type: "Position",
          value: position,
        },
        {
          trait_type: "Odds",
          value: new BigNumber(decodeOdds(matchedBet.get("odds"))),
        },
        {
          trait_type: "Amount",
          value: new BigNumber(convertCurrency(matchedBet.get("amount"))),
        },
      ],
    };
  }
};

/**
 * Get Opensea link from web3api nft
 *
 * @param nft
 * @returns
 */
const getOpenseaLink = (nft: NftOwnerModel): string => {
  return "https://testnets.opensea.io/assets/mumbai/0xb4de4d37e5766bc3e314f3eda244b1d0c097363c/" + nft?.attributes?.token_id;
};

/**
 * Resolve metadata from moralis nft model
 *
 * @param  {NftOwnerPendingModel|NftOwnerModel} nft
 * @returns Promise
 */
const resolveMetadataFromNft = async (uri: string): Promise<NftMetadata | undefined> => {
  try {
    const response = await axios.get(uri);
    if (response) {
      return response.data;
    }
  } catch (err) {
    console.log(uri + " fetch resulted in error = " + err);
  }
};

const getNFTsDeListedOnMarketplace = async () => {
  const queryAll = new Moralis.Query("MumbaiClosedOfferings");
  //queryAll.equalTo("hostContract", "0xb4de4d37e5766bc3e314f3eda244b1d0c097363c");

  const deListedNfts: Ref<Array<ListedNftModel> | undefined> = ref();
  deListedNfts.value = (await queryAll.find()) as Array<ListedNftModel>;
  console.log("getNFTsDeListedOnMarketplace");
  console.log(deListedNfts);
  deListedNfts.value.forEach((nft: ListedNftModel) => {
    delistedOfferingIds.push(nft.attributes.offeringId);
  });
};

const getNFTsListedOnMarketplace = async (): Promise<Ref<Array<ListedNftModel> | undefined>> => {
  const queryAll = new Moralis.Query("MumbaiPlacedOfferings");
  //queryAll.equalTo("tokenId", "2");
  //queryAll.equalTo("hostContract", "0xec3cd0be96e26841ed17cf9e8585b00926488cd5");

  listedNfts.value = (await queryAll.find()) as Array<ListedNftModel>;
  console.log("getNFTsListedOnMarketplace");
  console.log(listedNfts);
  //console.log('Total number of nfts fetched from db = ' + listedNfts.value.length);

  await getNFTsDeListedOnMarketplace();
  //console.log(delistedOfferingIds);

  /**
   * Resolve metadata from nft
   */
  listedNfts.value.forEach(async (nft: ListedNftModel, index) => {
    let notFound = true;
    delistedOfferingIds.forEach((delistedOffering: string) => {
      if (nft.attributes.offeringId == delistedOffering) {
        notFound = false;
      }
    });
    if (notFound) {
      console.log("pushing this nft index = " + index);
      //console.log(nft);
      nft.parsed_metadata = await resolveMetadataFromNft(nft.attributes.uri);
      if (nft.parsed_metadata) {
        //console.log('printing metadata')
        //console.log(nft.parsed_metadata);
      } else {
        //console.log("if metadata is undefined, don't bother with this nft. index = " + index);
        listedNfts?.value?.splice(index, 1);
        //console.log('number of nfts are removing for metadata problem = ' + listedNfts.value.length);
      }
    } else {
      //console.log('Ignoring this nft since it is no longer listed, index = ' + index);
      //console.log(nft);
      listedNfts?.value?.splice(index, 1);
      //console.log(listedNfts);
    }
  });

  //console.log(listedNfts);
  console.log("number of nfts are filtering = " + listedNfts.value.length);
  return listedNfts;
};

/**
 * Get user nfts and subscribe for new nfts
 *
 * @returns Promise
 */
const getDepositLPNFTs = async (): Promise<Ref<Array<MumbaiDepositLPModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    // Get nfts from user
    const { createQuery } = useMoralisObject("MumbaiDepositLP");
    const nftQuery = createQuery() as Moralis.Query<MumbaiDepositLPModel>;
    //nftQuery.equalTo("name", collectionName);
    //nftQuery.equalTo("owner_of", moralisUser.value.get("ethAddress"));
    lpNfts.value = (await nftQuery.find()) as Array<MumbaiDepositLPModel>;
    console.log(lpNfts);
    console.log(lpNfts.value);
  }
  return lpNfts;
};

export const useNFTs = () => {
  return {
    NftMintStatus,
    placeholder,
    getNFTs,
    getNFTQuery,
    getTokenId,
    mint,
    collectionName,
    getOpenseaLink,
    resolveMetadataFromNft,
    getNFTsListedOnMarketplace,
    getNFTsDeListedOnMarketplace,
    getDepositLPNFTs,
  };
};
