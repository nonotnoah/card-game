"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const lobby_1 = __importDefault(require("./game/lobby"));
const randomID_1 = __importDefault(require("./utils/randomID"));
const sessionStore_1 = __importDefault(require("./sessionStore"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*'
    }
});
const serverStorage = new sessionStore_1.default(); // I wish this was an api
io.use((socket, next) => {
    // // on reconnect this will be the 'sessionID' value in sessionStorage
    // // on first connect this will be undefined
    // const sessionID: string = socket.handshake.auth.sessionID
    // console.log('session ID:', sessionID)
    // if (sessionID) {
    //   // find existing session
    //   const serverSession = serverStorage.findSession(sessionID)
    //   console.log('found existing sesison:', sessionID)
    //   if (serverSession) {
    //     socket.sessionID = sessionID
    //     socket.userID = serverSession.userID
    //     socket.username = serverSession.username
    //     socket.gameID = socket.handshake.auth.gameID
    //     socket.isHost = socket.handshake.auth.isHost
    //     socket.wins = 0
    //     return next()
    //   }
    // }
    const username = socket.handshake.auth.username;
    const isHost = socket.handshake.auth.isHost;
    const gameID = socket.handshake.auth.gameID;
    socket.sessionID = (0, randomID_1.default)();
    socket.userID = (0, randomID_1.default)();
    socket.username = username;
    socket.gameID = gameID;
    socket.isHost = isHost;
    socket.wins = 0;
    next();
});
let currentLobbies = {};
io.on('connection', (socket) => {
    console.log('socket connected:', socket.sessionID, socket.userID, socket.gameID, socket.isHost);
    // create new lobby if host, then join
    if (!currentLobbies[socket.gameID]) { // lobby doesn't exist
        if (socket.isHost) { // is host
            currentLobbies[socket.gameID] = new lobby_1.default(socket.gameID, io, serverStorage);
            currentLobbies[socket.gameID].joinLobby(socket);
        }
        else { // isn't host, lobby doesn't exist
            socket.emit('lobbyNotFound');
            socket.emit('alert', 'Lobby not found');
            socket.disconnect();
            console.log('tried to join nonexistent lobby');
        }
    }
    else { // not host, lobby exists
        if (currentLobbies[socket.gameID].gameStarted) {
            socket.emit('alert', 'Cannot join game in progress');
            socket.disconnect();
        }
        else {
            socket.emit('lobbyFound');
            currentLobbies[socket.gameID].joinLobby(socket);
        }
        // FIXME: create live game reconnect logic
        // // reconnect if applicable
        // if (currentLobbies[socket.gameID].currentGame && currentLobbies[socket.gameID].gameStarted) {
        //   //@ts-expect-error
        //   currentLobbies[socket.gameID].currentGame.reconnect(socket)
        //   console.log('GAME STARTED:', currentLobbies[socket.gameID].gameStarted)
        // }
    }
    // delete lobby if lobby exists and everyone disconnects
    socket.on('disconnect', () => {
        if (currentLobbies[socket.gameID]) {
            const numConnectedPlayers = Object.keys(currentLobbies[socket.gameID].connectedPlayers).length;
            if (numConnectedPlayers == 0) {
                delete currentLobbies[socket.gameID];
                console.log('deleting empty lobby');
            }
        }
    });
    // debug currently connected players
    // let playerIDs = serverStorage.findAllSessions()
    // console.log('sessions:\n', ...playerIDs)
});
server.listen(5000, () => {
    console.log('Server started on port 5000');
});
