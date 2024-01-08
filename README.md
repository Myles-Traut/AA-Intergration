Account Abstraction Demo App

The aim of this demo is to show how we can reduce a users interaction with their EOA by using a SMART CONTRACT ACCOUNT. This will act as the users primary wallet and is deployed or connected to when a user clicks Login. Users only need to interact with their EOA to sign transactions on behalf of the SCA and connect to the dApp.

To use this demo, first connect your MetaMask wallet to the dApp using the connect button. This will allow the user to login.

Once logged in you will see:
    The address of your MetaMask wallet displayed as signer wallet. This is the wallet you will use to sign transactions with.
    The address of your Smart Contract Wallet. This is the wallet that will hold your funds and be used as msg.sender when interacting on-chain. Be sure to fund your Smart Contract Wallet with gas money (in this case, MATIC) before executing your first transaction as this dApp does not make use of a gas manager to sponsor gas.
    Your currnet Smart Account MATIC balance.
    Your current Smart Account PRESALE TOKEN balance.

There are two functionalities available in this dApp:
    You may transfer Matic from your smart account to another address.
    And you may purchase tokens from a token presale contract.