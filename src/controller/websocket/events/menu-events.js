//
import { serialize, deserialize } from "bson";

import * as Matchs from '../connections/matchs.js';
import * as Matchmaking from '../connections/matchmaking.js';
import * as Events from './events.js';
import * as Connections from '../connections/connections.js';


export function EnterMatchmaking(socket) {

    Matchmaking.AddPlayerToMatchmakingQueue(socket, (Success) => {

        let EventData = { Success };
        Events.SendEvent(socket, "enter-queue-result", EventData);

    })

}

export function ExitMatchmaking(socket) {

    Matchmaking.RemovePlayerFromMatchmakingQueue(socket, (Success) => {

        let EventData = { Success };
        Events.SendEvent(socket, "exit-queue-result", EventData);

    })

}