// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

enum BetSide {Back, Lay}

// Definies all bet types
enum BetType { MatchWinner, GoalsOverUnder, HandicapResult }

// Definies selections for each bet type
enum SelectionMatchWinner { Home, Draw, Away }
enum SelectionGoalsOverUnder { OverOne, UnderOne, OverTwo, UnderTwo, OverThree, UnderThree, OverFour, UnderFour, OverSix, UnderSix, OverSeven, UnderSeven } // OverOne = Over 0.5 ... UnderSeven = Under 6.5
enum SelectionHandicapResult { HomePlus1, DrawPlus1, AwayPlus1, HomeMinus1, DrawMinus1, AwayMinus1, HomeMinus2, DrawMinus2, AwayMinus2, HomeMinus3, DrawMinus3, AwayMinus3, HomeMinus4, DrawMinus4, AwayMinus4 }