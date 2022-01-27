import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { useContract } from "./contract";
import { useMoralis } from "./moralis";
import { useNFTs } from "./nfts";
import { useIPFS } from "./ipfs";
import { useAlert } from "../layout/alert";

export const useMarketMaker = () => {
  const { userAddress, web3 } = useMoralis();
  const { marketMakerContract, marketMakerContractAddress } = useContract();
  const { showError, showSuccess } = useAlert();

  const getTotalDeposits = async (): Promise<string | undefined> => {
    console.log("getTotalDeposits");
    if (marketMakerContract.value) {
      try {
        return await marketMakerContract.value.methods.getTotalDeposit().call();
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  const depositLiquidity = async (liqidity: string, base64Image: string) => {
    if (userAddress.value) {
      const { generateLPTokenURI } = useNFTs();
      const { saveBase64ImageToIPFS } = useIPFS();

      const image = await saveBase64ImageToIPFS(userAddress.value, base64Image);
      const amount = web3.value.utils.toWei(liqidity, "ether");
      const uri = await generateLPTokenURI(marketMakerContractAddress.value, amount.toString(), image.ipfs());

      marketMakerContract.value.methods
        .deposit(uri)
        .send({ from: userAddress.value, value: amount })
        .on("transactionHash", (hash: any) => {
          showSuccess("Deposit completed, your NFT will be sended");
        })
        .catch((err: any) => {
          showError();
          console.log(err);
        });
    }
  };

  const withdrawLP = async (nft: NftOwnerModel) => {
    if (userAddress.value) {
      console.log("Attempting to withdraw NFT : ", nft);
      marketMakerContract.value.methods
        .withdraw(nft.attributes.token_id)
        .send({ from: userAddress.value })
        .on("transactionHash", (hash: any) => {
          console.log("Withdraw Completed. Hash = ", hash);
        })
        .catch((err: any) => {
          console.log("Withdraw Failed: " + err.message);
        });
    }
  };

  return { getTotalDeposits, depositLiquidity, withdrawLP };
};
