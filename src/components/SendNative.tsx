import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { Address, parseEther } from 'viem';
import { useBalance } from 'wagmi';

type Props = {
    setUoHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    provider: any,
    getNativeBalance: (address: Address) => Promise<void>,
    nativeBalance: string
}

const SendNative = ({ setUoHash, setTxHash, provider, getNativeBalance, nativeBalance}: Props) => {
    const [amount, setAmount] = useState<string>('');
    const [to, setTo] = useState<string>("");

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
        getNativeBalance(await provider.getAddress());
    },[provider, setTxHash, setUoHash, getNativeBalance]); 

    return(
    <div className="ml-4 py-8">
        <form onSubmit={(e) => {
            e.preventDefault();
            sendNative(amount, to);
        }}> 
        <div className="bg-gray-300">Balance: {nativeBalance} MATIC</div>
            <label className="text-sm" htmlFor="Transfer MATIC">Transfer MATIC</label>
            <div>
            <input
                value={amount}
                className="text-black my-2 text-xs"  
                id="amount" 
                placeholder="amount"
                onChange={e => setAmount(e.target.value)}
            />
            </div>
            <div>
            <input
                value= {to}
                className="text-black mt-4 w-80 text-xs"  
                id="destination" 
                placeholder="recipient"
                onChange={e => setTo(e.target.value)}
            />
            </div>
            <div className="mt-4">
                <button type='submit'
                    className= "h-6 px-2 text-green-100 bg-green-700 rounded-lg hover:bg-green-800">
                    Transfer MATIC
                </button>
            </div>
            <div>
        </div>
        </form>
    </div>)
}

export default SendNative;