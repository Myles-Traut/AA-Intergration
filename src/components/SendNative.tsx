import { useAlchemyProvider } from '@/hooks/useAlchemyProvider';
import { AlchemyProvider } from 'alchemy-sdk';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { Address, parseEther } from 'viem';

type Props = {
    setUoHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>,
    provider: any,
}

const SendNative = ({ setUoHash, setTxHash, provider}: Props) => {
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
    },[provider, setTxHash, setUoHash]); 

    return(
    <div>
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
    </div>)
}

export default SendNative;