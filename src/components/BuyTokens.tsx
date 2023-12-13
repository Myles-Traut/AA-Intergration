import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { tokenSaleAbi } from "../../abis/TokenPresale";

type Props = {
    setUoHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    provider: any,
    getTokenBalance: any,
    tokenBal: string,
}

const BuyTokens = ({ setUoHash, setTxHash, provider, getTokenBalance, tokenBal}: Props) => {
    const [tokenAmount, setTokenAmount] = useState<string>("");
    
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
    setTxHash(txHash);
    getTokenBalance();
    console.log(txHash);
  }, [provider, getTokenBalance, setTxHash, setUoHash]);
    return (
        <div className="ml-4 py-8">
            <div className="pb-4">Token Balance: {tokenBal}</div>
            <form onSubmit={e => {
                e.preventDefault();
                buyToken(tokenAmount);
            }}>
          <label className="pr-4" htmlFor="Buy Token">Amount to Spend</label>
          <div>
            <input
              value={tokenAmount}
              className="text-black my-2 text-xs" 
              id="Buy"  
              placeholder="0.001 MATIC"
              onChange={e => setTokenAmount(e.target.value)}
            />
          </div>
          <div>
          <button type='submit'
              className= "h-6 px-2 mt-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
              Buy Token
          </button>
          </div>
        </form>
        </div>
    )
}

export default BuyTokens;