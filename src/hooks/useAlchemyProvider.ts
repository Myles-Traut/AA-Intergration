import { SmartAccountSigner, WalletClientSigner, getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { AlchemyProvider } from '@alchemy/aa-alchemy';
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts';
import { chain, alchemyApiKey } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import { useCallback, useState } from "react";
import { polygon } from "viem/chains";

export const useAlchemyProvider = () => {
    const [provider, setProvider] = useState<AlchemyProvider>(
        new AlchemyProvider({
            apiKey: alchemyApiKey,
            chain: polygon,
            opts: {
                txMaxRetries: 20,
                txRetryIntervalMs: 2_000,
                txRetryMulitplier: 1.5,
                minPriorityFeePerBid: 100_000_000n,
            },
      })
    );

    const connectProviderToAccount = useCallback((signer: SmartAccountSigner) => {
        const connectedProvider: AlchemyProvider = provider
        .connect((provider) => {
          return new LightSmartContractAccount({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress: getDefaultEntryPointAddress(chain),
            factoryAddress: getDefaultLightAccountFactoryAddress(chain)
          });
        });
        setProvider(connectedProvider);
        return connectedProvider;
    }, [provider]);

    const disconnectProviderFromAccount = useCallback(() => {
        const disconnectedProvider = provider.disconnect();
        setProvider(disconnectedProvider);
        return disconnectedProvider;
    }, [provider]);

    return { provider, connectProviderToAccount, disconnectProviderFromAccount };
}