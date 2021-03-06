// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './resolvers/SoccerResolver.sol';
import './BetNFT.sol';

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
        uint256 amount;
        uint16 odds;
        address fromAddr;
        bool shiftedToNFT;
        //uint256 matchedIndex;
    }

    Game game;
    SoccerResolver public resolver;
    BetNFT public betNFT;
    uint256 nftBetIndex;
  
    // Hold all unmatched bets: BetSide -> BetType -> Selection -> Odds = UnmatchedBetAmount[]
    mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => UnmatchedBetAmount[])))) unmatchedBets;
    // Hold all matched bets: BetSide -> BetType -> Selection = MatchedBet[]
    mapping(BetSide => mapping(BetType => mapping(uint8 => MatchedBet[]))) matchedBets;

    // BetSide -> BetType -> Selection -> Odds -> Address = possible profit
    mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => mapping(address => uint256))))) betPossibleProfit;
    // nftBetIndex = possible profit
    mapping(uint256 => uint256) nftPossibleProfit;
     // nftBetIndex = won
    mapping(uint256 => bool) nftWon;

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
    // Matched bet has been placed.
    event BetMinted(uint256 tokenId);

    // Game has already ended.
    error GameAlreadyEnded();
    // Game not ended.
    error GameNotEnded();
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

    // check if valid odds
    modifier checkGameEnded()
    {
        if (game.status == GameStatus.Open)
            revert GameNotEnded();
        _;
    }

    
    // Create game struct and init vars
    constructor(string memory _objectId, SoccerResolver _resolver, BetNFT _betNFT) {
        game.owner = msg.sender;
        game.objectId = _objectId;
        game.status = GameStatus.Open;
        resolver = _resolver;
        betNFT = _betNFT;
        nftBetIndex = 0;
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

    function removeUnmatchedBet(BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public
    {
       UnmatchedBetAmount[] memory bets = unmatchedBets[_betSide][_betType][_selection][_odds];
       bool hasBet = false;

        // Mark bets as shifted, possible > 1, because of partial matches
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].fromAddr == msg.sender && bets[i].amount == _amount) {
                hasBet = true;
                emit UnmatchedBetRemoved(_betSide, _betType, _selection, _odds, _amount, msg.sender);
                transferAmount(msg.sender, _amount);
                delete unmatchedBets[_betSide][_betType][_selection][_odds][i];
                break;
            }
        }
        require(hasBet, "No Bet");      
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
                return;
            }
        }

        // Place current partly matched bet and unmatched bet with remaining amount
        placeMatchedBet(_betSide, _betType, _selection, _odds, _amount - amountLeft, _fromAddr);
        placeUnmatchedBet(_betSide, _betType, _selection, _odds, amountLeft, _fromAddr);
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

        // profit for lay = amount, if back calculate
        uint256 profit = _amount;
        if(_betSide == BetSide.Back){
            profit = (_amount * (_odds - 1000) / 1000);
        }
        betPossibleProfit[_betSide][_betType][_selection][_odds][_fromAddr] += profit;

        matchedBets[_betSide][_betType][_selection].push(MatchedBet(_amount, _odds, _fromAddr, false));
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
                MatchedBet[] memory wonBets = matchedBets[winnerSide][betType][selection];
            
                // loop over all wining bets and pay them
                for (uint z = 0; z < wonBets.length; z++) {
                    // mark shifted to NFT bets as won
                    if(wonBets[z].shiftedToNFT) {
                        uint256 tokenId = getTokenId(winnerSide, betType, selection, wonBets[z].odds, wonBets[z].fromAddr);
                        console.log(tokenId);
                        nftWon[tokenId] = true;
                        continue;
                    }
                    transferAmount(wonBets[z].fromAddr, betPossibleProfit[winnerSide][betType][selection][wonBets[z].odds][wonBets[z].fromAddr]);
                    delete betPossibleProfit[winnerSide][betType][selection][wonBets[z].odds][wonBets[z].fromAddr];
                }
                
            }
        }
    }
 
    function getTokenId (BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, address _address)  internal view returns (uint256) {
        return (uint(keccak256(abi.encode(game.objectId, _address, _betSide, _betType, _selection, _odds))) & 0xfff);
    }

    function transferAmount(address addr, uint256 amount) internal {
        payable(addr).transfer(amount);
    }

    function transferBetToNFT (BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, string memory _tokenURI) external returns (uint256)  {
        bool hasMatchedBet = false;

        // Mark bets as shifted, possible > 1, because of partial matches
        for (uint i=0; i < matchedBets[_betSide][_betType][_selection].length; i++) {
            if(matchedBets[_betSide][_betType][_selection][i].fromAddr == msg.sender && matchedBets[_betSide][_betType][_selection][i].odds == _odds){
                //matchedBets[_betSide][_betType][_selection][i].fromAddr = address(0); TODO currently need the address
                matchedBets[_betSide][_betType][_selection][i].shiftedToNFT = true;
                hasMatchedBet = true;
            }
        }
        require(hasMatchedBet, "No Matched Bet");

        uint256 nftBetId = nftBetIndex;
        nftBetIndex++;
        uint256 tokenId = getTokenId(_betSide, _betType, _selection, _odds, msg.sender);
    
        betNFT.mint(msg.sender, tokenId, game.objectId, nftBetId, _tokenURI);

        // Look the profit from the bets to the nft
        nftPossibleProfit[tokenId] = betPossibleProfit[_betSide][_betType][_selection][_odds][msg.sender];
        delete betPossibleProfit[_betSide][_betType][_selection][_odds][msg.sender];
        emit BetMinted(tokenId);
        return tokenId;
    }

    function withdrawWithNFT(uint256 tokenId) external checkGameEnded()
    {
        console.log(tokenId);
        bool hasWon = nftWon[tokenId];
        console.log(hasWon);
        betNFT.redeemCollectible(msg.sender, tokenId);
        require(hasWon, "Bet lost");
        transferAmount(msg.sender, nftPossibleProfit[tokenId]);
        delete nftPossibleProfit[tokenId];
    }

    
}
