# Dark-pool DEX: implementation of a private SWAP

First, note that this is the smart contract repo, you can find the front-end repo [here](https://github.com/IncrediSwap/IncrediSwap).

## Introduction to our project

Aztec is a privacy focused L2, that enables cheap private interactions with layer 1 smart contracts and liquidity, via a process called DeFi aggregation. We use advanced zero-knowledge technology "zk-zk rollups" to add privacy and significant gas savings to any layer 1 protocol via Aztec Connect bridges.

#### What is a Dark-pool?

A dark pool is a privately organized financial exchange for trading securities. Dark pools allow investors to trade without exposure until after the trade has been executed and reported. Dark pools are a type of alternative trading system that give certain investors the opportunity to place large orders and make trades without publicly revealing their intentions during the search for a buyer or seller.

Dark pools emerged in the 1980s when the Securities and Exchange Commission (SEC) allowed brokers to transact large blocks of shares. Electronic trading and an SEC ruling in 2007 that was designed to increase competition and cut transaction costs have stimulated an increase in the number of dark pools. Dark pools can charge lower fees than exchanges because they are often housed within a large firm and not necessarily a bank.

Dark-pool DEXes allow users to make large order into small orders to hide trade intent. This privacy is possible using a Layer 2 solution as Aztec Network.

#### What is Aztec Network?

Aztec is a privacy focused L2, that enables cheap private interactions with layer 1 smart contracts and liquidity, via a process called DeFi aggregation. We use advanced zero-knowledge technology "zk-zk rollups" to add privacy and significant gas savings to any layer 1 protocol via Aztec Connect bridges.

##### What is private?

The source of funds for any Aztec Connect transaction is an Aztec shielded asset. When a user interacts with an Aztec Connect bridge contract, their identity is kept hidden, but balances sent to the bridge are public.

#### Batching

Rollup providers are incentivised to batch any transaction with the same bridge id. This reduces the cost of the L1 transaction for similar trades. A bridge id consists of:


## Launch tests

 ```npm run test``` command simulate a deployment of Uniswap Pool and a swap using aztec bridge contract.
 
 ## Script to intercat with the contract
 
 ```node scripts/demo.js```
 
### Bridge address
[0xAA6236c6150Cd5e75483C400fBD11B7065c63d52](https://goerli.etherscan.io/address/0xAA6236c6150Cd5e75483C400fBD11B7065c63d52)

### Rollup processor address
[0x527744dfe29469b811a291C9d401aEC177ca08CC](https://goerli.etherscan.io/address/0x527744dfe29469b811a291C9d401aEC177ca08CC)
