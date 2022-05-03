//
import * as WebSocket from './controller/websocket/websocket.js';

import { config } from 'dotenv';
config();
const hostPort = process.env.SERVER_PORT;

WebSocket.SetupWebsockets(hostPort);