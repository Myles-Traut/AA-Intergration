import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { tokenSaleAbi } from "../../abis/TokenPresale";

type Props = {
    setUoHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    provider: any,
    getTokenBalance: any
}

const BuyTokens = ({ setUoHash, setTxHash, provider, getTokenBalance}: Props) => {
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
    if(txHash){
      setTxHash(txHash);
      getTokenBalance();
    }
    console.log(txHash);
  }, [provider, getTokenBalance]);
    return (
        <div>
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
        </div>
    )
}

export default BuyTokens;