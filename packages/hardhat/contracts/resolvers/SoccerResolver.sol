// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/dev/ChainlinkClient.sol";
import "../EnumDeclaration.sol";

contract SoccerResolver is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    struct TeamScores {
        uint8 home;
        uint8 away;
    }

    struct Result {
        //TeamScores firstHalf;
        //TeamScores secondHalf;
        //TeamScores fullTime;
        uint8 winner;
        bool requested;
    }

    // All results mapped to objectId
    mapping(string => Result) results;

    // All functions mapped to BetType
    mapping(BetType => string) functionMapping;

    // Initialize chainlink and functions mapping
    constructor(
        address _oracle,
        bytes32 _jobId,
        address _link
    ) {
        functionMapping[
            BetType.MatchWinner
        ] = "hasMatchWinnerWon(string,uint8,uint8)";

        // Chainlink related functions
        setChainlinkToken(_link);
        oracle = _oracle;
        jobId = _jobId;
        fee = 10**16;
    }

    // will be called from the other contract
    function checkResult(
        string calldata _objectId,
        BetSide _betSide,
        BetType _betType,
        uint8 _selection
    ) public returns (bool) {
        // request result if not requested already
        if (!results[_objectId].requested) {
            requestResult(_objectId);
        }

        // does this work with chainlink, because fullfill is called by the oracle?

        // run only the functions that maps to the corosponding BetType
        string memory functionName = functionMapping[_betType];
        return callByName(functionName, _objectId, _betSide, _selection);
    }

    // requests the result by its objectId from chainlink
    function requestResult(string calldata _objectId)
        internal
        returns (bytes32)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        req.add("fixtureId", _objectId);
        return sendChainlinkRequestTo(oracle, req, fee);
    }

    function fulfill(bytes32 _requestId, bytes32 _data)
        public
        recordChainlinkFulfillment(_requestId)
    {
        (string memory resultString, uint8 winner) = bytes32ToString(_data);
        results[resultString].winner = winner;
        results[resultString].requested = true;
    }

    function bytes32ToString(bytes32 _bytes32)
        public
        pure
        returns (string memory, uint8)
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
        //last digit inidicates the result of the match with this matchId.
        return (string(bytesArray), uint8(k % 10));
    }

    // internal helper for calling functions by its string name
    function callByName(
        string memory _functionSignature,
        string calldata _objectId,
        BetSide _betSide,
        uint8 _selection
    ) internal returns (bool) {
        (bool success, bytes memory data) = address(this).delegatecall(
            abi.encodeWithSelector(
                bytes4(keccak256(bytes(_functionSignature))),
                _objectId,
                _betSide,
                _selection
            )
        );
        require(success, "Call failed");
        return abi.decode(data, (bool));
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contrac

    // All BetType check functions, need to be public, because callByName only works so

    // check match winner _selection 0 = home, _selection 1 = draw, _selection 2 = away
    function hasMatchWinnerWon(
        string calldata _objectId,
        BetSide _betSide,
        uint8 _selection
    ) public view returns (bool) {
        uint8 winner = results[_objectId].winner;
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
