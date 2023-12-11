import { useCallback, useState } from'react';
import { Address, parseEther } from 'viem';

type Props = {
    isConnected: boolean,
    provider: any
}

export default function PurchaseTokenForm({ isConnected, provider }: Props) {
    const [amount, setAmount] = useState('');
    const [to, setTo] = useState<string>();
    const [bought, setBought] = useState(0n);

    const transferEth = useCallback(async () => {
        let toAddress = to as Address;
        // Send a user operation from your smart account to Vitalik that does nothing
        const { hash: uoHash } = await provider.sendUserOperation({
            target: toAddress, // The desired target contract address
            data: "0x", // The desired call data
            value: parseEther(amount), // (Optional) value to send the target contract address
        });

        console.log("UserOperation Hash: ", uoHash); // Log the user operation hash

        // Wait for the user operation to be mined
        const txHash = await provider.waitForUserOperationTransaction(uoHash);

        console.log("Transaction Hash: ", txHash);
    }, []);

    return(
        <form onSubmit={(e) => {
            e.preventDefault()
        }}>
            <label htmlFor="Transfer ETH" className="pr-4">Transfer ETH</label>
            <input
                className="text-black pl-2"  
                id="1" 
                placeholder="0.001 ETH"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
            />
            <input
                className="text-black pl-2"  
                id="2" 
                placeholder="0x.."
                onChange={(e) => setTo(e.target.value)}
                value={to}
            />
            <div className="items-center pl-28 mt-4">
                <button 
                    disabled={!amount || !to} 
                    className={isConnected && amount! && to ? 
                            "h-10 px-5 m-2 text-green-100 transition-colors duration-150 bg-green-700 rounded-lg focus:shadow-outline hover:bg-green-800" : 
                            "h-10 px-5 m-2 text-gray-700 transition-colors duration-150 bg-gray-400 rounded-lg focus:shadow-outline hover:bg-gray-500"}
                            onClick={transferEth}>
                    Transfer ETH
                </button>
            </div>
            <div>
            </div>
        </form>
    )
}
