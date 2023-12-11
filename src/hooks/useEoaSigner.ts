import { Address, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// import { mnemonicToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { WalletClientSigner } from "@alchemy/aa-core";

export const useEoaSigner = () => {
    // if you have a mnemonic, viem also exports a mnemonicToAccount function (see above import)
    
    // const account = privateKeyToAccount("0x42f282787d0568d28b7408bf8da906919a9e493000a07e8a9ce8f66c50e94e16");
    // const account = privateKeyToAccount("0x576a70e6865ffca9f610f6d8ff5367aa9a3c4f068b98842aa8fae3883c790362");

    // This client can now be used to do things like `eth_requestAccounts`
    // const client = createWalletClient({
    //     account,
    //     chain: goerli,
    //     transport: http(),
    // });

    const client = createWalletClient({
        chain: goerli,
        transport: custom(window.ethereum),
      });
      
      // this can now be used as an owner for a Smart Contract Account
      const eoaSigner = new WalletClientSigner(
        client,
        "json-rpc" //signerType
      );

    // this can now be used as an owner for a Smart Contract Account
    // const eoaSigner = new WalletClientSigner(
    //     client,
    //     "local" // signerType
    // );

    return {signer : eoaSigner}
}
