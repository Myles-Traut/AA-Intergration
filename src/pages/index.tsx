import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useRouter } from 'next/router';
import { createWalletClient, http } from 'viem';
import { goerli } from 'viem/chains';
import { WalletClientSigner, getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { useCallback, useState } from 'react';
import { AlchemyProvider } from '@alchemy/aa-alchemy';
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { useEoaSigner } from '@/hooks/useEoaSigner';

const Home = () => {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [scaAddress, setScaAddress] = useState<string>();
  const router = useRouter();

  const login = useCallback(async () => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: "0R20Qwh34mUfBv0mdMS_lJxrhH--egTt",
      chain: goerli,
    }).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          rpcClient,
          owner: signer,
          chain: goerli,
          entryPointAddress: getDefaultEntryPointAddress(goerli),
          factoryAddress: getDefaultLightAccountFactoryAddress(goerli),
        })
    );
    setScaAddress(await provider.getAddress());
  },[]);

  return (
    <>
    <div>Home</div>
    <div className="flex relative items-center" >
      {isConnected ? 
      <div>
      <button
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {disconnect(); router.push('/')}}>Disconnect</button>
      <div>MM Address: {address}</div>
      <button
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={login}>Deploy SCA</button>
      <div>SCA ADDRESS: {scaAddress}</div>
      </div> :
      <button 
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => connect()}>Connect Wallet</button>
      }
    </div>
  </>)
}

export default Home;