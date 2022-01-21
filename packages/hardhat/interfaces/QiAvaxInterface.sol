// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface QiAvaxInterface {
    function balanceOf(address) external view returns (uint256);

    function mint() external payable;

    function redeem(uint256) external returns (uint256);

    function redeemUnderlying(uint256) external returns (uint256);

    function exchangeRateCurrent() external view returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function balanceOfUnderlying(address) external returns (uint256);

    function approve(address, uint256) external returns (bool);

    function allowance(address, address) external view returns (uint256);
}
