"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicGame = void 0;
function instanceOfFunctionList(object) {
    return 'member' in object;
}
class BasicGame {
    constructor(io, players, gameID, Deck) {
        /**
        * @description *Reconnects with local game's custom event listeners.*
        * @emits 'reconnect'
        *
        * update {this.players} with current socket
        *
        * removes rule listeners from the current room
        *
        * re-adds listeners to the current room
        */
        this.reconnect = (socket) => {
            console.log('RECONNECTING', socket.username);
            socket.emit('reconnect', this.gameState);
            this.players[socket.userID] = socket; // update with fresh socket
            this.sockets = Object.values(this.players);
            this.userIDs = Object.keys(this.players);
            this.gameState.connectedPlayers[socket.userID].connected = true;
            this.removeListenerFromAll(this.rules); // remove listeners
            this.addListenersToAll(this.rules); // add listeners
            this.addAnonListenerToAll('ready', this.ready);
            // this.addAnonListenerToAll('needUpdate', this.needUpdate)
        };
        // tools -----------------------------------------
        // TEMPLATE
        // Rules/Listeners -------------------------------
        // this is for init value of this.currentRules
        this.ready = (userID, socket) => {
            console.log(socket.username, 'is ready');
            this.gameState.connectedPlayers[userID].ready = true;
            this.emitToRoom('update', 'player ready', this.gameState);
            this.readyList.push(userID);
        };
        this.io = io;
        this.players = players;
        this.gameID = gameID;
        this.deck = Deck;
        this.timeStart = 0;
        this.sockets = Object.values(this.players);
        this.userIDs = Object.keys(this.players);
        this.rules = this.initRules();
        this.currentRules = [];
        this.readyList = [];
        this.startAttempts = 0;
        this.gameState = {
            winner: '',
            isRunning: false,
            cardsRemaining: this.deck.length() + 1,
            middleCard: { state: 'faceUp', symbols: [] },
            connectedPlayers: {}
        };
        // map player info to gamestate
        for (const [userID, MySocket] of Object.entries(this.players)) {
            this.gameState.connectedPlayers[userID] = {
                connected: true,
                isHost: MySocket.isHost,
                username: MySocket.username,
                ready: false,
                score: 0,
                canPlay: true,
                guessTimes: [],
                card: { state: 'faceDown', symbols: [] }
            };
        }
        // add default listeners to all
        // this.addListenersToAll(this.rules)
        this.addAnonListenerToAll('ready', this.ready);
        // this.addAnonListenerToAll('needUpdate', this.needUpdate)
    }
    // tools -----------------------------------------
    /** @description Override this function in non-generic game class
     * to return list of game event listeners!
    */
    initRules() {
        const functions = {
            funcs: [
                this.ready
            ]
        };
        return functions;
        // return Array<(res: any, socket: MySocket) => void> 
    }
    /**
     * @emits emits to current {this.gameID} room
    */
    emitToRoom(event, ...args) {
        this.io.in(this.gameID).emit(event, ...args);
    }
    emitUpdateGameState(reason) {
        this.io.in(this.gameID).emit('update', reason, this.gameState);
    }
    /**
    * @description Add event listener for all sockets in room
    *
    * *Listener name needs to be the same as function rule!*
    * @example
    *
    * // example rule
    correct(guess: string, socket: MySocket) {
      if (guess === this.cards.match) {
        console.log(socket.id, 'Correct guess!', guess)
        // draw next card and determine match
        this.nextTurn()
        if (this.cards.match === '') {
          this.emitToRoom('gameOver')
        }
      }
    }
    // add listener 'correct'
    // manually:
    addListenerToAll([this.correct])
    // automatic:
    addListenerToAll(this.rules)
    */
    addListenersToAll({ funcs }) {
        funcs.map((func) => {
            Object.values(this.players).map(socket => {
                socket.on(func.name, (res) => {
                    func(res, socket);
                });
            });
            this.currentRules.push(func.name);
        });
        console.log('Added listeners:', funcs, 'to', this.gameID);
    }
    addAnonListenerToAll(listener, func) {
        Object.values(this.players).map(socket => {
            socket.on(listener, (res) => {
                if (res) {
                    func(res, socket);
                }
                else {
                    func(socket);
                }
            });
        });
        this.currentRules.push(listener);
        console.log('Added listener:', listener, 'to', this.gameID);
    }
    /**
    * @description Clear all listeners to prevent duplication on reconnection.
    *
    * *Listener name needs to be the same as function rule!*
    * @example
    *
    * // example rule
    correct(guess: string, socket: MySocket) {
      if (guess === this.cards.match) {
        console.log(socket.id, 'Correct guess!', guess)
        // draw next card and determine match
        this.nextTurn()
        if (this.cards.match === '') {
          this.emitToRoom('gameOver')
        }
      }
    }
    // remove listener 'correct'
    // manually:
    removeListenerFromAll([this.correct])
    // automatic:
    removeListenerFromAll(this.rules)
    */
    removeListenerFromAll({ funcs }) {
        funcs.map((func) => {
            Object.values(this.players).map(socket => {
                socket.removeListener(func.name, () => func());
            });
            const idx = this.currentRules.indexOf(func.name);
            delete this.currentRules[idx];
        });
        console.log('Removed', funcs, 'from room:', this.gameID);
    }
    /**
    * @description *Disconnects socket and triggers continue vote*
    * @emitsToRoom 'playerLeave'
    *
    * removes socket from {this.players}
    */
    disconnect(socket) {
        // TODO: have this trigger a "vote to continue without player" modal
        this.gameState.connectedPlayers[socket.userID].connected = false;
        delete this.players[socket.userID];
        this.sockets = Object.values(this.players);
        this.userIDs = Object.keys(this.players);
        this.emitUpdateGameState('player leave');
    }
    /** @returns true if expected players have joined
     *
     */
    playersReady(startAttempts) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (startAttempts > 9) { // if after 10 attempts all players haven't connected
            //   const notConnected = this.userIDs.filter(val => !this.readyList.includes(val));
            //   notConnected.map(userID => { // delete unconnected players
            //     delete this.players[userID]
            //   })
            //   this.emitToRoom('playerLeave', this.gameState)
            // }
            if (this.readyList.length == this.userIDs.length) {
                const diffList = this.readyList.filter(val => !this.userIDs.includes(val));
                if (diffList.length == 0) { // if readyList and userIDs are the same
                    return true;
                }
                else { // if foreign userIDs are detected?
                    diffList.map(userID => {
                        delete this.players[userID];
                        this.sockets = Object.values(this.players);
                        this.userIDs = Object.keys(this.players);
                    });
                    this.emitToRoom('update', 'playerleave', this.gameState);
                }
            }
            return false;
        });
    }
    checkReady() {
        return __awaiter(this, void 0, void 0, function* () {
            this.startAttempts++;
            return yield this.playersReady(this.startAttempts);
        });
    }
}
exports.BasicGame = BasicGame;
