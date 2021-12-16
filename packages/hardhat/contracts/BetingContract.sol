// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract BettingContract is Ownable {

    enum GameStatus {Open, Closed}
    enum BetSide {Back, Lay}

    struct Game {
        address owner;
        string objectId;
        GameStatus status;
    }
    
    struct BetAmount {
        uint256 amount;
        address fromAddr;
    }

    Game game;
  
    /// Hold all unmatched bets: BetSide -> BetType -> BetType Selection Index -> Odds -> BetAmount[]
    mapping(BetSide => mapping(uint8 => mapping(uint8 => mapping(uint16 => BetAmount[])))) unmatchedBets;

    /// Unmatched bet has been placed.
    event UnmatchedBetPlaced(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
    /// Unmatched bet has been updated.
    event UnmatchedBetUpdated(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
    /// Unmatched bet has been removed.
    event UnmatchedBetRemoved(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
     /// Matched bet has been placed.
    event MatchedBetPlaced(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);

    /// Game has already ended.
    error GameAlreadyEnded();
    /// Bet Amount of `amount` to low.
    error AmountToLow(uint amount);
    /// Odds of `odds` to low.
    error OddsToLow(uint256 odds);
    
    /// check if amount is greater then zero
    modifier amountGreaterZero(uint _amount) {
        if(_amount <= 0) revert AmountToLow(_amount);
        _;
    }
    
    /// check if valid odds
    modifier checkOdds(uint256 _odds) {
        if(_odds <= 1000 ) revert OddsToLow(_odds);
        _;
    }
    
    /// check if valid odds
    modifier checkGameRunning() {
        if(game.status == GameStatus.Closed) revert GameAlreadyEnded();
        _;
    }
    
    /// Create game struct and init vars
    constructor(string memory _objectId) {
        game.owner = msg.sender;
        game.objectId = _objectId;
        game.status = GameStatus.Open;
    }


    /// Public function for placing back bet -> msg.value = bet amount
    function createBackBet(uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning() amountGreaterZero(msg.value) checkOdds(_odds) {
        require(_amount == msg.value, "Amount and send value are not equal!");
        placeBet(BetSide.Back, _betType, _selection, _odds, _amount, msg.sender);
    }

    /// Public function for placing lay bet -> msg.value = bet liqidity
    function createLayBet(uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning() amountGreaterZero(msg.value) checkOdds(_odds) {
        uint256 liqidity = (_amount * (_odds - 1000) / 1000);
        require(liqidity == msg.value, "Liqidity and send value are not equal!");
        placeBet(BetSide.Lay, _betType, _selection, _odds, _amount, msg.sender);
    }

    /// Internal function for placing and matching all bets
    function placeBet(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {

        /// Get all unmatched bets from the same bet type, selection, odds and opposite bet side
        BetSide oppositeSide = (BetSide.Back == _betSide) ? BetSide.Lay: BetSide.Back;
        BetAmount[] memory unmatchedBetsArray = unmatchedBets[oppositeSide][_betType][_selection][_odds];

        /// no bets found, place unmatched bet
        if(unmatchedBetsArray.length == 0){
            placeUnmatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
            return;
        }

        /// Create dynamic arrays, with unmatchedBetsLength as max array length
        uint[] memory matchingWith = new uint[](unmatchedBetsArray.length); // stores the matching index from unmatchedBetsArray
        uint256[] memory matchingAmount = new uint256[](unmatchedBetsArray.length);  // stores what amount can be matched
        uint matchingIndex = 0; // index for the two arays above
        bool fullMatch = false;
        uint256 amountLeft = _amount;

        for (uint i=0; i < unmatchedBetsArray.length; i++) {
            matchingWith[matchingIndex] = i;
             /// bet amount higher then current placed bet 
            if(amountLeft > unmatchedBetsArray[i].amount) {
            	matchingAmount[matchingIndex] = unmatchedBetsArray[i].amount;
                amountLeft -= matchingAmount[matchingIndex];
            } 
            /// bet amount is lower or equel then current placed bet 
            else if(amountLeft <= unmatchedBetsArray[i].amount) {
            	matchingAmount[matchingIndex] = amountLeft;
                amountLeft -= matchingAmount[matchingIndex];
            }
            /// break out loop, if bet can fully matched
            if(amountLeft == 0){
                fullMatch = true;
                break;
            }
            matchingIndex++;
        }

        // Place matched bets for participants
        for (uint i=0; i < matchingWith.length; i++) {
            BetAmount memory matchingBet = unmatchedBetsArray[matchingWith[i]];
            placeMatchedBet(oppositeSide, _betType, _selection, _odds, matchingAmount[i], matchingBet.fromAddr);
            // Remove unmatched bet if full match
            if(matchingAmount[i] == matchingBet.amount){
                emit UnmatchedBetRemoved(oppositeSide, _betType, _selection, _odds, matchingAmount[i], matchingBet.fromAddr);
                delete matchingBet;
            }
            // Update unmatched bet with remaining amount if partly matched
            else {
                matchingBet.amount -= matchingAmount[i]; 
                emit UnmatchedBetUpdated(oppositeSide, _betType, _selection, _odds, matchingBet.amount, matchingBet.fromAddr);
            }
        }

        // Place current fully matched bet if possible
        if(fullMatch) {
            placeMatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
        } 
         // Place current partly matched bet and unmatched bet with remaining amount
        else  {
            placeMatchedBet(_betSide, _betType, _selection, _odds, _amount - amountLeft, _fromAddr);
            placeUnmatchedBet(_betSide, _betType, _selection, _odds, amountLeft, _fromAddr);
        }
    }

    // Internal function for placing unmatched bet
    function placeMatchedBet(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
      emit MatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
    
    // Internal function for placing unmatched bet
    function placeUnmatchedBet(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
        unmatchedBets[_betSide][_betType][_selection][_odds].push(BetAmount(_amount, _fromAddr));
        emit UnmatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
}
