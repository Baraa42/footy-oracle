import { NftMetadata, NftOwnerModel, NftOwnerPendingModel, ListedNftModel } from "../../interfaces/models/NftOwnerModel";
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

var delistedOfferingIds : Array<string> = [];
var listedNfts: Ref<Array<ListedNftModel> | undefined> = ref();

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
    //nftQuery.equalTo("name", collectionName);
    nftQuery.equalTo("owner_of", moralisUser.value.get("ethAddress"));
    nftQuery.descending("block_number");
    nfts.value = (await nftQuery.find()) as Array<NftOwnerModel>;
    console.log(nfts.value);

    /**
     * Resolve metadata from nft
     */
    nfts.value.forEach(async (nft: NftOwnerModel, index) => {
      nft.parsed_metadata = await resolveMetadataFromNft(nft.attributes.token_uri);
      if (nft.parsed_metadata) {
        console.log('printing metadata')
        console.log(nft.parsed_metadata);        
      }
      else {
        console.log("if metadata is undefined, don't bother with this nft. index = " + index);
        nfts.value.splice(index, 1);
        console.log('number of nfts are removing for metadata problem = ' + nfts.value.length);
      }
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
      nft.parsed_metadata = await resolveMetadataFromNft(nft.attributes.token_uri);
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
const resolveMetadataFromNft = async (uri: string): Promise<NftMetadata | undefined> => {
  try {
    const response = await axios.get(uri);
    if (response) {
      return response.data;
    }
  } catch (err) {
    console.log(uri + ' -> ' + err);
  }
};

const getNFTsDeListedOnMarketplace = async ()  =>  {
  const queryAll = new Moralis.Query("ClosedOfferings");
  const deListedNfts: Ref<Array<ListedNftModel> | undefined> = ref();
  deListedNfts.value = (await queryAll.find()) as Array<ListedNftModel>;
  console.log('getNFTsDeListedOnMarketplace');
  console.log(deListedNfts);
  deListedNfts.value.forEach((nft : ListedNftModel) => {
    delistedOfferingIds.push(nft.attributes.offeringId);
  });
}

const getNFTsListedOnMarketplace = async () : Promise<Ref<Array<ListedNftModel> | undefined>> =>  {
  const queryAll = new Moralis.Query("PlacedOfferings");
  //queryAll.equalTo("tokenId", "2");
  //queryAll.equalTo("hostContract", "0x802b6a0eeb65f58d93b6c443f1fa5424f3d71709");
  
  listedNfts.value = (await queryAll.find()) as Array<ListedNftModel>;
  console.log('getNFTsListedOnMarketplace');
  console.log(listedNfts);
  console.log('Total number of nfts fetched from db = ' + listedNfts.value.length);

  await getNFTsDeListedOnMarketplace();
  console.log(delistedOfferingIds);
  
  /**
   * Resolve metadata from nft
  */
  listedNfts.value.forEach(async (nft: ListedNftModel, index) => {
    let notFound = true;
    delistedOfferingIds.forEach((delistedOffering : string) => {
      if (nft.attributes.offeringId == delistedOffering) {
        notFound = false;
      }
    })
    if (notFound) {
      console.log('pushing this nft index = ' + index);
      //console.log(nft);
      nft.parsed_metadata = await resolveMetadataFromNft(nft.attributes.uri);
      //console.log(listedNfts);
      if (nft.parsed_metadata) {
        console.log('printing metadata')
        console.log(nft.parsed_metadata);        
      }
      else {
        console.log("if metadata is undefined, don't bother with this nft. index = " + index);
        listedNfts.value.splice(index, 1);
        console.log('number of nfts are removing for metadata problem = ' + listedNfts.value.length);
      }
    }
    else {
      console.log('Ignoring this nft since it is no longer listed, index = ' + index);
      //console.log(nft);
      listedNfts.value.splice(index, 1);
      //console.log(listedNfts);
    }    
  });

  //console.log(listedNfts);
  console.log('number of nfts are filtering = ' + listedNfts.value.length);
  return listedNfts;
}

export const useNFTs = () => {
  return {
    NftMintStatus,
    placeholder,
    getNFTs,
    mint,
    collectionName,
    getOpenseaLink,
    resolveMetadataFromNft,
    getNFTsListedOnMarketplace,
    getNFTsDeListedOnMarketplace
  };
};
