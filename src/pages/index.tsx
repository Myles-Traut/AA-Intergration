import { Address, useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useRouter } from 'next/router';
import { goerli } from 'viem/chains';
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { useCallback, useState } from 'react';
import { AlchemyProvider } from '@alchemy/aa-alchemy';
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts';
import { useEoaSigner } from '@/hooks/useEoaSigner';
import { Alchemy, Network } from "alchemy-sdk";
import { chain, alchemyApiKey } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import PurchaseTokenForm from '@/components/PurchaseTokenForm';
import { parseEther } from 'viem';

const Home = () => {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [scaAddress, setScaAddress] = useState<string>();
  const [ethBalance, setEthBalance] = useState<string>();
  const [currentProvider, setCurrentProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
    chain,
    rpcUrl: getRpcUrl(),
  }))
  const [amount, setAmount] = useState<string>('');
  const [to, setTo] = useState<string>("");

  const router = useRouter();
  const alchemy = new Alchemy({
    network: Network.ETH_GOERLI,
    apiKey: alchemyApiKey,
  });

  const login = useCallback(async () => {
    const { signer } = useEoaSigner();
    const provider: AlchemyProvider = new AlchemyProvider({
      apiKey: alchemyApiKey,
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
    const contractAddress: `0x${string}` = await provider.getAddress();
    setScaAddress(contractAddress);
    setEthBalance((await alchemy.core.getBalance(contractAddress)).toString());
    setCurrentProvider(provider);
  },[]);

  const sendETH = useCallback(async() => {
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

  console.log(currentProvider);

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
      <div>SCA Balance: {ethBalance}</div>
      {/* <button onClick={sendETH}>Send ETH</button> */}
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
            <div className="items-center pl-28 mt-4">
                <button 
                    className={isConnected ? 
                            "h-10 px-5 m-2 text-green-100 transition-colors duration-150 bg-green-700 rounded-lg focus:shadow-outline hover:bg-green-800" : 
                            "h-10 px-5 m-2 text-gray-700 transition-colors duration-150 bg-gray-400 rounded-lg focus:shadow-outline hover:bg-gray-500"}>
                    Transfer
                </button>
            </div>
            <div>
            </div>
        </form>
      </div> :
      <button 
      className="w-full h-12 px-6 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
      onClick={() => connect()}>Connect Wallet</button>
      }
    </div>
  </>)
}

export default Home;