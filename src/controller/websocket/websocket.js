// import { WebSocketServer } from 'ws');
import { WebSocketServer } from "ws";
import { serialize, deserialize } from "bson";

import * as Connections from './connections/connections.js';
import * as Events from './events/events.js';

export function SetupWebsockets(serverPort) {


    const webSocketServer = new WebSocketServer({ port: serverPort }, OnServerRunning(serverPort));

    webSocketServer.on('connection', function(socket) {

        OnUserConnected(socket)

        socket.on('message', function message(rawData) {

            let data = deserialize(rawData)
            Events.OnEventReceived(socket, data);

        });

        socket.on('close', function close() {

            console.log('disconnected');
            OnUserDisconnected(socket);

        });

    });

}

function OnServerRunning(serverPort) {

    console.log("----- SERVER RUNNING [on localhost: " + serverPort + "] -----");

}

function OnUserConnected(socket) {

    Connections.AddConnection(socket);

}

function OnUserDisconnected(socket) {

    Connections.RemoveConnectionById(socket.id);

}