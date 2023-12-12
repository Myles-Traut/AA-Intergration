import { createWalletClient, custom } from "viem";
import { polygon } from "viem/chains";
import { WalletClientSigner } from "@alchemy/aa-core";
import { useEffect, useState } from "react";

export const useEoaSigner = () => {
  const [client, setClient] = useState<any>();

  useEffect(() => {
    if (window.ethereum) {
      setClient(
        createWalletClient({
          chain: polygon,
          transport: custom(window.ethereum),
        })
      );
    }
  }, [setClient]);

  // this can now be used as an owner for a Smart Contract Account
  const eoaSigner = new WalletClientSigner(
    client,
    "json-rpc" //signerType
  );

  return { signer: eoaSigner };
};
