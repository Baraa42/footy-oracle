// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LosslessV2.sol";
import "./BenqiLosslessV2.sol";
import "../interfaces/QiAvaxInterface.sol";
import "../interfaces/BenqiLosslessInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/** @title Manager
 *  @dev This contract implement is a lossless betting contracts for football 1X2 that uses Benqi to generate yield
 * Contract has an owner to settle the bet, to be replaced by Chainlink.
 * This contract support multiple games
 * Process : - Owner creates contract.
 *           - Contract can also be sponsored : someone deposit without participating in betting.
 * QiAvax-Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
 * QiAvax-test : 0x219990FA1f91751539c65aE3f50040C6701cF219
 * Eth Contracts : See cETH addresses here 'https://compound.finance/docs#networks'
 */

contract Manager is Ownable {
    // tracks games count
    uint256 public gamesCount;
    // array of games
    BenqiLossless[] public games;
    // interface to interact with qiToken
    QiAvaxInterface public qiToken;

    // mapping gameId => game contract address
    mapping(uint256 => address) public gameIdToAddress;
    // mapping address => gameId
    mapping(address => uint256) public addressToGameId;
    // mapping gameId => game Balance of QiToken
    mapping(uint256 => uint256) public gameIdToTokenBalance;
    // mapping address => player balance available to withdraw
    mapping(address => uint256) public playerToBalance;
    // mapping gameId => address => bool if player bet or not
    mapping(uint256 => mapping(address => bool)) public gameIdToPlayerIn;
    // mapping gameId => array containing players that placed a bet
    mapping(uint256 => address[]) public gameIdToPlayers;

    event GameCreated(uint256 gameId, address gameAddress);
    event GameSponsored(uint256 gameId, uint256 amount);
    event BetPlaced(
        uint256 gameId,
        BenqiLossless.BetSide betside,
        uint256 amount
    );
    event Winner(uint256 gameId, address winner, uint256 amount);

    /**
     * @dev Initialize the contract settings .
     * For Avax use this address for QiAvax :
     * Fuji Testnet : 0x219990FA1f91751539c65aE3f50040C6701cF219
     * Avax Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
     */
    constructor(address _qiToken) {
        gamesCount = 0;
        qiToken = QiAvaxInterface(_qiToken);
    }

    /**
     * @dev Creates a game, only owner can : Feed in timestamp of start and finish
     */
    function create(
        address _qiToken,
        uint256 _matchStartTime,
        uint256 _matchFinishTime
    ) external onlyOwner {
        BenqiLossless _game = new BenqiLossless(
            _qiToken,
            _matchStartTime,
            _matchFinishTime
        );
        address _gameAddress = address(_game);
        gameIdToAddress[gamesCount] = _gameAddress;
        addressToGameId[_gameAddress] = gamesCount;
        games.push(_game);
        emit GameCreated(gamesCount, _gameAddress);
        gamesCount++;
    }

    /**
     * @dev Sponsor the contract, funds received will be used to generate yield.
     */
    function sponsor(uint256 _gameId) external payable {
        // Get amount and gameAddress
        uint256 amount = msg.value;
        address gameAddress = gameIdToAddress[_gameId];

        // Get balances and update game balance
        uint256 balanceBefore = qiToken.balanceOf(address(this));
        qiToken.mint{value: amount}();
        uint256 balanceAfter = qiToken.balanceOf(address(this));
        gameIdToTokenBalance[_gameId] += balanceAfter - balanceBefore;

        // Sponsor bet
        BenqiLosslessInterface Igame = BenqiLosslessInterface(gameAddress);
        Igame.sponsor(amount, msg.sender);

        // take into account msg.sender
        if (!gameIdToPlayerIn[_gameId][msg.sender]) {
            gameIdToPlayerIn[_gameId][msg.sender] = true;
            gameIdToPlayers[_gameId].push(msg.sender);
        }
        // emit event
        emit GameSponsored(_gameId, amount);
    }

    /**
     * @dev Places the bet.
     */
    function placeBet(uint256 _gameId, uint256 _betSide) external payable {
        // Get amount and gameAddress
        uint256 amount = msg.value;
        address gameAddress = gameIdToAddress[_gameId];

        // Get balances and update game balance
        uint256 balanceBefore = qiToken.balanceOf(address(this));
        qiToken.mint{value: amount}();
        uint256 balanceAfter = qiToken.balanceOf(address(this));
        gameIdToTokenBalance[_gameId] += balanceAfter - balanceBefore;

        // Place bet
        BenqiLosslessInterface Igame = BenqiLosslessInterface(gameAddress);
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
        uint256 _gameId,
        uint256 _winningSide
    ) external onlyOwner {
        // Get gameAddress and contract
        address payable gameAddress = payable(gameIdToAddress[_gameId]);
        BenqiLossless benqiLossless = BenqiLossless(gameAddress);

        // Set Game Winner
        BenqiLosslessInterface Igame = BenqiLosslessInterface(gameAddress);
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
    function getQiTokenBalance(uint256 _gameId)
        external
        view
        returns (uint256)
    {
        return gameIdToTokenBalance[_gameId];
    }

    /**
     * @dev to receive avax
     */
    receive() external payable {}
}
