import { ref, Ref } from "vue";
import { useContract } from "./contract";
import { Contract } from "web3-eth-contract";
import { useMoralis } from "./moralis";
import { useNFTs } from "./nfts";
import { useIPFS } from "./ipfs";
import { useAlert } from "../layout/alert";

const marketMakerContract = <Ref<Contract>>ref();
const marketMakerContractAddress = <Ref<string>>ref();

export const useMarketMaker = () => {
  const { userAddress, web3, isAuthenticated, isWeb3Enabled } = useMoralis();
  const { marketMakerAbi, getMarketMakerContractAddress } = useContract();
  const { showError, showSuccess } = useAlert();

  if (!marketMakerContractAddress.value) {
    getMarketMakerContractAddress().then((address: string) => {
      marketMakerContractAddress.value = address;
      marketMakerContract.value = new web3.value.eth.Contract(marketMakerAbi, marketMakerContractAddress.value);
    });
  }

  const getTotalDeposits = async (): Promise<string | undefined> => {
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

  const withdrawLP = async (nft: any) => {
    console.log("Attempting to withdraw NFT : ", nft);
    marketMakerContract.value.methods
      .withdraw(nft.attributes.tokenId)
      .send({ from: userAddress.value })
      .on("transactionHash", (hash: any) => {
        console.log("Withdraw Completed. Hash = ", hash);
      })
      .catch((err: any) => {
        console.log("Withdraw Failed: " + err.message);
      });
  };

  return { getTotalDeposits, depositLiquidity, withdrawLP };
};
