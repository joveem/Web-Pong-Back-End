//
import { v4 as uuid } from 'uuid'
const v4options = { random: [0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36] };


import * as Events from '../events/events.js';
import * as Connections from './connections.js';
import * as Matchmaking from './matchmaking.js';
import * as MatchEvents from '../events/match-events.js';



let matchsList = [];

const matchMaximunScore = 3;


export function SetupMatchWithPlayers(playersList) {

    if (playersList.length == 2) {

        console.log("StartMatchWithPlayer | Starting Match! ( playersList = " + playersList + ")");

        let gameState = {
            hasFinished: false,
            playersScores: [0, 0],
            ballState: null,
            playersPositions: [0, 0]
        }
        let matchId = uuid();

        let match = {

            id: matchId,
            playersList,
            gameState

        };
        matchsList.push(match);

        let PlayerIndex = 0;
        match.playersList.map((connection) => {

            connection.socket.matchId = matchId;

            let EventData = {
                PlayerIndex,
                CurrentPlayerIndex: 1
            }
            Events.SendEvent(connection.socket, "setup-match", EventData)

            PlayerIndex++;

        })

        StartMatchStateUpdate(match);
        StartMatchAfterSeconds(match, 1)

    } else {

        console.log("StartMatchWithPlayer | unexpected playersList length! ( playersList = " + playersList + ")");

    }

}

function RemoveMatchById(matchId) {

    matchsList = matchsList.filter(match => match.id !== matchId);

}

function RemoveMatch(match) {

    if (match != null)
        RemoveMatchById(match.id);
    else
        console.log("ERROR | RemoveMatch | UNDEFINED match!");

}

function GetMatchById(matchId) {

    let matchValue = null;
    matchValue = matchsList.find((matchs) => matchs.id == matchId);

    return matchValue;

}

function HandleMatchScore(match, lastScoringPlayerIndex) {

    let winnerSocket = null;
    let loserSocket = null;

    if (match.gameState.playersScores[0] >= matchMaximunScore) {

        match.gameState.hasFinished = true;
        winnerSocket = match.playersList[0].socket;
        loserSocket = match.playersList[1].socket;

    }

    if (match.gameState.playersScores[1] >= matchMaximunScore) {

        match.gameState.hasFinished = true;
        winnerSocket = match.playersList[1].socket;
        loserSocket = match.playersList[0].socket;

    }

    SendPlayersScoresUpdate(match);

    if (match.gameState.hasFinished)
        FinishMatch(match, winnerSocket, loserSocket)
    else
        FinishRound(match, lastScoringPlayerIndex);

}


function FinishRound(match, lastScoringPlayerIndex) {

    if (match != null) {

        let currentPlayerIndex = -1;
        let roundDelaySeconds = 2;

        switch (lastScoringPlayerIndex) {

            case 0:

                currentPlayerIndex = 1;
                break;

            case 1:

                currentPlayerIndex = 0;
                break;

            default:
                {

                    let debugText = "!!! ERROR | FinishRound | UNEXPECTED player index! " +
                        "( lastScoringPlayerIndex = " + lastScoringPlayerIndex + " )"

                    console.log(debugText);
                    break;

                }

        }

        if (currentPlayerIndex != -1)
            StartRoundAfterSeconds(match, currentPlayerIndex, roundDelaySeconds);

    }

}

function StartRoundAfterSeconds(match, currentPlayerIndex, secondsToStart) {

    if (match != null)
        setTimeout(() => SendRoundStart(match, currentPlayerIndex), secondsToStart * 1000);

}

function FinishMatch(match, winnerSocker, loserSocket) {

    MatchEvents.SendMatchFinish(
        winnerSocker,
        loserSocket,
        match.gameState.playersScores)

    if (match.matchUpdateId)
        clearInterval(match.matchUpdateId);

    RemoveMatch(match);

}

function FinishMatchByGiveUp(quitterConnection, matchToFinish) {

    var debugText = "FinishMatchByGiveUp | Finishing game by Give Up! " +
        "( quitter id = " + quitterConnection.socket.id + " | " +
        "match id = " + matchToFinish.id + " )";

    console.log(debugText)

    if (matchToFinish.playersList[0].socket.id == quitterConnection.socket.id) {

        MatchEvents.SendMatchFinishByGiveUp(
            matchToFinish.playersList[1].socket,
            matchToFinish.gameState.playersScores)

    } else {

        MatchEvents.SendMatchFinishByGiveUp(
            matchToFinish.playersList[0].socket,
            matchToFinish.gameState.playersScores)

    }

    if (matchToFinish.matchUpdateId != null)
        clearInterval(matchToFinish.matchUpdateId);

}

export function OnPlayerLeft(socketId, callback = false) {

    console.log("OnPlayerLeft | Searching quitter player connection... ( socketId = " + socketId + " )");
    let quitterConnection = Connections.GetConnectionById(socketId)

    if (quitterConnection != null) {

        console.log("OnPlayerLeft | Searching quitter player match... ( matchId = " + quitterConnection.socket.matchId + " )");
        let matchToFinish = GetMatchById(quitterConnection.socket.matchId)

        if (matchToFinish != null)
            console.log("OnPlayerLeft | Match found!");

        if (matchToFinish != null && !matchToFinish.gameState.hasFinished) {

            console.log("OnPlayerLeft | Match not finished, finishing match!");
            FinishMatchByGiveUp(quitterConnection, matchToFinish);

        }

    }

}


function StartMatchStateUpdate(match) {

    let ticksPerSecond = 32;

    let matchUpdateId = setInterval(() => {

        SendPlayersPositions(match);
        SendBallPosition(match);

    }, 1000 / ticksPerSecond)

    match.matchUpdateId = matchUpdateId;

}

function StartMatchAfterSeconds(match, secondsToStart) {

    setTimeout(() => SendMatchStart(match), secondsToStart * 1000);

}

function SendMatchStart(match) {

    if (match != null) {

        SendRoundStart(match, 1)

    }

}

function SendRoundStart(match, currentPlayerIndex) {

    if (match != null) {

        match.playersList.map((connection) => {

            let EventData = {
                CurrentPlayerIndex: currentPlayerIndex
            }
            Events.SendEvent(connection.socket, "match-start-round", EventData)

        })

    }

}

function SendPlayersScoresUpdate(match) {

    if (match != null) {

        let scoreUpdateEventData = {

            PlayersScores: match.gameState.playersScores

        };

        match.playersList.map((player) => {

            Events.SendEvent(player.socket, "match-score-update", scoreUpdateEventData);

        });

    } else
        console.log("WARN | SendPlayersScoresUpdate | UNDEFINED MATCH!");

}

function SendPlayersPositions(match) {

    let player0Position = {
        PlayerIndex: 0,
        DestinationPosition: match.gameState.playersPositions[0]
    };

    let player1Position = {
        PlayerIndex: 1,
        DestinationPosition: match.gameState.playersPositions[1]
    };

    Events.SendEvent(match.playersList[0].socket, "match-update-player-position", player1Position);
    Events.SendEvent(match.playersList[1].socket, "match-update-player-position", player0Position);

}

function SendBallPosition(match) {

    if (match.gameState.ballState != null) {

        let ballState = match.gameState.ballState;

        Events.SendEvent(match.playersList[0].socket, "match-update-ball-position", ballState);
        Events.SendEvent(match.playersList[1].socket, "match-update-ball-position", ballState);

    }

}

export function ApplyPlayerScoring(socket, scoringPlayerIndex) {

    if (socket != null) {

        // console.log("ApplyPlayerPosition | playerIndex = " + playerIndex + " | playerPosition = " + playerPosition);
        let playerMatch = GetMatchById(socket.matchId)

        if (playerMatch != null) {

            playerMatch.gameState.playersScores[scoringPlayerIndex]++;
            HandleMatchScore(playerMatch, scoringPlayerIndex);

        }

    }

}

export function SendBallExplosion(socket, ballExplosionEventData) {

    if (socket != null) {

        let playerMatch = GetMatchById(socket.matchId)

        if (playerMatch != null) {

            let receiverPlayer = playerMatch.playersList[ballExplosionEventData.ReceiverPlayerIndex];

            Events.SendEvent(receiverPlayer.socket, "match-ball-explosion", ballExplosionEventData);

        }
    }

}

export function ApplyPlayerPosition(socket, playerIndex, playerPosition) {

    if (socket != null) {

        // console.log("ApplyPlayerPosition | playerIndex = " + playerIndex + " | playerPosition = " + playerPosition);
        let playerMatch = GetMatchById(socket.matchId)


        if (playerMatch != null)
            playerMatch.gameState.playersPositions[playerIndex] = playerPosition;

    }

}

export function ApplyBallState(socket, ballState) {

    if (socket != null) {

        let playerMatch = GetMatchById(socket.matchId)

        if (playerMatch != null) {

            playerMatch.gameState.ballState = ballState;

            playerMatch.playersList.map((player) =>
                Events.SendEvent(player.socket, "match-update-ball-state", ballState));

        }

    }

}

export function ApplyBallPosition(socket, ballPosition) {

    if (socket != null) {

        let playerMatch = GetMatchById(socket.matchId)

        if (playerMatch != null)
            playerMatch.gameState.ballState = ballPosition;

    }

}