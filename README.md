# Footy Oracle

## Project url :

https://sneuxiknspgx.grandmoralis.com/#/sport/soccer

## Walkthrough video url : 

`Add video link here`

## The Project - Footy Oracle

 Footy Oracle is a Betting Decentralized App that implements various features : 
 - P2P betting exchange : Classical exchange for betting that matches back/lay (bid/ask) bets.
 - Liquidity Market : User can stake money in the liquidity pool (see description for more details).
 - NFT Market place : Bets placed can be converted to NFTs (see description for more details).
 - Lossless betting market : Betting without losing money.
 

## Description of Features

### P2P betting exchange 
Classical exchange for betting that matches back/lay (bid/ask) bets, in addition users can choose to transform their bet to an NFT. This can serve 2 purposes, selling NFT on the Footy Oracle market place to cash out the bet or keep it a souvent e.g huge bet lost in last second becomes a meme NFT.

#### How it works : 
- Users can open a position for Back/Lay bets.
- If there is another person to take be on the other side they can be matched or partially matched.
- Users can cancel unmatched bets.
- Users can choose to mint an NFT from their running bet.

#### How it works from contract side : 
- What contract does what.

### Liquidity Pool and Market Maker
Liquidity Pool : Any user can deposit to a common pool of funds. Liquidity Providers will be issued LP NFTs. These NFTs can be traded on the Marketplace and can be used to redeem the deposit. 

Market Maker: Market Maker will use the funds in the Liquidity Pool to join an unmmatched bet when the odds are deemed favorable to itself.

#### How it works : 
- Users can stake money in the liquidity pool.
- The Market Maker will try to use this money to match some unmatched bets when odds are deemed favorable to LP.
- Currently user has to request the Market Maker to match their bet.

#### How it works from contract side : 
- Smart Contract accepts the liqudity, issues LP NFTs and joins bets. 

#### Advantages : 
- In a P2P platform, no bet needs to go unmatched. 
- Liquidity Providers will better returns if Market Maker chooses the odds smartly. 
- LP NFTs have a secondary market and can function as an indicator of Market Maker's ability to choose the best bets and odds. 

#### Roadmap : 
- Market Maker will deposit idle funds to Benqi / Compound / Aave to get better returns. 
- It will use external APIs (through the UI) to determine favorable odds for bets it can join. 



### Lossless betting Market :
Players can bet on their favorite team without losing money (Same principe as PoolTogether), the money that is bet on a game is used to generate yield from lending platforms such as Aave or Benqi. At the end of the game one random lucky bettor is selected and wins the yield generated by the money staked on the game, other bettors are refunded.

#### How it works : 
- User choose a bet and an amount to bet on the game.
- User earn `points` proportional to his stake and the time left to the start of the game.
- User money is lent on Benqi or Aave in the background.
- Game is finished, Chainlink node sets the winning team and the contract withdraws from the lending pool.
- The contract pick randomly a player amongst those who bet correctly.
- The contract update each player balance and gives the winner the yield generated from the game e.g if there are 1000 players each betting 1 AVAX on the game, and the game generated is 10 AVAX, then 999 players will receive their money back and the winner will receive an additional 10 AVAX.
- No need to set the odds for lossless betting, the amount bet on each game are displayed and users can see if they will have more chance of winning if they bet on another side.

#### How it works from contract side :
- Manager.sol is the contract that handles the creation of new games contract, betting, depositing/withdrawing from pools and accounting.
- Each game can be sponsored, meaning a third party can stake money on this game without being eligible to winning the prize but contributing to the yield generated.
- Each game has start an finish time.
- Bets can only placed before start time.
- Users can only withdraw the money that they bet on the game after its finished.

## Technologies used :
- Moralis.
- Hardhat, Brownie.
- Add more.

## Procotols used :
- Benqi.
- Aave.
- Chainlink.
- YieldYak.

## Installation and Requierements :
?

## Contract addresses :
 ?



    
