import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useRouter } from 'next/router';
import { WalletClientSigner } from "@alchemy/aa-core";
import { useCallback, useState } from 'react';
import { AlchemyProvider } from '@alchemy/aa-alchemy';
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts';
import { useEoaSigner } from '@/hooks/useEoaSigner';
import { useAlchemyProvider } from '@/hooks/useAlchemyProvider';

import { Alchemy, Network } from "alchemy-sdk";
import { chain, alchemyApiKey } from "@/config/client";
import { parseEther, encodeFunctionData, Address, WalletClientConfig, Hash } from 'viem';
import { tokenSaleAbi } from '../../abis/TokenPresale';
import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains';

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
  
  const [amount, setAmount] = useState<string>('');
  const [to, setTo] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>('');

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

  /*--- Login Function ---*/
  const login: (signer: WalletClientSigner) => Promise<void> = useCallback(async (signer: WalletClientSigner) => {
    connect();
    connectProviderToAccount(signer);
    const contractAddress: `0x${string}` = await provider.getAddress();
    setScaAddress(contractAddress);
    setNativeBalance((await alchemy.core.getBalance(contractAddress)).toString());
    
    const data = await publicClient.readContract({
          address: '0x8179C04ed42683eafd59d66236484E090016Db56',
          abi: tokenSaleAbi,
          functionName: 'userHubBalance',
          args: [contractAddress]
        })
    setTokenBal(data.toString());
  },[connect, connectProviderToAccount, provider, alchemy.core, publicClient]);

  /*------ Logout Function ------*/
  const logout: () => void = useCallback(() => {
    disconnect();
    disconnectProviderFromAccount();
  }, [disconnect, disconnectProviderFromAccount]);

  /*--- Send Native Currency Function ---*/
  const sendNative = useCallback(async(amount: string, to: string) => {
    const { hash: uoHash } = await provider.sendUserOperation({
      target: to as Address, // The desired target contract address
      data: "0x", // The desired call data
      value: parseEther(amount), // (Optional) value to send the target contract address
    });
    setUoHash(uoHash);
    console.log("Uo Hash: ", uoHash);
    // Wait for the user operation to be mined
    const txHash = await provider.waitForUserOperationTransaction(uoHash);
    setTxHash(txHash);
    console.log("Transaction Hash: ", txHash);
  },[provider]); 

  /*--- Get Token Balance Function ---*/
  const getTokenBalance = useCallback(async() => {
    const contractAddr = await provider.getAddress();
    const data = await publicClient.readContract({
      address: '0x8179C04ed42683eafd59d66236484E090016Db56',
      abi: tokenSaleAbi,
      functionName: 'userHubBalance',
      args: [contractAddr]
    })
    console.log(data);
    setTokenBal(data.toString());
  }, [publicClient]);

  /*--- Buy Tokens Function ---*/
  const buyToken = useCallback(async(tokenAmount: string) => {
    const uoCallData = encodeFunctionData({
      abi: tokenSaleAbi,
      functionName: 'buyHub',
      args: [await provider.getAddress()],
    });
    const uo = await provider.sendUserOperation({
      target: "0x8179C04ed42683eafd59d66236484E090016Db56",
      data: uoCallData,
      value: parseEther(tokenAmount),
    });
    setUoHash(uo.hash);
    console.log(uo.hash);
    const txHash = await provider.waitForUserOperationTransaction(uo.hash);
    if(txHash){
      setTxHash(txHash);
      getTokenBalance();
    }
    
    console.log(txHash);
  }, [provider]);

  return (
    <div className="ml-4 mt-4">
    <div>Home</div>
    <div className="flex relative items-center" >
      {isConnected ? 
      <div>
      <button
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {logout(); router.push('/')}}>Disconnect</button>
      <div>Signer Address: {address}</div>
      <div>Smart Wallet Address: {scaAddress}</div>
      <div>Smart Wallet Balance: {nativeBalance}</div>
      <hr />
      <br />
      <form onSubmit={(e) => {
            e.preventDefault();
            sendNative(amount, to);
        }}>
            <label htmlFor="Transfer ETH" className="pr-4">Transfer ETH</label>
            <div>
              <input
                value={amount}
                className="text-black pl-2"  
                id="amount" 
                placeholder="0.001 ETH"
                onChange={e => setAmount(e.target.value)}
            />
            </div>
            <div>
              <input
                  value= {to}
                  className="text-black pl-2"  
                  id="destination" 
                  placeholder="0x.."
                  onChange={e => setTo(e.target.value)}
              />
            </div>
            <div className="mt-4">
                <button type='submit'
                    className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
                    Transfer ETH
                </button>
            </div>
            <hr />
            <br />
            <div>
          </div>
        </form>
        
        <form onSubmit={e => {
          e.preventDefault();
          buyToken(tokenAmount);
        }}>
          <label htmlFor="Buy Token" className="pr-4">Amount to Spend</label>
            <input
              value={tokenAmount}
              className="text-black pl-2" 
              id="Buy"  
              placeholder="0.001 ETH"
              onChange={e => setTokenAmount(e.target.value)}
          />
          <button type='submit'
              className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
              Buy Token
          </button>
        </form>
        
        <div><button className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800" onClick={() => {getTokenBalance()}}>Get balance</button>
        Token Balance: {tokenBal}</div>
      </div>
       :
      <button 
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {
        login(signer);
      }}>Connect Wallet</button>
      }
    </div>
  </div>)
}

export default Home;