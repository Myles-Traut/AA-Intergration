import { createWalletClient, custom } from "viem";
import { goerli } from "viem/chains";
import { WalletClientSigner } from "@alchemy/aa-core";

export const useEoaSigner = () => {

    const client = createWalletClient({
        chain: goerli,
        transport: custom(window.ethereum),
      });
      
      // this can now be used as an owner for a Smart Contract Account
      const eoaSigner = new WalletClientSigner(
        client,
        "json-rpc" //signerType
      );

    return {signer : eoaSigner}
}
