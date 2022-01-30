// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface BenqiLosslessInterface {
    function owner() external view returns (address);

    function winner() external view returns (address);

    function sponsor(uint256, address) external;

    function placeBet(
        address,
        uint256,
        uint256
    ) external;

    function withdraw() external;

    function setMatchWinner(uint256) external;

    function getQiTokenBalance() external view returns (uint256);
}
