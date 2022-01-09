//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './LPNFT.sol';
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

    constructor(LPNFT _lpNFT) {
        lpNFT = _lpNFT;
        totalDeposit = 0;
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
}