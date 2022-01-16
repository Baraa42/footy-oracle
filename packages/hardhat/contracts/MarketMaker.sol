//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './LPNFT.sol';
import './Betting.sol';
import "hardhat/console.sol";

contract MarketMaker  {
    struct LiqudityProvider {
        address LPAddress; // Why do we need this when ownership is decided by NFT?
        uint depositAmount;
    }
    LiqudityProvider public lp;
    LPNFT lpNFT;
    uint public totalDeposit;

    mapping(uint => LiqudityProvider) public lpDeposits;

    event DepositCompleted(uint tokenId, string uri, uint depositAmount);
    event WithdrawalCompleted(uint tokenId, uint depositAmount);
    event MarketMakerCreateBackBet(BetType _betType,
                                   uint8 _selection,
                                   uint16 _odds,
                                   uint256 amount);
    event MarketMakerCreateLayBet(BetType _betType,
                                   uint8 _selection,
                                   uint16 _odds,
                                   uint256 amount);

    constructor(LPNFT _lpNFT) {
        lpNFT = _lpNFT;
        totalDeposit = 0;
        console.log("Constructor MarketMaker");
    } 

    function deposit(string memory uri) public payable {
        uint tokenId = lpNFT.getNextFreeTokenId();
        uint amount = msg.value;
        lpNFT.mint(msg.sender, tokenId, uri);
        lpDeposits[tokenId] = LiqudityProvider(msg.sender, amount);
        totalDeposit += amount;

        emit DepositCompleted(tokenId, uri, msg.value);
    }

    function getDepositValue(uint tokenId) public view returns (uint) {
        return lpDeposits[tokenId].depositAmount;
    }
    
    function getTotalDeposit() public view returns (uint) {
        return totalDeposit;
    }

    function transferAmount(address addr, uint256 amount) internal {
        payable(addr).transfer(amount);
    }

    function withdraw(uint tokenId) public payable {
        require(lpNFT.ownerOf(tokenId) == msg.sender, "MarketMaker: transfer caller is not owner");
        lpNFT.redeemCollectible(msg.sender, tokenId);

        uint depositAmount = lpDeposits[tokenId].depositAmount;
        transferAmount(msg.sender, depositAmount);
        totalDeposit -= depositAmount;
        delete lpDeposits[tokenId];
        emit WithdrawalCompleted(tokenId, depositAmount);
    }

    // Never invest more than .1% of total fund value.
    function maxAmountForAnyBet() public view returns (uint) {
        if (totalDeposit > 1000) {
           return totalDeposit / 1000;
        }
        else {
           return 0;
        }
    }

    // User placed a Lay Bet and now MarketMaker will create Back bet
    function createOpposingBackBet(address bettingAddress,
                                   BetType _betType,
                                   uint8 _selection,
                                   uint16 _odds) external {        
        uint amount = maxAmountForAnyBet();
        require(amount != 0, "Insufficient Funds in Liquidity Pool");
        totalDeposit = totalDeposit - amount;

        Betting betting = Betting(bettingAddress);
        betting.createBackBet{value: amount}(_betType, _selection, _odds, amount);
        
        emit MarketMakerCreateBackBet(_betType, _selection, _odds, amount);
        console.log('createOpposingBackBet completed. Amount=', amount);
    }
    
    // User placed a Back Bet and now MarketMaker will create Lay bet
    function createOpposingLayBet(address bettingAddress,
                                   BetType _betType,
                                   uint8 _selection,
                                   uint16 _odds,
                                   uint256 backBetAmount,
                                   uint256 liabilityAmount) external {
        /*
        uint amount = (backBetAmount * (_odds - 1000) / 1000); // maxAmountForAnyBet();
        console.log('trying createOpposingLayBet, amount = ', amount, ' backBetAmount =', backBetAmount);
        require(amount != 0, "Insufficient Funds in Liquidity Pool");
        totalDeposit = totalDeposit - amount;
        */
        totalDeposit = totalDeposit - liabilityAmount;

        Betting betting = Betting(bettingAddress);
        betting.createLayBet{value: liabilityAmount}(_betType, _selection, _odds, backBetAmount);
        
        emit MarketMakerCreateLayBet(_betType, _selection, _odds, liabilityAmount);
        console.log('createOpposingLayBet completed. Amount=', liabilityAmount); 
    }
}