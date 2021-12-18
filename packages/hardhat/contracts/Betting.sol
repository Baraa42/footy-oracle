// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

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

    struct MatchedBet {
        BetSide betSide;
        BetType betType;
        uint8 selection;
        uint16 odds;
        uint256 amount;
        address fromAddr;
        bool won;
    }

    Game game;
    SoccerResolver public resolver;
  
    // Hold all unmatched bets: BetSide -> BetType -> BetType Selection Index -> Odds = UnmatchedBetAmount[]
    mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => UnmatchedBetAmount[])))) unmatchedBets;

    uint256 matchedIndex;
    // Hold all matched bets: BetSide -> matched index = MatchedBet[]
    mapping(BetSide => mapping(uint256 => MatchedBet[])) matchedBets;

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
        matchedIndex = 0;
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
            payout();
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
        matchedBets[_betSide][matchedIndex].push(MatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr, false)); // realy gas heavy
        emit MatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
    
    // Internal function for placing unmatched bet
    function placeUnmatchedBet(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
        unmatchedBets[_betSide][_betType][_selection][_odds].push(UnmatchedBetAmount(_amount, _fromAddr));
        emit UnmatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }

    // Internal function for paying all sides from all matched bets for the game
    function payout () internal {

        // loop over all matched bets, TODO reduce the load
        for (uint i=0; i < matchedIndex; i++) {
            MatchedBet[] memory matchedBackBets = matchedBets[BetSide.Back][i];
            MatchedBet[] memory matchedLayBets = matchedBets[BetSide.Back][i];

            bool hasBackSideWon = resolver.checkResult(game.objectId, matchedBackBets[0].betSide, matchedBackBets[0].betType, matchedBackBets[0].selection);

            // loop over all matched back bets
            for (uint y = 0; y < matchedBackBets.length; y++) {
                matchedBackBets[y].won = hasBackSideWon;
                if(hasBackSideWon) {
                    uint256 amount = (matchedBackBets[y].amount * ((matchedBackBets[y].odds - 1000 )  / 1000 )); // TODO is this right?, pre calculate
                    transferAmount(matchedBackBets[y].fromAddr, amount);
                }
            }

              // loop over all matched lay bets
            for (uint z = 0; z < matchedLayBets.length; z++) {
                matchedLayBets[z].won = !hasBackSideWon;
                if(!hasBackSideWon) {
                     uint256 amount = (matchedBackBets[z].amount * ((matchedBackBets[z].odds - 1000 )  / 1000 )); // TODO is this right?, pre calculate
                     transferAmount(matchedBackBets[z].fromAddr, amount);
                }
            }
        }
        game.status = GameStatus.Closed;
    }

    function transferAmount(address addr, uint256 amount) internal {
        payable(addr).transfer(amount);
    }
}
