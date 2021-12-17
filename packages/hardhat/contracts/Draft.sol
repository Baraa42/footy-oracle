// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";


contract Games is Ownable {

    /// @dev Admin who decide the outcome of the game
    address public admin;
    Game public game;
    /// scores 
    uint8 public homeScore;
    uint8 public awayScore;
    /// @notice track addresses of all players
    address[] public players;
    
    /// @notice tracks the amount of bets the player placed
    mapping(address => uint) playerNumberOfBets; 
    /// @notice tracks user balance
    mapping(address => uint) balances; 
    /// @notice tracks the payout of the player for each outcome, address => Selection => payout 
    mapping(address => mapping(Selection => uint)) public playerPayout1x2; 
    /// @notice tracks the payout of the player for each outcome, address => uint(0=Home handi, 1=draw, 2=away handi) => payout 
    mapping(address => mapping(uint => uint)) public playerPayoutHomeHandicap1; 

    enum GameStatus {Open, Over}
    enum Selection {Open, Home, Draw, Away}

     struct Game {
        address  owner;
        string teams;
        GameStatus status;
        Selection winner;
        // uint kickoffTime;  To be added later
    }


    /// @param teams string describing the Game/Bet e.g Real Madrid vs Inter Milan
    constructor(string memory teams /*, uint kickoff */ )  {  
        game.owner = msg.sender;
        game.teams = teams;
        game.status = GameStatus.Open;
        game.winner = Selection.Open;
        // game.kickoff = kickoff; To be added later

    }

    function placeBet1x2() internal {

        if(playerNumberOfBets[msg.sender]==0) { 
            players.push(msg.sender);
        }

        /// placing bet logique
    }

    function placeBetHomeHandicap1() internal {

        if(playerNumberOfBets[msg.sender]==0) { 
            players.push(msg.sender);
        }

        /// placing bet logique
    }


    //// Just example for 2 bets 
    function payout1x2() internal {
        for(uint i=0; i< players.length; i++) {
            // something like 
            balances[players[i]] += playerPayout1x2[players[i]][game.winner];
            
        }
    }

    function payoutHomeHandicap1() internal {
        uint8 result = 0;
        // Check which payout 
        if(homeScore==awayScore+1) { result=1;}
        if(homeScore<awayScore+1) { result=2;}
        // payout 
        for(uint i=0; i< players.length; i++) {
            // something like 
            balances[players[i]] += playerPayoutHomeHandicap1[players[i]][result];
            
        }
    }
    
    function payoutAll() internal {
        payout1x2();
        payoutHomeHandicap1();
        /// ...... etc
        for(uint i=0; i< players.length; i++) {
            uint amount = balances[players[i]];
            balances[players[i]] = 0;
            /// transfer amount to player[i] or to his balance on another account

            
        }
    }




}  