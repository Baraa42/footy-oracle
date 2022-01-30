// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LosslessV2.sol";
import "../interfaces/QiAvaxInterface.sol";

/** @title BenqiLosslessV2
 *  @dev This contract implement is a lossless betting contracts for football 1X2
 * Contract has an owner who is the manager contract that deploys it.
 * Process : - Manager creates contract.
 *           - Contract can also be sponsored : someone deposit without participating in betting.
 * QiAvax-Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
 * QiAvax-test : 0x219990FA1f91751539c65aE3f50040C6701cF219
 * Eth Contracts : See cETH addresses here 'https://compound.finance/docs#networks'
 */
contract BenqiLossless is Lossless {
    /// token used to bet
    address public winner;
    /// amount of deposit by sponsors
    uint256 public sponsorDeposit;
    /// team winning
    BetSide public winningSide;

    enum BetSide {
        OPEN,
        HOME,
        DRAW,
        AWAY
    }
    /**
     * @dev Throws if betside is not valid
     */
    modifier correctBet(uint256 betSide) {
        require(
            betSide == 1 || betSide == 2 || betSide == 3,
            "invalid argument for bestide"
        );
        _;
    }

    /**
     * @dev Initialize the contract settings : matchStartTime, matchFinishTime, QiAvax address .
     */
    constructor(
        uint256 _matchStartTime,
        uint256 _matchFinishTime
    ) Lossless(_matchStartTime, _matchFinishTime) {
        status = MatchStatus.OPEN;
        winningSide = BetSide.OPEN;
        winner = address(0);
    }

    /**
     * @dev Sponsor the contract, funds received will be used to generate yield.
     */
    function sponsor(uint256 amount, address player)
        external
        /*isOpen*/
        onlyOwner
    {
        require(amount > 0, "amount must be positif");
        // uint256 amount = msg.value;
        totalDeposits += amount;
        sponsorDeposit += amount;
        playerBalance[player] += amount;
    }

    /**
     * @dev Places the bet.
     */
    function placeBet(
        address player,
        uint256 amount,
        uint8 betSide
    )
        external
        onlyOwner /*isOpen correctBet(betSide)*/
    {
        require(amount > 0, "amount must be positif");
        //uint256 amount = msg.value;
        if (betSide == 1) {
            placeHomeBet(player, amount);
        } else if (betSide == 3) {
            placeAwayBet(player, amount);
        } else if (betSide == 2) {
            placeDrawBet(player, amount);
        }
        totalDeposits += amount;
        playerBalance[player] += amount;
    }

    /**
     * @dev can be called by manager to settle game and set winner .
     */
    function setMatchWinner(uint256 _winningSide)
        external
        onlyOwner
    /*correctBet(_winningSide)*/
    {
        require(status == MatchStatus.OPEN, "Cant settle this match");
        status = MatchStatus.PAID;
        winningSide = _winningSide == 1 ? BetSide.HOME : _winningSide == 2
            ? BetSide.DRAW
            : BetSide.AWAY;
        findWinner();
        //payoutWinner();
    }

    /**
     * @dev Internal function to find the winnner of the lottery.
     */
    function findWinner() internal {
        if (winningSide == BetSide.HOME) {
            winner = findHomeWinner();
        } else if (winningSide == BetSide.AWAY) {
            winner = findAwayWinner();
        } else if (winningSide == BetSide.DRAW) {
            winner = findDrawWinner();
        }
    }
}
