// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/dev/ChainlinkClient.sol";
import "./BetNFT.sol";
import "./EnumDeclaration.sol";

contract BettingAIO is Ownable, ChainlinkClient
{
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    enum GameStatus {Open, Closed }
    //enum BetSide {Back, Lay }
    //enum BetType { MatchWinner }
    //enum SelectionMatchWinner {Home, Draw, Away }

    struct Game {
        GameStatus status;
    }

    struct UnmatchedBetAmount {
        uint256 amount;
        address from;
    }

    struct MatchedBet {
        uint256 amount;
        uint16 odds;
        address from;
        bool shiftedToNFT;
    }

    BetNFT public betNFT;

    // Hold all games: ObjectId = Game
    mapping(string => Game) games;
    // Hold all unmatched bets: ObjectId -> BetSide -> BetType -> Selection -> Odds = UnmatchedBetAmount[]
    mapping(string => mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => UnmatchedBetAmount[]))))) unmatchedBets;
    // Hold all matched bets: ObjectId -> BetSide -> BetType -> Selection = MatchedBet[]
    mapping(string =>  mapping(BetSide => mapping(BetType => mapping(uint8 => MatchedBet[])))) matchedBets;

    // ObjectId -> BetSide -> BetType -> Selection -> Odds -> Address = possible profit
    mapping(string => mapping(BetSide => mapping(BetType => mapping(uint8 => mapping(uint16 => mapping(address => uint256)))))) betPossibleProfit;
    // ObjectId -> token id = possible profit
    mapping(string => mapping(uint256 => uint256)) nftPossibleProfit;
    // ObjectId -> token id = won
    mapping(string => mapping(uint256 => bool)) nftWon;
    // ObjectID -> nft index
    mapping(string => uint256) nftIndex;

    mapping(string => uint8) results;

    // Unmatched bet has been placed.
    event UnmatchedBetPlaced(string apiId, BetSide betSide, BetType betType, uint8 selection, uint16 odds, uint256 amount, address from);
    // Unmatched bet has been updated.
    event UnmatchedBetUpdated(string apiId, BetSide betSide, BetType betType, uint8 selection, uint16 odds, uint256 amount, address from);
    // Unmatched bet has been removed.
    event UnmatchedBetRemoved(string apiId, BetSide betSide, BetType betType, uint8 selection, uint16 odds, uint256 amount, address from);
    // Matched bet has been placed.
    event MatchedBetPlaced(string apiId, BetSide betSide, BetType betType, uint8 selection, uint16 odds, uint256 amount, address from);
    // Matched bet has been converted to NFT
    event BetConverted(string apiId, uint256 tokenId);
    
    //TODO add event for game ended

    // Game has already ended.
    error GameAlreadyEnded(string apiId);
    // Bet Amount of `amount` to low.
    error AmountToLow(uint256 amount);
    // Odds of `odds` to low.
    error OddsToLow(uint256 odds);

    // check if amount is greater then zero
    modifier amountGreaterZero(uint256 _amount)
    {
        if (_amount <= 0)
            revert AmountToLow(_amount);
        _;
    }

    // check if valid odds
    modifier checkOdds(uint256 _odds)
    {
        if (_odds <= 1000)
            revert OddsToLow(_odds);
        _;
    }

    // check if valid odds
    modifier checkGameRunning(string calldata _objectId)
    {
        if (games[_objectId].status == GameStatus.Closed)
            revert GameAlreadyEnded(_objectId);
        _;
    }

    // Create game struct and init vars
    constructor(BetNFT _betNFT)
    {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        oracle = 0xc8D925525CA8759812d0c299B90247917d4d4b7C;
        jobId = "7ecb74753e414b54b26ed1b911b88d67";
        fee = 10 ** 16;
        betNFT = _betNFT;
    }

    // Public function for placing back bet -> msg.value = bet amount
    function createBackBet(string calldata _objectId, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning(
        _objectId) amountGreaterZero(msg.value) checkOdds(_odds)
    {
        require(_amount == msg.value, "Amount and send value are not equal!");
        placeBet(_objectId, BetSide.Back, _betType, _selection, _odds, _amount, msg.sender);
    }

        // Public function for placing lay bet -> msg.value = bet liqidity
    function createLayBet(string calldata _objectId, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public payable checkGameRunning(
        _objectId) amountGreaterZero(msg.value) checkOdds(_odds)
    {
        uint256 liqidity = ((_amount * (_odds - 1000)) / 1000);
        require(liqidity == msg.value, "Liqidity and send value are not equal!");
        placeBet(_objectId, BetSide.Lay, _betType, _selection, _odds, _amount, msg.sender);
    }

    function removeUnmatchedBet(string calldata _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount) public
    {
       UnmatchedBetAmount[] memory bets = unmatchedBets[_objectId][_betSide][_betType][_selection][_odds];
       bool hasBet = false;

        // Mark bets as shifted, possible > 1, because of partial matches
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].from == msg.sender && bets[i].amount == _amount) {
                hasBet = true;
                emit UnmatchedBetRemoved(_objectId, _betSide, _betType, _selection, _odds, _amount, msg.sender);
                transferAmount(msg.sender, _amount);
                delete unmatchedBets[_objectId][_betSide][_betType][_selection][_odds][i];
                break;
            }
        }
        require(hasBet, "No Bet");      
    }

    // Internal function for placing and matching all bets
    function placeBet(string memory _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _from) internal
    {
        // Get all unmatched bets from the same bet type, selection, odds and opposite bet side
        BetSide oppositeSide = (BetSide.Back == _betSide) ? BetSide.Lay : BetSide.Back;
        UnmatchedBetAmount[] memory unmatchedBetsArray = unmatchedBets[_objectId][oppositeSide][_betType][_selection][_odds];

        // no bets found, place unmatched bet
        if (unmatchedBetsArray.length == 0) {
            placeUnmatchedBet(_objectId, _betSide, _betType, _selection, _odds, _amount, _from);
            return;
        }

        uint256 amountLeft = _amount;

        for (uint256 i = 0; i < unmatchedBetsArray.length; i++) {
            uint256 matchingAmount = 0;

            // bet amount higher then current placed bet
            if (amountLeft > unmatchedBetsArray[i].amount) {
                matchingAmount = unmatchedBetsArray[i].amount;
                amountLeft -= matchingAmount;
            }
            // bet amount is lower or equel then current placed bet
            else {
                matchingAmount = amountLeft;
                amountLeft -= matchingAmount;
            }

            // place matched bets for participants
            placeMatchedBet(_objectId, oppositeSide, _betType, _selection, _odds, matchingAmount, unmatchedBetsArray[i].from);

            // remove unmatched bet if full match
            if (matchingAmount == unmatchedBetsArray[i].amount) {
                emit UnmatchedBetRemoved(_objectId, oppositeSide, _betType, _selection, _odds, matchingAmount, unmatchedBetsArray[i].from);
                delete unmatchedBetsArray[i];
            }
            // update unmatched bet with remaining amount if partly matched
            else {
                unmatchedBetsArray[i].amount -= matchingAmount;
                emit UnmatchedBetUpdated(_objectId, oppositeSide, _betType, _selection, _odds, unmatchedBetsArray[i].amount, unmatchedBetsArray[i].from);
            }

            // Place current fully matched bet and exit
            if (amountLeft == 0) {
                placeMatchedBet(_objectId, _betSide, _betType, _selection, _odds, _amount, _from);
                return;
            }
        }

        // Place current partly matched bet and unmatched bet with remaining amount
        placeMatchedBet(_objectId, _betSide, _betType, _selection, _odds, _amount - amountLeft, _from);
        placeUnmatchedBet(_objectId, _betSide, _betType, _selection, _odds, amountLeft, _from);
    }

    // Internal function for placing unmatched bet
    function placeMatchedBet(string memory _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _from)
        internal
    {
        // profit for lay = amount, if back calculate
        uint256 profit = _amount;
        if (_betSide == BetSide.Back) {
            profit = ((_amount * (_odds - 1000)) / 1000);
        }
        betPossibleProfit[_objectId][_betSide][_betType][_selection][_odds][_from] += profit;

        matchedBets[_objectId][_betSide][_betType][_selection].push(MatchedBet(_amount, _odds, _from, false));
        emit MatchedBetPlaced(_objectId, _betSide, _betType, _selection, _odds, _amount, _from);
    }

    // Internal function for placing unmatched bet
    function placeUnmatchedBet(string memory _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, uint256 _amount, address _from)
        internal
    {
        unmatchedBets[_objectId][_betSide][_betType][_selection][_odds].push(UnmatchedBetAmount(_amount, _from));
        emit UnmatchedBetPlaced(_objectId, _betSide, _betType, _selection, _odds, _amount, _from);
    }

    // Internal function for paying all sides from all matched bets for the game
    function withdraw(string memory _objectId) internal
    {
        games[_objectId].status = GameStatus.Closed;
        // loop over all used bet types
        for (uint8 i = 0; i < 1; i++) {
            BetType betType = BetType(i);
            // loop over all selections inside the bet type
            for (uint8 y = 0; y < 3; y++) {
                uint8 selection = y;

                bool hasBackSideWon = hasMatchWinnerWon(_objectId, BetSide.Back, selection);

                // get only winning bets
                BetSide winnerSide = (hasBackSideWon == true) ? BetSide.Back : BetSide.Lay;
                MatchedBet[] memory wonBets = matchedBets[_objectId][winnerSide][betType][selection];

                // loop over all wining bets and pay them
                for (uint256 z = 0; z < wonBets.length; z++) {
                    // mark shifted to NFT bets as won
                    if (wonBets[z].shiftedToNFT) {
                        uint256 tokenId = getTokenId(_objectId, winnerSide, betType, selection, wonBets[z].odds, wonBets[z].from);
                        nftWon[_objectId][tokenId] = true;
                        continue;
                    }
                    transferAmount(wonBets[z].from, betPossibleProfit[_objectId][winnerSide][betType][selection][wonBets[z].odds][wonBets[z].from]);
                    delete betPossibleProfit[_objectId][winnerSide][betType][selection][wonBets[z].odds][wonBets[z].from];
                }
            }
        }
    }

    function getTokenId(string memory _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, address _address)
        internal pure returns(uint256)
    {
        return (uint256(keccak256(abi.encode(_objectId, _address, _betSide, _betType, _selection, _odds))) & 0xfff);
    }

    function transferAmount(address addr, uint256 amount) internal { payable(addr).transfer(amount); }

    function transferBetToNFT(string calldata _objectId, BetSide _betSide, BetType _betType, uint8 _selection, uint16 _odds, string calldata _tokenURI)
        external returns(uint256)
    {
        bool hasMatchedBet = false;

        // Mark bets as shifted, possible > 1, because of partial matches
        for (uint256 i = 0; i < matchedBets[_objectId][_betSide][_betType][_selection].length; i++) {
            if (matchedBets[_objectId][_betSide][_betType][_selection][i].from == msg.sender
                && matchedBets[_objectId][_betSide][_betType][_selection][i].odds == _odds) {
                // matchedBets[_betSide][_betType][_selection][i].from = address(0); TODO currently need the address
                matchedBets[_objectId][_betSide][_betType][_selection][i].shiftedToNFT = true;
                hasMatchedBet = true;
            }
        }
        require(hasMatchedBet, "No Matched Bet");

        uint256 nftBetId = nftIndex[_objectId];
        nftIndex[_objectId]++;
        uint256 tokenId = getTokenId(_objectId, _betSide, _betType, _selection, _odds, msg.sender);

        betNFT.mint(msg.sender, tokenId, _objectId, nftBetId, _tokenURI);

        // Look the profit from the bets to the nft
        nftPossibleProfit[_objectId][tokenId] = betPossibleProfit[_objectId][_betSide][_betType][_selection][_odds][msg.sender];
        delete betPossibleProfit[_objectId][_betSide][_betType][_selection][_odds][msg.sender];
        emit BetConverted(_objectId, tokenId);
        return tokenId;
    }


    function withdrawWithNFT(string calldata _objectId, uint256 tokenId) external
    {
        betNFT.redeemCollectible(msg.sender, tokenId);
        require(nftWon[_objectId][tokenId], "Bet lost");
        transferAmount(msg.sender, nftPossibleProfit[_objectId][tokenId]);
        delete nftPossibleProfit[_objectId][tokenId];
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, the result is a string in the format "fixtureId_Winner"
     */
    function requestResult(string memory _objectId) public returns(bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.add("fixtureId", _objectId);
        // Sends the request
        return sendChainlinkRequestTo(oracle, req, fee);
    }

    /*
      Sample answers:
      Match Id -> 710580 (supplied through requestData) -> Manchester City vs Arsenal
      Bytes32 reply from Chainlink Node -> 0x3731303538303100000000000000000000000000000000000000000000000000
      Conversion to string / uint256 (by calling bytes32ToString)-> 7105801
      Match Id is appended with  0 - pending, 1 - Home win, 2 - Away win, 3 - Draw
      City won this match, hence match id is appended with 1.
    */
    function fulfill(bytes32 _requestId, bytes32 _data) public recordChainlinkFulfillment(_requestId)
    {
        (string memory resultString, uint8 winner) = bytes32ToString(_data);
        results[resultString] = winner;
        if (games[resultString].status != GameStatus.Open) {
            withdraw(resultString);
            games[resultString].status = GameStatus.Closed;
        }
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns(string memory, uint8)
    {
        uint8 i = 0;
        uint8 c = 0;
        uint256 k = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        uint8 ii = i - 1; // remove last digit from result
        bytes memory bytesArray = new bytes(ii);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            if (i < ii) {
                bytesArray[i] = _bytes32[i];
            }
            c = (uint8(_bytes32[i]) - 48);
            k = k * 10 + c;
        }
        // last digit inidicates the result of the match with this matchId.
        return (string(bytesArray), uint8(k % 10));
    }

    function hasMatchWinnerWon(string memory _objectId, BetSide _betSide, uint8 _selection) public view returns(bool)
    {
        uint8 winner = results[_objectId];
        require(winner != 0, "No result");

        if (_selection == 0) {
            if (_betSide == BetSide.Back) {
                return winner == 1;
            } else {
                return !(winner == 1);
            }
        } else if (_selection == 1) {
            if (_betSide == BetSide.Back) {
                return winner == 3;
            } else {
                return !(winner == 3);
            }
        } else {
            if (_betSide == BetSide.Back) {
                return winner == 2;
            } else {
                return !(winner == 2);
            }
        }
    }
}
