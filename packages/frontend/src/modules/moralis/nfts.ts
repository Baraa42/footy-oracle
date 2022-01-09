import Moralis from "moralis/dist/moralis.js";
import { NftMetadata, NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
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

const { bettingAbi } = useContract();
const { showError, showSuccess } = useAlert();
const placeholder = "https://via.placeholder.com/600x600.png?text=Image%20not%20found";
const NftMintStatus = NFTMintStatus;

const nfts: Ref<Array<NftOwnerModel> | undefined> = ref();

const collectionName = "xyz"; //contract = '0xb4de4d37e5766bc3e314f3eda244b1d0c097363c'

/**
 * Get user nfts and subscribe for new nfts
 *
 * @returns Promise
 */
const getNFTs = async (): Promise<Ref<Array<NftOwnerModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    // Get nfts from user
    const { createQuery } = useMoralisObject("PolygonNFTOwners");
    const nftQuery = createQuery() as Moralis.Query<NftOwnerModel>;
    //nftQuery.equalTo("name", collectionName);
    nftQuery.equalTo("owner_of", moralisUser.value.get("ethAddress"));
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

const getNFTQuery = (parms: NFTTQueryParms): Moralis.Query => {
  const { createQuery, handleQuery } = useMoralisObject("PolygonNFTOwners");
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
  const { moralisUser } = useMoralis();
  const { blobToB64 } = useDownload();
  const { saveJsonToIPFS, saveBase64ImageToIPFS } = useIPFS();
  if (moralisUser.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const polygonContract = config.get("polygon_contract");

    const tokenId = getTokenId(matchedBet, moralisUser.value.get("ethAddress"));
    const base64 = (await blobToB64(blob)) as string;
    const image = await saveBase64ImageToIPFS(matchedBet.id, base64); // save image to ipfs
    const metadata = generateMetadata(matchedBet, tokenId, image.ipfs()); // generate metadata with image

    if (metadata) {
      const tokenUri = await saveJsonToIPFS(matchedBet.id, metadata); // save metadata to ipfs
      const web3 = await Moralis.Web3.enable();
      const contract = new web3.eth.Contract(bettingAbi, polygonContract);

      console.log(tokenUri.ipfs());

      setTimeout(() => {
        customMessage.message = "Waiting for user confirmation";
      }, 2000);

      contract.methods
        .transferBetToNFT(matchedBet.get("apiId"), matchedBet.get("betSide"), 0, matchedBet.get("selection"), matchedBet.get("odds"), tokenUri.ipfs())
        .send(
          {
            from: moralisUser.value.get("ethAddress"),
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
  };
};
