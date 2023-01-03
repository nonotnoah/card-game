"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = require("../utils/deck");
const gameModes_1 = require("./modes/gameModes");
class Lobby {
    constructor(gameID, io, serverStorage) {
        // Init -------------------------------------
        // Rules ------------------------------------
        this.start = (socket, gameMode) => {
            // wait for host to start game
            const symbol = this.currentSize.symbol;
            let players = Object.keys(this.connectedPlayers);
            // console.log('room players', players)
            // console.log(socket.isHost, players.length)
            if (socket.isHost && players.length > 0) {
                const deck = new deck_1.Deck(symbol);
                console.log('creating new game');
                switch (gameMode) {
                    case 'tower':
                        this.currentGame = new gameModes_1.TowerGame(this.io, this.connectedPlayers, this.gameID, deck);
                        break;
                    case 'well':
                        // this.currentGame = new WellGame(this.io, this.connectedPlayers, this.gameID, deck)
                        break;
                    case 'hotPotato':
                        // this.currentGame = new HotPotatoGame(this.io, this.connectedPlayers, this.gameID, deck)
                        break;
                    case 'badApple':
                        // this.currentGame = new BadAppleGame(this.io, this.connectedPlayers, this.gameID, deck)
                        break;
                }
                this.gameStarted = true;
                socket.broadcast.to(this.gameID).emit('start'); // JoinLobbyRoom picks this up
            }
        };
        // removes socket from server storage and finds new host if needed
        this.deleteFromServerStorage = (socket) => {
            console.log(socket.userID, 'cancelled');
            this.serverStorage.deleteSession(socket.sessionID);
            if (socket.isHost) {
                this.newHost(socket);
            }
            // socket disconnects on clientside, so leaveLobby and updatePlayers
            // are called in the disconnect method!
            // this.leaveLobby(socket)
            // this.emitToRoom('updatePlayers', players)
        };
        this.disconnect = (socket) => {
            console.log('lobby.ts disconnect');
            // // update the connection status of the session
            // this.serverStorage.saveSession(socket.sessionID, {
            //   userID: socket.userID,
            //   username: socket.username,
            //   gameID: socket.gameID,
            //   isHost: socket.isHost,
            //   connected: false,
            // });
            // if game started, dc socket from game 
            // and find new host but keep session 
            // data in server store for potential rc
            const players = Object.values(this.connectedPlayers);
            this.leaveLobby(socket); // dc from lobby
            if (this.currentGame) {
                // if (socket.isHost && players.length > 0)
                if (socket.isHost)
                    this.newHost(socket); // this updates currentgame info too
                this.currentGame.disconnect(socket); // this emits currentgame update
            }
            else if (socket.isHost && !this.gameStarted) {
                this.deleteFromServerStorage(socket);
            }
            console.log('Socket Closed: ', socket.userID);
        };
        // }
        // emit to all when host changes size
        this.sizeChange = (socket, size) => {
            this.currentSize = size;
            console.log(this.currentSize);
            this.emitToRoom('sizeChange', size);
        };
        // emit sizechange to single socket
        this.needSizeChange = (socket) => {
            socket.emit('sizeChange', this.currentSize);
        };
        this.closeGame = (socket) => {
            if (this.currentGame) {
                this.connectedPlayers[this.currentGame.gameState.winner].wins++;
            }
            this.gameStarted = false;
            this.currentGame = undefined;
            delete this.currentGame;
        };
        this.needPlayers = (socket) => {
            const players = this.getPlayers();
            console.log('sending', players, 'to', socket.username);
            socket.emit('updatePlayers', players); // listener in Lobby.tsx
        };
        this.isGameStarted = (socket) => {
            if (this.gameStarted) {
                socket.emit('gameStarted');
            }
        };
        this.gameID = gameID;
        this.io = io;
        this.connectedPlayers = {};
        this.serverStorage = serverStorage;
        this.gameStarted = false;
        // this.currentGame = {} // this might not work
        this.currentSize = { symbol: 8, name: 'Normal: 57 cards', description: 'The standard experience' };
    }
    // Init -------------------------------------
    joinLobby(socket) {
        // add socket to connected player list
        this.connectedPlayers[socket.userID] = socket;
        // add lobby listeners
        this.addAnonListenerTo(socket, 'start', this.start);
        this.addAnonListenerTo(socket, 'disconnect', this.disconnect);
        this.addAnonListenerTo(socket, 'closeGame', this.closeGame);
        this.addAnonListenerTo(socket, 'sizeChange', this.sizeChange);
        this.addAnonListenerTo(socket, 'needSizeChange', this.needSizeChange);
        this.addAnonListenerTo(socket, 'needPlayers', this.needPlayers);
        this.addAnonListenerTo(socket, 'isGameStarted', this.isGameStarted);
        // join socket to room
        socket.join(socket.gameID);
        // send session details to newly connected socket
        socket.emit('session', {
            username: socket.username,
            sessionID: socket.sessionID,
            userID: socket.userID
        });
        console.log('emitting session to:', socket.userID);
        // persist session as key, value
        this.serverStorage.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            gameID: socket.gameID,
            isHost: socket.isHost,
            connected: true
        });
        console.log('server saving', socket.username + "'s session as:", socket.userID);
        // update playerlist
        const players = this.getPlayers();
        console.log('sending', players, 'to players');
        this.emitToRoom('updatePlayers', players); // listener in Lobby.tsx
    }
    killLobby() {
    }
    // make oldest connection host
    newHost(oldHost) {
        var _a;
        const players = Object.values(this.connectedPlayers);
        if (players.length > 0) {
            let newHost = players[0]; // old host has already been deleted
            newHost.isHost = true;
            if (this.currentGame) {
                this.currentGame.gameState.connectedPlayers[oldHost.userID].isHost = false;
                this.currentGame.gameState.connectedPlayers[newHost.userID].isHost = true;
                this.currentGame.emitUpdateGameState('new host');
            }
            this.emitToRoom('newHost', newHost.userID, (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.gameState.isRunning);
        }
    }
    // Rules ------------------------------------
    // Tools ------------------------------------
    // add listener to socket
    addAnonListenerTo(socket, listener, func) {
        socket.on(listener, (res) => {
            if (res) {
                func(socket, res);
            }
            else {
                func(socket);
            }
        });
    }
    // emit event to room
    emitToRoom(event, ...args) {
        this.io.in(this.gameID).emit(event, ...args);
    }
    leaveLobby(socket) {
        delete this.connectedPlayers[socket.userID];
        // update playerlist
        const players = this.getPlayers();
        console.log('sending', players, 'to players');
        this.emitToRoom('updatePlayers', players); // listener in Lobby.tsx
    }
    getPlayers() {
        let playerPacket = {};
        Object.values(this.connectedPlayers).map(socket => {
            playerPacket[socket.userID] = {
                userID: socket.userID,
                username: socket.username,
                isHost: socket.isHost
            };
        });
        return playerPacket;
    }
}
exports.default = Lobby;
