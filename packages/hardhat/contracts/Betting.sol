// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './SoccerResolver.sol';

contract Betting is Ownable {

    enum GameStatus {Open, Closed}

    struct Game {
        address owner;
        string objectId;
        GameStatus status;
    }
    
    struct UnmatchedBetAmount {
        uint256 amount;
        address fromAddr;
    }

    struct MatchedBetAmount {
        uint256 profit;
        address fromAddr;
    }

    Game game;
    SoccerResolver public resolver;
  
    // Hold all unmatched bets: BetSide -> BetType -> Selection -> Odds = UnmatchedBetAmount[]
    mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => UnmatchedBetAmount[])))) unmatchedBets;
    // Hold all matched indexes: BetType -> Selection = matchedIndex
    mapping(BetType => mapping(uint8 => uint256)) matchedIndexes;
    // Hold all matched bets: BetSide -> BetType -> Selection = MatchedBetAmount[]
    mapping(BetSide => mapping(BetType => mapping(uint8 => MatchedBetAmount[]))) matchedBets;

    // Array of all used bet types for withdrawing
    BetType[] public usedBetTypes;
    // Array of all used selections mapped in BetType for withdrawing
    mapping(BetType => uint8[]) usedBetTypeSelections;
    // Check if BetType is already used in matched bet
    mapping(BetType => bool) isBetTypeUsed;
    // Check if BetType, Selection combination is already used in matched bet
    mapping(BetType => mapping(uint8 => bool)) isCombinationUsed;

    // Unmatched bet has been placed.
    event UnmatchedBetPlaced(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
    // Unmatched bet has been updated.
    event UnmatchedBetUpdated(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
    // Unmatched bet has been removed.
    event UnmatchedBetRemoved(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
    // Matched bet has been placed.
    event MatchedBetPlaced(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);

    // Game has already ended.
    error GameAlreadyEnded();
    // Bet Amount of `amount` to low.
    error AmountToLow(uint amount);
    // Odds of `odds` to low.
    error OddsToLow(uint256 odds);
    
    // check if amount is greater then zero
    modifier amountGreaterZero(uint _amount) {
        if(_amount <= 0) revert AmountToLow(_amount);
        _;
    }
    
    // check if valid odds
    modifier checkOdds(uint256 _odds) {
        if(_odds <= 1000 ) revert OddsToLow(_odds);
        _;
    }
    
    // check if valid odds
    modifier checkGameRunning() {
        if(game.status == GameStatus.Closed) revert GameAlreadyEnded();
        _;
    }
    
    // Create game struct and init vars
    constructor(string memory _objectId, SoccerResolver _resolver) {
        game.owner = msg.sender;
        game.objectId = _objectId;
        game.status = GameStatus.Open;
        resolver = _resolver;
    }


    // Public function for placing back bet -> msg.value = bet amount
    function createBackBet(BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning() amountGreaterZero(msg.value) checkOdds(_odds) {
        require(_amount == msg.value, "Amount and send value are not equal!");
        placeBet(BetSide.Back, _betType, _selection, _odds, _amount, msg.sender);
    }

    // Public function for placing lay bet -> msg.value = bet liqidity
    function createLayBet(BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning() amountGreaterZero(msg.value) checkOdds(_odds) {
        uint256 liqidity = (_amount * (_odds - 1000) / 1000);
        require(liqidity == msg.value, "Liqidity and send value are not equal!");
        placeBet(BetSide.Lay, _betType, _selection, _odds, _amount, msg.sender);
    }

    // for testing
    function withdraw() public {
        if(game.status == GameStatus.Open){
            withdrawWinners();
        }
    }

    // Internal function for placing and matching all bets
    function placeBet(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {

        // Get all unmatched bets from the same bet type, selection, odds and opposite bet side
        BetSide oppositeSide = (BetSide.Back == _betSide) ? BetSide.Lay: BetSide.Back;
        UnmatchedBetAmount[] memory unmatchedBetsArray = unmatchedBets[oppositeSide][_betType][_selection][_odds];

        // no bets found, place unmatched bet
        if(unmatchedBetsArray.length == 0){
            placeUnmatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
            return;
        }

        uint256 amountLeft = _amount;
        uint256 matchedIndex = matchedIndexes[_betType][_selection];
        
        for (uint i=0; i < unmatchedBetsArray.length; i++) {

            uint256 matchingAmount = 0;

             // bet amount higher then current placed bet 
            if(amountLeft > unmatchedBetsArray[i].amount) {
            	matchingAmount = unmatchedBetsArray[i].amount;
                amountLeft -= matchingAmount;
            } 
            // bet amount is lower or equel then current placed bet 
            else {
            	matchingAmount = amountLeft;
                amountLeft -= matchingAmount;
            }

            // place matched bets for participants
            placeMatchedBet(oppositeSide, _betType, _selection, _odds, matchingAmount, unmatchedBetsArray[i].fromAddr);

            // remove unmatched bet if full match
            if(matchingAmount == unmatchedBetsArray[i].amount){
                emit UnmatchedBetRemoved(oppositeSide, _betType, _selection, _odds, matchingAmount, unmatchedBetsArray[i].fromAddr);
                delete unmatchedBetsArray[i];
            }
            // update unmatched bet with remaining amount if partly matched
            else {
                unmatchedBetsArray[i].amount -= matchingAmount; 
                emit UnmatchedBetUpdated(oppositeSide, _betType, _selection, _odds, unmatchedBetsArray[i].amount, unmatchedBetsArray[i].fromAddr);
            }

            // Place current fully matched bet and exit
            if(amountLeft == 0){
                placeMatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
                matchedIndex++;
                return;
            }
        }

        // Place current partly matched bet and unmatched bet with remaining amount
        placeMatchedBet(_betSide, _betType, _selection, _odds, _amount - amountLeft, _fromAddr);
        placeUnmatchedBet(_betSide, _betType, _selection, _odds, amountLeft, _fromAddr);
        matchedIndex++;
    }

    // Internal function for placing unmatched bet
    function placeMatchedBet(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {

        // Save which _betType _selection combination is used
        if(!isCombinationUsed[_betType][_selection]){
            if(!isBetTypeUsed[_betType]){
                usedBetTypes.push(_betType);
                isBetTypeUsed[_betType] = true;
            }
            usedBetTypeSelections[_betType].push(_selection);
            isCombinationUsed[_betType][_selection] = true;
        }

        // TODO do something with matchIndex = matchedIndexes[_betType][_selection]

        // profit for lay = amount, if back calculate
        uint256 profit = _amount;
        if(_betSide == BetSide.Back){
            profit = (_amount * (_odds - 1000) / 1000);
        }

        matchedBets[_betSide][_betType][_selection].push(MatchedBetAmount(profit, _fromAddr));
        emit MatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
    
    // Internal function for placing unmatched bet
    function placeUnmatchedBet(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
        unmatchedBets[_betSide][_betType][_selection][_odds].push(UnmatchedBetAmount(_amount, _fromAddr));
        emit UnmatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }

    // Internal function for paying all sides from all matched bets for the game
    function withdrawWinners () internal {
        
        game.status = GameStatus.Closed;

        // loop over all used bet types
        for (uint i=0; i < usedBetTypes.length; i++) {
            BetType betType = usedBetTypes[i];

            // loop over all used selections inside the bet type
            for (uint y=0; y < usedBetTypeSelections[betType].length; y++) {
                uint8 selection = usedBetTypeSelections[betType][y];

                // now runs only with uniqe parms
                bool hasBackSideWon = resolver.checkResult(game.objectId, BetSide.Back, betType, selection);

                // get only winning bets
                BetSide winnerSide = (hasBackSideWon == true) ? BetSide.Back: BetSide.Lay;
                MatchedBetAmount[] memory wonBets = matchedBets[winnerSide][betType][selection];
            
                // loop over all wining bets and pay them
                for (uint z = 0; z < wonBets.length; z++) {
                    transferAmount(wonBets[z].fromAddr, wonBets[z].profit);
                }
            }
        }
    }

    function transferAmount(address addr, uint256 amount) internal {
        payable(addr).transfer(amount);
    }
}
