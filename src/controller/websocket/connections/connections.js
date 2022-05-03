//

import { serialize, deserialize } from "bson";
import { v4 as uuid } from 'uuid';
const v4options = { random: [0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36] };

import * as Matchs from './matchs.js';
import * as Matchmaking from './matchmaking.js';

// format:
// { socket : socket,
//   status: "status"}
let playersConnections = [];

export function AddConnection(socket) {


    let socketId = uuid();
    socket.id = socketId;
    socket.gameState = "lobby"; //"matchmaking"; //"game";

    console.log("--- Player Connected! (" + socketId + ") ---");

    let newPlayerConnection = {

        socket,
        status: "master",

    }

    playersConnections.push(newPlayerConnection);

}

export function RemoveConnectionById(socketId) {

    Matchmaking.OnPlayerLeft(socketId);
    Matchs.OnPlayerLeft(socketId);
    playersConnections = playersConnections.filter(connection => connection.socket.id !== socketId);

}

export function GetConnectionById(socketId) {

    let playerConnection = null;

    playerConnection = playersConnections.find(connection => connection.socket.id == socketId);

    return playerConnection;

}