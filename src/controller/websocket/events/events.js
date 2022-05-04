//
import * as Connections from './../connections/connections.js';
import * as MatchEvents from './match-events.js';
import * as MenuEvents from './menu-events.js';

import { serialize, deserialize } from "bson";


export function SendEvent(socket, EventName, EventData) {

    let event = {
        EventName: EventName,
        EventData: EventData
    }

    let rawData = serialize(event)

    socket.send(rawData);

}

export function SendEventBySocketId(socketId, EventName, EventData) {

    let socket = Connections.GetConnectionById(socketId)

    if (socket != null)
        SendEvent(socket, EventName, EventData)
    else
        console.log("SendEventBySocketId | socket NOT FOUND! ( socketId = " + socketId + " )");

}

export function OnEventReceived(socket, eventReceived) {

    switch (eventReceived.EventName) {

        // Main Menu events
        case "enter-match-queue":
            {

                MenuEvents.EnterMatchmaking(socket)
                break;

            }

        case "exit-match-queue":
            {

                MenuEvents.ExitMatchmaking(socket)
                break;

            }


            // Match events
        case "match-register-scoring":
            {

                MatchEvents.ApplyPlayerScoring(socket, eventReceived.EventData)
                break;

            }

        case "match-ball-explosion":
            {

                MatchEvents.ApplyBallExplosion(socket, eventReceived.EventData)
                break;

            }

        case "match-ping":
            {

                MatchEvents.ApplyPing(socket, eventReceived.EventData)
                break;

            }

            // Match movement events
        case "match-update-player-position":
            {

                MatchEvents.ApplyPlayerPosition(socket, eventReceived.EventData)
                break;

            }

        case "match-update-ball-state":
            {

                MatchEvents.ApplyBallState(socket, eventReceived.EventData)
                break;

            }

        case "match-update-ball-position":
            {

                MatchEvents.ApplyBallPosition(socket, eventReceived.EventData)
                break;

            }

        default:
            {

                console.log("--- default! (" + socket.id + ") ---");
                console.log("- eventReceived.EventName = " + eventReceived.EventName);
                console.log("ERROR: event name NOT FOUND! ( eventReceived.EventName = " + eventReceived.EventName + " )");

            }

    }

}