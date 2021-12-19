// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EnumDeclaration.sol";
import "hardhat/console.sol";

contract SoccerResolver is Ownable {

    struct TeamScores {
       uint8 home;
       uint8 away;
    }

    struct Result {
        TeamScores firstHalf;
        TeamScores secondHalf;
        TeamScores fullTime;
        bool requested;
    }

    // All results mapped to objectId
    mapping(string => Result) results;

    // All functions mapped to BetType
    mapping(BetType => string) functionMapping;

    // Initialize chainlink and functions mapping
    constructor() {
        functionMapping[BetType.MatchWinner] = "hasMatchWinnerWon(string,uint8,uint8)";
    }

    // will be called from the other contract 
    function checkResult(string calldata _objectId, BetSide _betSide, BetType _betType, uint8 _selection) public returns (bool) {
       
        if(!results[_objectId].requested){
            // load result from chainlink and save it
            results[_objectId] = requestResult(_objectId);
        }

        // run only the functions that maps to the corosponding BetType
        string memory functionName = functionMapping[_betType];

        bytes memory result = callByName(functionName, _objectId, _betSide, _selection);
        // TODO convert bytes to bool

        return true;
    }

    // requests the result by its objectId from chainlink
    function requestResult(string calldata _objectId) internal returns (Result memory) {
        // TODO add chainlink logic

        // for better testing
        uint8 homeFirstHalf = 1;
        uint8 awayFirstHalf = 1;
        uint8 homeSecondHalf = 2;
        uint8 awaySecondHalf = 0;
        
        return
            Result(
                TeamScores({home: homeFirstHalf, away: awayFirstHalf}),
                TeamScores({home: homeSecondHalf, away: awaySecondHalf}),
                TeamScores({
                    home: homeFirstHalf + homeSecondHalf,
                    away: awayFirstHalf + awaySecondHalf
                }),
                true
            );
    }

    // internal helper for calling functions by its string name
    function callByName(string memory _functionSignature, string calldata _objectId, BetSide _betSide, uint8 _selection) internal returns(bytes memory) {
        (bool success, bytes memory data) = address(this).delegatecall(
            abi.encodeWithSelector(
                bytes4(
                    keccak256(bytes(_functionSignature))
                ),
                _objectId, _betSide, _selection
            )
        );
        require(success, 'Call failed');
        return data;
    }

    // All BetType check functions, need to be public, because callByName only works so
  
    // check match winner _selection 0 = home, _selection 1 = draw, _selection 2 = away
    function hasMatchWinnerWon(string calldata _objectId, BetSide _betSide, uint8 _selection) public returns (bool) {
        Result memory result = results[_objectId];

       if(_selection == 0){
           if(_betSide == BetSide.Back){
               return result.fullTime.home > result.fullTime.away;
           }else{
                return !(result.fullTime.home > result.fullTime.away);
           }
       }  else if(_selection == 1) {
            if(_betSide == BetSide.Back){
               return result.fullTime.home == result.fullTime.away;
           }else{
                return !(result.fullTime.home == result.fullTime.away);
           }
       } else {
            if(_betSide == BetSide.Back){
                return result.fullTime.home < result.fullTime.away;
           }else{
               return !(result.fullTime.home < result.fullTime.away);
           }
       }
    }    


}  