const ReadMe = () => {
    return (
        <div className="px-12">
            <p>
                The aim of this demo is to reduce a users interaction with their EOA
                to a minimum by using a smart conntract account to act as their primary Wallet
                and only needing to interact with their EOA to sign transactions on behalf of the SCA.
            </p>
                <br />
                To use this demo, first connect your metamask wallet to the dapp using the connect button.
                <p>This will allow the user to login. </p>
                <br />
                <p className="text-left">Once logged in you will see: </p>
                <p className="text-left pl-8">- The address of your MetaMask wallet displayed as signer wallet. 
                This is the wallet you will use to sign transactions with.</p>
                <p className="text-left pl-8">- The address of your Smart Contract Wallet. 
                This is the wallet that will hold your funds and be used as msg.sender when interacting on-chain.
                Be sure to fund your Smart Contract Wallet with gas money (in this case, MATIC) before executing your first transaction.</p>
                <p className="text-left pl-8">- Your Smart Account MATIC balance</p>
                <br />
                <p>
                There are two functionalities available in this dApp. You may transfer Matic from your smart account to and address
                and you may purchase tokens from a token presale contract.
            </p>
            
        </div>
    );
};

export default ReadMe;