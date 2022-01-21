// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LosslessQi.sol";
import "../interfaces/QiAvaxInterface.sol";

/** @title BenqiLossless
 *  @dev This contract implement is a lossless betting contracts for football 1X2 that uses Benqi to generate yield
 * Contract has an owner to settle the bet, to be replaced by Chainlink.
 * Process : - Owner creates contract.
 *           - Contract can also be sponsored : someone deposit without participating in betting.
 * QiAvax-Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
 * QiAvax-test : 0x219990FA1f91751539c65aE3f50040C6701cF219
 * Eth Contracts : See cETH addresses here 'https://compound.finance/docs#networks'
 */
contract BenqiLossless is LosslessQi {
    /// token used to bet
    address public winner;
    /// amount of deposit by sponsors
    uint256 public sponsorDeposit;
    /// team winning
    BetSide public winningSide;
    ///  QiAvax interface to interact with QiAvax contract
    QiAvaxInterface public qiToken;
    enum BetSide {
        OPEN,
        HOME,
        DRAW,
        AWAY
    }
    /**
     * @dev Throws if betside is not valid
     */
    modifier correctBet(BetSide betSide) {
        require(
            betSide == BetSide.HOME ||
                betSide == BetSide.AWAY ||
                betSide == BetSide.DRAW,
            "invalid argument for bestide"
        );
        _;
    }

    /**
     * @dev Initialize the contract settings : matchStartTime, matchFinishTime, QiAvax address .
     */
    constructor(
        //address _qiAvax,//
        address _qiToken,
        uint256 _matchStartTime,
        uint256 _matchFinishTime
    ) Lossless(_matchStartTime, _matchFinishTime) {
        status = MatchStatus.OPEN;
        qiToken = QiAvaxInterface(_qiToken);
        winningSide = BetSide.OPEN;
        winner = address(0);
    }

    /**
     * @dev Sponsor the contract, funds received will be used to generate yield.
     */
    function sponsor() public payable isOpen {
        require(msg.value > 0, "amount must be positif");
        uint256 amount = msg.value;
        qiToken.mint{value: amount}();
        totalDeposits += amount;
        sponsorDeposit += amount;
        playerBalance[msg.sender] += amount;
    }

    /**
     * @dev Places the bet.
     */
    function placeBet(BetSide betSide)
        public
        payable
        isOpen
        correctBet(betSide)
    {
        require(msg.value > 0, "amount must be positif");
        uint256 amount = msg.value;
        if (betSide == BetSide.HOME) {
            placeHomeBet(amount);
        } else if (betSide == BetSide.AWAY) {
            placeAwayBet(amount);
        } else if (betSide == BetSide.DRAW) {
            placeDrawBet(amount);
        }
        qiToken.mint{value: amount}();
        totalDeposits += amount;
        playerBalance[msg.sender] += amount;
    }

    /**
     * @dev Withdraw balance after game is over.
     */
    function withdraw() public isPaid {
        require(playerBalance[msg.sender] > 0, "balance is zero");
        uint256 amount = playerBalance[msg.sender];
        playerBalance[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev can be called by owner to settle game and withdraw from the pool : To be replaced by chainlink.
     */
    function setMatchWinnerAndWithdrawFromPool(BetSide _winningSide)
        public
        onlyOwner
        correctBet(_winningSide)
    {
        require(status == MatchStatus.OPEN, "Cant settle this match");
        status = MatchStatus.PAID;
        winningSide = _winningSide;
        uint256 contractBalance = qiToken.balanceOf(address(this)); // 18/10 decimals
        qiToken.redeem(contractBalance);
        findWinner();
        payoutWinner();
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

    /**
     * @dev Internal function to update the balance of the winnner of the lottery.
     */
    function payoutWinner() internal {
        uint256 winnerPayout = address(this).balance - totalDeposits;
        playerBalance[winner] += winnerPayout;
    }

    /**
     * @dev helper to get QiAvax balance of contract.
     */
    function getQiTokenBalance() external view returns (uint256) {
        return qiToken.balanceOf(address(this));
    }

    /**
     * @dev This is needed to receive AVAX when calling `redeem`.
     */
    receive() external payable {}
}
