import { NftMetadata, NftOwnerModel, NftOwnerPendingModel } from "../../interfaces/models/NftOwnerModel";
import axios from "axios";
import { useContract } from "./contract";
import { useMoralis } from "./moralis";
import { Moralis as MoralisTypes } from "moralis/types";
import Moralis from "moralis/dist/moralis.js";
import { useAlert } from "../layout/alert";
import { useIPFS } from "./ipfs";
import { useCurrency } from "../settings/currency";
import { BigNumber } from "bignumber.js";
import { useMoralisObject } from "./moralisObject";
import { useOdds } from "../settings/odds";
import { NFTMintStatus } from "../../interfaces/enums/NFTMintStatus";
import { ref, Ref } from "vue";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";

const { abi } = useContract();
const { showError, showSuccess } = useAlert();
const placeholder = "https://via.placeholder.com/600x600.png?text=Image%20not%20found";
const NftMintStatus = NFTMintStatus;

const nfts: Ref<Array<NftOwnerModel> | undefined> = ref();
const nftSubscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();
const collectionName = "xyz";

/**
 * Get user nfts and subscribe for new nfts
 *
 * @returns Promise
 */
const getNFTs = async (): Promise<Ref<Array<NftOwnerModel> | undefined>> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    /**
     * Get nfts from user
     */
    const { Object: PolygonNFTOwners, createQuery } = useMoralisObject("PolygonNFTOwners");
    const nftQuery: MoralisTypes.Query<NftOwnerModel> = createQuery();
    nftQuery.equalTo("name", collectionName);
    nftQuery.equalTo("owner_of", moralisUser.value.get("ethAddress"));
    nftQuery.descending("block_number");
    nfts.value = (await nftQuery.find()) as Array<NftOwnerModel>;

    /**
     * Resolve metadata from nft
     */
    nfts.value.forEach(async (nft: NftOwnerModel) => {
      nft.parsed_metadata = await resolveMetadataFromNft(nft);
    });

    /**
     * Create live subscription
     */
    if (nftSubscription.value) {
      nftSubscription.value.unsubscribe();
    }
    nftSubscription.value = await nftQuery.subscribe();

    nftSubscription.value.on("create", async (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
      const nft = object as NftOwnerModel;
      console.log("Subscription: NFT created " + nft.attributes.token_id);
      nft.parsed_metadata = await resolveMetadataFromNft(nft);
      nfts.value?.push(nft);
    });
  }

  return nfts;
};

/**
 * Mint nft from matched bet
 *
 * @param object
 * @param base64
 * @returns Promise
 */
const mint = async (matchedBet: MatchedBetModel, base64: string): Promise<void> => {
  const { moralisUser } = useMoralis();
  if (moralisUser.value) {
    const { saveJsonToIPFS, saveBase64ImageToIPFS } = useIPFS();
    const fileName = matchedBet.get("eventId") + "-" + matchedBet.get("betId");
    const image = await saveBase64ImageToIPFS(fileName, base64); // save image to ipfs
    const metadata = generateMetadata(matchedBet, image.ipfs()); // generate metadata with image

    if (metadata) {
      const tokenUri = await saveJsonToIPFS(fileName, metadata); // save metadata to ipfs
      const web3 = await Moralis.Web3.enable();
      const contract = new web3.eth.Contract(JSON.parse(abi), matchedBet.event?.get("polygonContract"));

      contract.methods.transferBetToNFT(matchedBet.get("betId"), tokenUri.ipfs()).send(
        {
          from: moralisUser.value.get("ethAddress"),
        },
        async (err: any, result: any) => {
          if (!err) {
            matchedBet.set("isMinted", true);
            await matchedBet.save();
            showSuccess("Bet successfully minted, wait for confirmation");
          }
        }
      );
    }
  }
};

/**
 * Generate metadata for nft
 *
 * @param  {MatchedBetModel} matchedBet
 * @param  {string} imageUrl
 * @returns NftMetadata
 */
const generateMetadata = (matchedBet: MatchedBetModel, imageUrl: string): NftMetadata | undefined => {
  if (matchedBet.event) {
    const { convertCurrency } = useCurrency();
    const { convertOdds } = useOdds();
    const event = matchedBet.event.get("home") + " vs. " + matchedBet.event.get("away");

    let selection = "";
    if (matchedBet.get("betType") == 0) {
      if (matchedBet.get("selection") == 0) {
        selection = matchedBet.event.get("home") + " win";
      } else if (matchedBet.get("selection") == 1) {
        selection = matchedBet.event.get("away") + " win";
      } else {
        selection = "Draw win";
      }
    } else {
      if (matchedBet.get("selection") == 0) {
        selection = matchedBet.event.get("home") + " lose";
      } else if (matchedBet.get("selection") == 1) {
        selection = matchedBet.event.get("away") + " lose";
      } else {
        selection = "Draw lose";
      }
    }

    return {
      name: "Event " + matchedBet.get("eventId") + " Bet " + matchedBet.get("betId"),
      description: "Bet Details from Match " + event,
      external_url: "https://openseacreatures.io/3",
      image: imageUrl,
      attributes: [
        {
          trait_type: "Match",
          value: event,
        },
        {
          trait_type: "Position",
          value: selection,
        },
        {
          trait_type: "Amount",
          value: new BigNumber(convertCurrency(matchedBet.get("amount"))),
        },
        {
          trait_type: "Odds",
          value: new BigNumber(convertOdds(matchedBet.get("odds"))),
        },
        {
          trait_type: "Start",
          value: matchedBet.event.get("start"),
        },
        {
          trait_type: "Event Id",
          value: matchedBet.get("eventId"),
        },
        {
          trait_type: "Bet Id",
          value: matchedBet.get("betId"),
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
const resolveMetadataFromNft = async (nft: NftOwnerPendingModel | NftOwnerModel): Promise<NftMetadata | undefined> => {
  try {
    const response = await axios.get(nft.attributes.token_uri);
    if (response) {
      return response.data;
    }
  } catch (err) {
    //console.log(err);
  }
};

export const useNFTs = () => {
  return {
    NftMintStatus,
    placeholder,
    getNFTs,
    mint,
    collectionName,
    getOpenseaLink,
    resolveMetadataFromNft,
  };
};