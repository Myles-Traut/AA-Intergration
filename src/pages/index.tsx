import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useRouter } from 'next/router';
import { WalletClientSigner } from "@alchemy/aa-core";
import { useCallback, useState, useEffect } from 'react';
import { useEoaSigner } from '@/hooks/useEoaSigner';
import { useAlchemyProvider } from '@/hooks/useAlchemyProvider';

import { Alchemy, Network } from "alchemy-sdk";
import { alchemyApiKey } from "@/config/client";
import { formatUnits, encodeFunctionData, Address, Hash } from 'viem';
import { tokenSaleAbi } from '../../abis/TokenPresale';
import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains';

import SendNative from '@/components/SendNative';
import BuyTokens from '@/components/BuyTokens';
import Head from 'next/head';
import ReadMe from '@/components/ReadMe';

///@dev Token Presale contract addresses:
  // 0x8179C04ed42683eafd59d66236484E090016Db56 polygon
  // 0xD055B32fd3136F1dCA638Cd8f4B2eAF4A10abAb3 goerli

const Home = () => {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [scaAddress, setScaAddress] = useState<Address>();
  const [nativeBalance, setNativeBalance] = useState<string>("");
  const [tokenBal, setTokenBal] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);

  const [uoHash, setUoHash] = useState<Hash>();
  const [txHash, setTxHash] = useState<Hash>();

  const router = useRouter();

  const alchemy = new Alchemy({
    network: Network.MATIC_MAINNET,
    apiKey: alchemyApiKey,
    
  });
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http()
  });
  
  const { signer } = useEoaSigner();
  const { provider, connectProviderToAccount, disconnectProviderFromAccount } = useAlchemyProvider();

  /*--- Get Token Balance Function ---*/
  const getTokenBalance = useCallback(async() => {
    const contractAddr = await provider.getAddress();
    const data = await publicClient.readContract({
      address: '0x8179C04ed42683eafd59d66236484E090016Db56',
      abi: tokenSaleAbi,
      functionName: 'userHubBalance',
      args: [contractAddr]
    })
    setTokenBal(formatUnits(data, 18));
  }, [publicClient, provider]);

  const getNativeBalance: (address: Address) => Promise<void> = useCallback(async(address: Address) => {
    let balance: any = await alchemy.core.getBalance(address);
    let bigBal: bigint = BigInt(balance);
    setNativeBalance(formatUnits(bigBal, 18));
  },[alchemy.core]);

  /*--- Login Function ---*/
  const login: (signer: WalletClientSigner) => Promise<void> = useCallback(async (signer: WalletClientSigner) => {
    connectProviderToAccount(signer);
    const contractAddress: `0x${string}` = await provider.getAddress();
    setScaAddress(contractAddress);
    setIsLoggedIn(true);
    getNativeBalance(contractAddress);
    getTokenBalance(); 
  },[connectProviderToAccount, provider, getTokenBalance, getNativeBalance]);

  /*------ Logout Function ------*/
  const logout: () => void = useCallback(() => {
    disconnectProviderFromAccount();
    setIsLoggedIn(false);
    setTxHash(undefined);
    setUoHash(undefined);
  }, [disconnectProviderFromAccount]);

  return (
    <div className="ml-4 mt-4">
      <Head>
        <title>AA-Demo</title>
      </Head>
    <h1 className="text-center mb-2 text-2xl underline">Account Abstraction Demo</h1>
    <div className="flex relative items-center" >
      {isLoggedIn ? 
      <div className="w-full mt-4">
        <div className="w-full flex relative items-center justify-center">
          <button
          className="h-8 px-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
          onClick={() => {logout(); router.push('/')}}>Logout</button>
        </div>
      <div className="my-6">
      <div className="w-full flex relative items-center justify-center text-2xl">Your Smart Wallet</div>
        <div className="flex relative my-2 text-sm items-center justify-center">Signer Address: {address}</div>
        <div className="flex relative my-2 text-sm items-center justify-center">Smart Wallet Address: {scaAddress}</div>
      </div>
      <hr />
      <br />
      <div className="flex relative items-center justify-center">
        <div className="mx-8 bg-gray-100 w-96">
          <div className="flex relative items-center justify-center">
            <SendNative setUoHash={setUoHash} setTxHash={setTxHash} provider={provider} getNativeBalance={getNativeBalance} nativeBalance={nativeBalance}/>
          </div>
        </div>
        <div className="mx-8 bg-gray-100 w-96">
          <div className="flex relative items-center justify-center">
            <BuyTokens 
              setUoHash={setUoHash} 
              setTxHash={setTxHash} 
              provider={provider} 
              getTokenBalance={getTokenBalance}
              tokenBal={tokenBal}/>
          </div>
        </div>
      </div>
      {uoHash && (<div className="flex relative mt-1 text-xs items-center justify-center"> User Op Sent</div>)}
      {txHash && (
        <div className="flex relative mt-1 items-center justify-center">
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            className="btn text-black transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >Your Txn Details</a>
        </div>)}
      </div>
       :
      <div>
      <div className="w-full mt-4 flex relative items-center justify-center">
        {isConnected ? <button 
      className="h-8 px-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {
        login(signer);
      }}>Login</button> :
      <button 
      className="h-8 px-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {
        connect();
      }}>Connect</button>
      }
      </div>
      <div className="mt-12">
        <ReadMe />
      </div>
      </div>
      }
    </div>
  </div>)
}

export default Home;