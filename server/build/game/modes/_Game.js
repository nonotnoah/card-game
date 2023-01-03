"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicGame = void 0;
class BasicGame {
    constructor({ io, players, gameID, Deck }) {
        this.io = io;
        this.players = players;
        this.gameID = gameID;
        // this.symbols = symbols
        // this.deck = new Deck(symbols, animals)
        this.deck = Deck;
        this.cards = {};
        this.playGame();
    }
    emitToRoom(event, ...args) {
        this.io.in(this.gameID).emit(event, ...args);
    }
    // add event listener for all sockets in room
    addListenerToAll(listener, func) {
        let names = [];
        Object.values(this.players).map(socket => {
            socket.on(listener, (res) => {
                func(res, socket);
            });
            names.push(socket.username);
        });
        console.log('Added listeners:', listener, 'to', this.gameID + ':\n', names);
    }
    // clear all listeners to prevent duplication on reconnection
    // there's probably a better way to do this
    removeListenersFromAll(listener) {
        Object.values(this.players).map(socket => {
            socket.removeListener('correct', () => listener());
        });
        console.log('Removed all listeners from room:', this.gameID);
    }
    // this is called in index.ts
    reconnect(socket) {
        socket.emit('reconnect', this.cards);
        this.players[socket.userID] = socket; // update with fresh socket
        this.removeListenersFromAll(this.correct); // refresh listeners
        this.addListenerToAll('correct', (guess, socket) => this.correct(guess, socket));
    }
    // ---
    // rules
    correct(guess, socket) {
        if (guess === this.cards.match) {
            console.log(socket.id, 'Correct guess!', guess);
            // draw next card and determine match
            this.nextTurn();
            if (this.cards.match === '') {
                this.emitToRoom('gameOver');
            }
        }
    }
    // ---
    nextTurn() {
        this.cards.card1 = this.deck.drawCard();
        this.cards.card2 = this.deck.drawCard();
        if (Array.isArray(this.cards.card1) && Array.isArray(this.cards.card2)) {
            this.cards.match = this.deck.compareCards(this.cards.card1, this.cards.card2);
            this.emitToRoom('draw', Object.assign({}, this.cards));
            // console.log('sending cards...')
        }
        else {
            this.cards.match = '';
        }
    }
    playGame() {
        this.emitToRoom('start');
        this.nextTurn();
        this.addListenerToAll('correct', (guess, socket) => {
            this.correct(guess, socket);
        });
    }
    endGame() {
        // TODO: delete serverStorage sessions that were in game
    }
}
exports.BasicGame = BasicGame;
