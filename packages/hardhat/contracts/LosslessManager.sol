// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./LosslessV2.sol";
import "./BenqiLossless.sol";
import "../interfaces/QiAvaxInterface.sol";
import "../interfaces/BenqiLosslessInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/dev/ChainlinkClient.sol";

/** @title LosslessManager
 *  @dev This contract implement is a lossless betting contracts for football 1X2 that uses Benqi to generate yield
 * Contract has an owner to settle the bet, to be replaced by Chainlink.
 * This contract support multiple games
 * Process : - Owner creates contract.
 *           - Contract can also be sponsored : someone deposit without participating in betting.
 * QiAvax-Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
 * QiAvax-test : 0x219990FA1f91751539c65aE3f50040C6701cF219
 * Eth Contracts : See cETH addresses here 'https://compound.finance/docs#networks'
 */

contract LosslessManager is Ownable, ChainlinkClient
{
    using Chainlink for Chainlink.Request;

    // tracks games count
    uint256 public gamesCount;
    // interface to interact with qiToken
    QiAvaxInterface public qiToken;

    // mapping gameId => game contract address
    mapping(string => address) public gameIdToAddress;
    // mapping gameId => game Balance of QiToken
    mapping(string => uint256) public gameIdToTokenBalance;
    // mapping address => player balance available to withdraw
    mapping(address => uint256) public playerToBalance;
    // mapping gameId => address => bool if player bet or not
    mapping(string => mapping(address => bool)) public gameIdToPlayerIn;
    // mapping gameId => array containing players that placed a bet
    mapping(string => address[]) public gameIdToPlayers;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;


    event GameCreated(string gameId, uint256 gameCount, address gameAddress);
    //event GameSponsored(string gameId, uint256 amount);
    event BetPlaced(string gameId, BenqiLossless.BetSide betside, uint256 amount);
    event Winner(string gameId, address winner, uint256 amount);
    event ChainlinkReply(string gameId, uint256 winner);

    /**
     * @dev Initialize the contract settings .
     * For Avax use this address for QiAvax :
     * Fuji Testnet : 0x219990FA1f91751539c65aE3f50040C6701cF219
     * Avax Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
     */
    constructor(address _qiToken) {
        gamesCount = 0;
        qiToken = QiAvaxInterface(_qiToken);

        /*
        // Chainlink Integration
        // Polygon Mumbai
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        oracle = 0xc8D925525CA8759812d0c299B90247917d4d4b7C;
        jobId = "7ecb74753e414b54b26ed1b911b88d67";
        */

        // AVAX Fuji
        setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846);
        oracle = 0xD5c4D9Fe36d09e71940676b312D1500078E24C6a;
        jobId = "fee82cce27ec45c3af4d2ba0b9e2dd02";
        fee = 10**16;
    }

    /**
     * @dev Creates a game, only owner can : Feed in timestamp of start and finish
     */
    function create(
        string calldata _objectId,
        uint256 _matchStartTime,
        uint256 _matchFinishTime
    ) external onlyOwner {
        BenqiLossless _game = new BenqiLossless(_matchStartTime, _matchFinishTime);
        address _gameAddress = address(_game);
        gameIdToAddress[_objectId] = _gameAddress;
        emit GameCreated(_objectId, gamesCount, _gameAddress);
        gamesCount++;
    }

    /**
     * @dev Sponsor the contract, funds received will be used to generate yield.
     */
     /*
     Removing due to contract size issues. 
    function sponsor(string calldata _gameId) external payable {
        // Get amount and gameAddress
        uint256 amount = msg.value;
        address gameAddress = gameIdToAddress[_gameId];

        // Get balances and update game balance
        uint256 balanceBefore = qiToken.balanceOf(address(this));
        qiToken.mint{value: amount}();
        uint256 balanceAfter = qiToken.balanceOf(address(this));
        gameIdToTokenBalance[_gameId] += balanceAfter - balanceBefore;

        // Sponsor bet
        BenqiLossless Igame = BenqiLossless(gameAddress);
        Igame.sponsor(amount, msg.sender);

        // take into account msg.sender
        if (!gameIdToPlayerIn[_gameId][msg.sender]) {
            gameIdToPlayerIn[_gameId][msg.sender] = true;
            gameIdToPlayers[_gameId].push(msg.sender);
        }
        // emit event
        emit GameSponsored(_gameId, amount);
    }
    */

    /**
     * @dev Places the bet.
     */
    function placeBet(string calldata _gameId, uint256 _betSide) external payable {
        // Get amount and gameAddress
        uint256 amount = msg.value;
        address gameAddress = gameIdToAddress[_gameId];

        // Get balances and update game balance
        uint256 balanceBefore = qiToken.balanceOf(address(this));
        qiToken.mint{value: amount}();
        uint256 balanceAfter = qiToken.balanceOf(address(this));
        gameIdToTokenBalance[_gameId] += balanceAfter - balanceBefore;

        // Place bet
        BenqiLossless Igame = BenqiLossless(gameAddress);
        Igame.placeBet(msg.sender, amount, _betSide);

        // take into account msg.sender
        if (!gameIdToPlayerIn[_gameId][msg.sender]) {
            gameIdToPlayerIn[_gameId][msg.sender] = true;
            gameIdToPlayers[_gameId].push(msg.sender);
        }

        // emit event
        BenqiLossless.BetSide bettingSide = _betSide == 1
            ? BenqiLossless.BetSide.HOME
            : _betSide == 2
            ? BenqiLossless.BetSide.DRAW
            : BenqiLossless.BetSide.AWAY;
        emit BetPlaced(_gameId, bettingSide, amount);
    }

    /**
     * @dev Withdraw avaialble balance.
     */
    function withdraw() external {
        require(playerToBalance[msg.sender] > 0, "balance is zero");
        uint256 amount = playerToBalance[msg.sender];
        playerToBalance[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Settles match, winner and withdraw from pool from game with _gameId .
     * Only Owner can call, replace with chainlink
     */
    function setMatchWinnerAndWithdrawFromPool(
        string memory _gameId,
        uint256 _winningSide
    ) public {
        // Get gameAddress and contract
        address payable gameAddress = payable(gameIdToAddress[_gameId]);
        BenqiLossless benqiLossless = BenqiLossless(gameAddress);

        // Set Game Winner
        BenqiLossless Igame = BenqiLossless(gameAddress);
        Igame.setMatchWinner(_winningSide);

        // redeem money
        uint256 balanceBefore = address(this).balance;
        uint256 redeemAmount = gameIdToTokenBalance[_gameId];
        gameIdToTokenBalance[_gameId] = 0;
        qiToken.redeem(redeemAmount);
        uint256 balanceAfter = address(this).balance;

        // Update balances
        for (uint256 i = 0; i < gameIdToPlayers[_gameId].length; i++) {
            address player = gameIdToPlayers[_gameId][i];
            playerToBalance[player] += benqiLossless.playerBalance(player);
        }

        // update winner balance
        address winner = benqiLossless.winner();
        playerToBalance[winner] +=
            balanceAfter -
            balanceBefore -
            benqiLossless.totalDeposits();
        emit Winner(_gameId, winner, balanceAfter - balanceBefore);
    }

    /**
     * @dev helper to get Look QiAvax balance of _gameId
     */
    function getQiTokenBalance(string calldata _gameId)
        external
        view
        returns (uint256)
    {
        return gameIdToTokenBalance[_gameId];
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, the result is a string in the format "fixtureId_Winner"
     */
    function requestResult(string memory _objectId) public onlyOwner() returns(bytes32 requestId) 
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
        (string memory gameId, uint256 winner) = bytes32ToString(_data);
        // No players, so need for this step
        if (gameIdToPlayers[gameId].length > 0 ) {
            setMatchWinnerAndWithdrawFromPool(gameId, winner);
        }
        else {
            delete gameIdToAddress[gameId];
            delete gameIdToTokenBalance[gameId];
        }
        emit ChainlinkReply(gameId, winner);
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns(string memory, uint256)
    {
        uint256 i = 0;
        uint256 c= 0;
        uint256 k = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        uint256 ii = i - 1; // remove last digit from result
        bytes memory bytesArray = new bytes(ii);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            if (i < ii) {
                bytesArray[i] = _bytes32[i];
            }
            c = (uint8(_bytes32[i]) - 48);
            k = k * 10 + c;
        }
        // last digit inidicates the result of the match with this matchId.
        return (string(bytesArray), uint256(k % 10));
    }
}
