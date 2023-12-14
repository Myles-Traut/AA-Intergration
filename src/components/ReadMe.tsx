const ReadMe = () => {
    return (
        <div className="px-12 mb-4">
            <p>
                The aim of this demo is to show how we can reduce a users interaction with their EOA 
                by using a SMART CONTRACT ACCOUNT. This will act as the users primary wallet and is deployed or connected to when a user clicks Login.
                Users only need to interact with their EOA to sign transactions on behalf of the SCA and connect to the dApp.
            </p>
                <br />
                <p>To use this demo, first connect your MetaMask wallet to the dApp using the connect button.
                This will allow the user to login. </p>
                <br />
                <p className="text-left">Once logged in you will see: </p>
                <p className="text-left pl-8">- The address of your MetaMask wallet displayed as signer wallet. 
                This is the wallet you will use to sign transactions with.</p>
                <p className="text-left pl-8">- The address of your Smart Contract Wallet. 
                This is the wallet that will hold your funds and be used as msg.sender when interacting on-chain.
                Be sure to fund your Smart Contract Wallet with gas money (in this case, MATIC) before executing your first transaction
                as this dApp does not make use of a gas manager to sponsor gas.</p>
                <p className="text-left pl-8">- Your currnet Smart Account MATIC balance</p>
                <p className="text-left pl-8">- Your current Smart Account PRESALE TOKEN balance</p>
                <br />
                <p>
                There are two functionalities available in this dApp.</p> 
                <p>You may transfer Matic from your smart account to another address
                and you may purchase tokens from a token presale contract.
            </p>
            
        </div>
    );
};

export default ReadMe;