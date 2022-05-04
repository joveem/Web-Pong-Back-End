//
import { serialize, deserialize } from "bson";

import * as Matchs from '../connections/matchs.js';
import * as Events from './events.js';


export function StartMatch(playerConnection, EventData) {

    Events.SendEvent(playerConnection.socket, "enter-queue-result", EventData);

}

export function ExitMatch(playerConnection) {

    Matchs.RemovePlayerFromMatchmakingQueue(playerConnection.socket.id, (Success) => {

        let EventData = { Success };
        Events.SendEvent(playerConnection.socket, "exit-queue-result", EventData);

    })

}

export function SendMatchFinish(winnerSocket, loserSocket, playersScores) {

    let eventData = { PlayersScores: playersScores };

    Events.SendEvent(winnerSocket, "match-result-win", eventData);
    Events.SendEvent(loserSocket, "match-result-lose", eventData);

}

export function SendMatchFinishByGiveUp(winnerSocket, playersScores) {

    let eventData = { PlayersScores: playersScores };

    Events.SendEvent(winnerSocket, "match-result-win-by-give-up", eventData);

}


export function ApplyPlayerScoring(playerSocket, eventData) {

    if (eventData != null)
        Matchs.ApplyPlayerScoring(playerSocket, eventData.ScoringPlayerIndex);

    //////////////////////

}

export function ApplyBallExplosion(playerSocket, eventData) {

    if (eventData != null)
        Matchs.SendBallExplosion(playerSocket, eventData);

}

export function ApplyPlayerPosition(playerSocket, eventData) {

    if (eventData != null)
        Matchs.ApplyPlayerPosition(playerSocket, eventData.PlayerIndex, eventData.DestinationPosition);

}

export function ApplyBallState(playerSocket, eventData) {

    if (eventData != null)
        Matchs.ApplyBallState(playerSocket, eventData);

}

export function ApplyBallPosition(playerSocket, eventData) {

    if (eventData != null)
        Matchs.ApplyBallPosition(playerSocket, eventData);

}

export function ApplyPing(playerSocket, eventData) {

    if (eventData != null)
        Events.SendEvent(playerSocket, "match-ping", eventData)

}