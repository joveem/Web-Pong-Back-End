//
//

import * as Connections from './connections.js';
import * as Matchs from './matchs.js';

// format: [{ socket : socket }]
let matchmakingQueue = [];

export function AddPlayerToMatchmakingQueue(socket, callback) {

    let result = false;

    let playerConnection = Connections.GetConnectionById(socket.id);

    if (playerConnection != null) {

        if (!IsPlayerOnMatchmaking(socket.id)) {

            console.log("- AddPlayerToMatchmakingQueue | player has been added to matchmakingQueue! ( socket.id = " + socket.id + " )");

            AddPlayerOnMatchmaking(socket, callback);

        } else {

            console.log("-- WARN | AddPlayerToMatchmakingQueue | player ALREADY on matchmakingQueue! ( socket.id = " + socket.id + " )");
            callback(true);

        }

    } else {

        console.log("-- ERROR | AddPlayerToMatchmakingQueue | connection NOT FOUND! ( socket.id = " + socket.id + " )");
        callback(false);

    }

    ResolveMatchmakingQueue();
}

export function RemovePlayerFromMatchmakingQueue(socket, callback) {

    let playerConnection = Connections.GetConnectionById(socket.id);

    if (playerConnection != null) {

        if (IsPlayerOnMatchmaking(socket.id)) {

            console.log("- RemovePlayerFromMatchmakingQueue | player has been removed from matchmakingQueue! ( socket.id = " + socket.id + " )");
            RemovePlayerOnMatchmaking(socket.id, callback);

        } else {

            console.log("-- WARN | RemovePlayerFromMatchmakingQueue | player IS NOT in matchmakingQueue! ( socket.id = " + socket.id + " )");
            callback(true);

        }

    } else {

        console.log("-- ERROR | RemovePlayerFromMatchmakingQueue | connection NOT FOUND! ( socketId = " + socketId + " )");
        callback(false);

    }

}

export function OnPlayerLeft(socketId, callback = null) {

    RemovePlayerOnMatchmaking(socketId);

}

function AddPlayerOnMatchmaking(socket, callback = null) {

    let newPlayerConnection = { socket }
    matchmakingQueue.push(newPlayerConnection);

    if (callback != null)
        callback(true);

}

function GetPlayerOnMatchmaking(socketId) {

    let playerValue = null;
    playerValue = matchmakingQueue.find((player) => player.socket.id == socketId);

    return playerValue;

}

function IsPlayerOnMatchmaking(socketId) {

    return GetPlayerOnMatchmaking(socketId) != null;

}

function RemovePlayerOnMatchmaking(socketId, callback = null) {

    matchmakingQueue = matchmakingQueue.filter(player => {

        let hasToRemovePlayer = (player.socket.id == socketId);

        if (hasToRemovePlayer)
            console.log("RemovePlayerOnMatchmaking | Player removed from matchmaking! ( socketId = " + socketId + " )");

        return !hasToRemovePlayer

    });

    if (callback != null)
        callback(true);

}

function ResolveMatchmakingQueue() {

    console.log("- Resolving matchmamaking...");

    while (matchmakingQueue.length > 1) {

        let playersToStartGame = matchmakingQueue.splice(0, 2);
        Matchs.SetupMatchWithPlayers(playersToStartGame);

    }

}