// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BettingContract  {

    enum GameStatus {Open, Closed}
    
    struct Game {
        address owner;
        string objectId;
        GameStatus status;
    }

    Game game;
    enum BetSide {Back, Lay}

    struct BetAmount {
        uint256 amount;
        address fromAddr;
    }
    /// Hold all unmatched bets: BetSide -> BetType -> BetType Selection Index -> Odds -> Amount[]
    mapping(BetSide => mapping(uint8 => mapping(uint8 => mapping(uint16 => BetAmount[])))) unmatchedBets;

    /// Unmatched bet has been placed.
    event UnmatchedBetPlaced(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);
     /// Matched bet has been placed.
    event MatchedBetPlaced(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr);

    /// Game has already ended.
    error GameAlreadyEnded();
    /// Bet Amount of `amount` to low.
    error AmountToLow(uint amount);
    /// Odds of `odds` to low.
    error OddsToLow(uint256 odds);
    /// Only Owner can call.
    error OnlyOwner();
    
    
    /// check if amount is greater then zero
    modifier amountGreaterZero(uint _amount) {
        if(_amount <= 0) revert AmountToLow(_amount);
        _;
    }
    
    /// check if valid odds
    modifier checkOdds(uint256 _odds) {
        if(_odds <= 1 ) revert OddsToLow(_odds);
        _;
    }
    
    /// check if valid odds
    modifier checkGameRunning() {
        if(game.status == GameStatus.Closed) revert GameAlreadyEnded();
        _;
    }
    
    /// check if address is from game owner
    modifier onlyOwner(address _addr) {
        if(_addr != game.owner) revert OnlyOwner();
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

        /// no matches found, place unmatched bet
        if(unmatchedBetsArray.length == 0){
            placeUnmatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
            return;
        }

        /// Create dynamic matching with array, with unmatchedBetsLength as max array length
        uint[] memory matchingWith = new uint[](unmatchedBetsArray.length);
        uint256[] memory matchingAmount = new uint256[](unmatchedBetsArray.length);
        uint matchingIndex = 0;
        bool canMatch = false;
        uint256 amountLeft = _amount;

        for (uint i=0; i < unmatchedBetsArray.length; i++) {
            /// bet amount higher then current unmatched bet 
            if(amountLeft > unmatchedBetsArray[i].amount) {
            	matchingWith[matchingIndex] = i;
            	matchingAmount[matchingIndex] = unmatchedBetsArray[i].amount;
                amountLeft -= matchingAmount[matchingIndex];
                matchingIndex++;
            } 
            /// bet amount is lower or equel then current unmatched bet 
            else if(amountLeft <= unmatchedBetsArray[i].amount) {
                matchingWith[matchingIndex] = i;
            	matchingAmount[matchingIndex] = amountLeft;
                amountLeft -= matchingAmount[matchingIndex];
                matchingIndex++;
            }
            /// break out loop, if bet can fully matched
            if(amountLeft == 0){
                canMatch = true;
                break;
            }
        }

        /// no matches found, place unmatched bet
        if(!canMatch) {
            placeUnmatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
            return;
        }

        // place matched bets
        for (uint i=0; i < matchingWith.length; i++) {
            placeMatchedBet(oppositeSide, _betType, _selection, _odds, matchingAmount[i], unmatchedBetsArray[matchingWith[i]].fromAddr);
            if(matchingAmount[i] == unmatchedBetsArray[matchingWith[i]].amount){
                delete unmatchedBets[oppositeSide][_betType][_selection][_odds][matchingWith[i]];
            }
            else {
                unmatchedBets[oppositeSide][_betType][_selection][_odds][matchingWith[i]].amount -= matchingAmount[i]; 
                //TODO emit update unmatched bet
            }
            
        }
        placeMatchedBet(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }

    /// Internal function for placing unmatched bet
    function placeMatchedBet(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
      emit MatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
    
    /// Internal function for placing unmatched bet
    function placeUnmatchedBet(BetSide _betSide, uint8 _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _fromAddr) internal {
        unmatchedBets[_betSide][_betType][_selection][_odds].push(BetAmount(_amount, _fromAddr));
        emit UnmatchedBetPlaced(_betSide, _betType, _selection, _odds, _amount, _fromAddr);
    }
}
