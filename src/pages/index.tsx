import { useAccount, useConnect, useContractRead, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useRouter } from 'next/router';
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { useCallback, useState } from 'react';
import { AlchemyProvider } from '@alchemy/aa-alchemy';
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts';
import { useEoaSigner } from '@/hooks/useEoaSigner';
import { Alchemy, BigNumber, Network } from "alchemy-sdk";
import { chain, alchemyApiKey } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import PurchaseTokenForm from '@/components/PurchaseTokenForm';
import { parseEther, encodeFunctionData, Address } from 'viem';
import { tokenSaleAbi } from '../../abis/TokenPresale';
import { createPublicClient, http } from 'viem'
import { goerli } from 'viem/chains';

type Args = {
  data: bigint | undefined
  isError: boolean
  isLoading: boolean
}

const Home = () => {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [scaAddress, setScaAddress] = useState<Address>();
  const [ethBalance, setEthBalance] = useState<string>("");
  const [tokenBal, setTokenBal] = useState<string>("");
  const [currentProvider, setCurrentProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
    chain,
    rpcUrl: getRpcUrl(),
  }))
  const [amount, setAmount] = useState<string>('');
  const [to, setTo] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>('');

  const router = useRouter();
  const alchemy = new Alchemy({
    network: Network.ETH_GOERLI,
    apiKey: alchemyApiKey,
    
  });
  const publicClient = createPublicClient({
    chain: goerli,
    transport: http()
  });

  const login = useCallback(async () => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: alchemyApiKey,
      chain: goerli,
      opts: {
        txMaxRetries: 20,
        txRetryIntervalMs: 2_000,
        txRetryMulitplier: 1.5,
        minPriorityFeePerBid: 100_000_000n,
      },
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
    const contractAddress: `0x${string}` = await provider.getAddress();
    setScaAddress(contractAddress);
    setEthBalance((await alchemy.core.getBalance(contractAddress)).toString());
    setCurrentProvider(provider);

    const data = await publicClient.readContract({
          address: '0xD055B32fd3136F1dCA638Cd8f4B2eAF4A10abAb3',
          abi: tokenSaleAbi,
          functionName: 'userHubBalance',
          args: [contractAddress]
        })
    setTokenBal(data.toString());
  },[]);

  const sendETH = useCallback(async() => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: alchemyApiKey,
      chain: goerli,
      opts: {
        txMaxRetries: 20,
        txRetryIntervalMs: 2_000,
        txRetryMulitplier: 1.5,
        minPriorityFeePerBid: 100_000_000n,
      },
    }).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          chain,
          owner: signer,
          factoryAddress: getDefaultLightAccountFactoryAddress(chain),
          rpcClient,
        })
    );
    const { hash: uoHash } = await provider.sendUserOperation({
      target: to as Address,//"0x5f05970cFd02Bf70627CDDEE292f068C3a4EdCF6" as Address, // The desired target contract address
      data: "0x", // The desired call data
      value: parseEther(amount), // (Optional) value to send the target contract address
    });
    console.log(amount); 
    console.log("UserOperation Hash: ", uoHash); // Log the user operation hash
    // Wait for the user operation to be mined
    const txHash = await provider.waitForUserOperationTransaction(uoHash);
    console.log("Transaction Hash: ", txHash);
  }, []); 

  const buyToken = useCallback(async() => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: alchemyApiKey,
      chain: goerli,
      opts: {
        txMaxRetries: 20,
        txRetryIntervalMs: 2_000,
        txRetryMulitplier: 1.5,
        minPriorityFeePerBid: 100_000_000n,
      },
    }).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          chain,
          owner: signer,
          factoryAddress: getDefaultLightAccountFactoryAddress(chain),
          rpcClient,
        })
    );
    const uoCallData = encodeFunctionData({
      abi: tokenSaleAbi,
      functionName: 'buyHub',
      args: [await provider.getAddress()],
    });
    const uo = await provider.sendUserOperation({
      target: "0xD055B32fd3136F1dCA638Cd8f4B2eAF4A10abAb3",
      data: uoCallData,
      value: parseEther(tokenAmount),
    });
    console.log(tokenAmount);
    console.log(uo.hash);
    const txHash = await provider.waitForUserOperationTransaction(uo.hash);
    console.log(txHash);
  }, []);

  const getTokenBalance = useCallback(async() => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: alchemyApiKey,
      chain: goerli,
    }).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          chain,
          owner: signer,
          factoryAddress: getDefaultLightAccountFactoryAddress(chain),
          rpcClient,
        })
    );
    
    const contractAddr = await provider.getAddress();
    const data = await publicClient.readContract({
      address: '0xD055B32fd3136F1dCA638Cd8f4B2eAF4A10abAb3',
      abi: tokenSaleAbi,
      functionName: 'userHubBalance',
      args: [contractAddr]
    })
    console.log(data);
    setTokenBal(data.toString());
  }, []);

  return (
    <div className="ml-4 mt-4">
    <div>Home</div>
    <div className="flex relative items-center" >
      {isConnected ? 
      <div>
      <button
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {disconnect(); router.push('/')}}>Disconnect</button>
      <div>Signer Address: {address}</div>
      <div>Smart Wallet Address: {scaAddress}</div>
      <div>Smart Wallet Balance: {ethBalance}</div>
      <br />
      <form onSubmit={(e) => {
            e.preventDefault();
            sendETH();
        }}>
            <label htmlFor="Transfer ETH" className="pr-4">Transfer ETH</label>
            <div>
              <input
                value={amount}
                className="text-black pl-2"  
                name="amuont" 
                placeholder="0.001 ETH"
                onChange={(e) => setAmount(e.target.value)}
            />
            </div>
            <div>
              <input
                  value= {to}
                  className="text-black pl-2"  
                  id="destination" 
                  placeholder="0x.."
                  onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="mt-4">
                <button 
                    className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
                    Transfer ETH
                </button>
            </div>
            <hr />
            <div>
            </div>
        </form>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          buyToken();
        }}>
          <label htmlFor="Buy Token" className="pr-4">Amount to Spend</label>
            <input
              value={tokenAmount}
              className="text-black pl-2"  
              id="Buy" 
              placeholder="0.001 ETH"
              onChange={(e) => setTokenAmount(e.target.value)}
          />
          <button 
              className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
              Buy Token
          </button>
        </form>
        
        <div><button className= "h-10 px-5 m-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800" onClick={getTokenBalance}>Get balance</button>
        Token Balance: {tokenBal}</div>
      </div>
       :
      <button 
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => {
        connect();
        login();
        getTokenBalance();
      }}>Connect Wallet</button>
      }
    </div>
  </div>)
}

export default Home;