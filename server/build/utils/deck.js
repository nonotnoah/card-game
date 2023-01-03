"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
const emojis_1 = __importDefault(require("./emojis"));
const shuffle_1 = require("./shuffle");
class Deck {
    constructor(n, imgs = emojis_1.default) {
        this.rangeArray = [];
        n = n - 1; // to get real number of symbols
        this.rangeArray = this.range(n);
        this.nValue = n;
        this.cards = this.makeDeck(n, (0, shuffle_1.shuffleArray)(imgs));
        // make a deep copy of the deck
        this.cardsCopy = (0, shuffle_1.shuffleDeck)([...this.cards]);
        // this.cardsCopy = shuffleDeck([...this.cards]).slice(55)
        // this.test()
    }
    symbolsToDeckSize(s) {
        return (s ^ 2 - s + 1);
    }
    length() {
        return this.cardsCopy.length;
    }
    range(n = this.nValue) {
        const arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }
    test(n = this.nValue) {
        console.log(this.cardsCopy);
        console.log('ordinarypoints:', this.ordinaryPoints(n));
        console.log('pointsatinfinity:', this.pointsAtInfinity(n));
        console.log('allpoints:', this.allPoints(n));
        console.log('alllines:', this.allLines(n));
    }
    ordinaryPoints(n = this.nValue) {
        const arr = [];
        this.rangeArray.map(x => this.rangeArray.map(y => arr.push([x, y])));
        return arr;
    }
    pointsAtInfinity(n = this.nValue) {
        const pts = [...this.rangeArray];
        pts.push('inf');
        return pts;
    }
    allPoints(n = this.nValue) {
        const ordPts = this.ordinaryPoints(n);
        const ptsAtInf = this.pointsAtInfinity(n);
        for (const element of ptsAtInf) {
            ordPts.push(element);
        }
        return ordPts;
    }
    ordinaryLine(m, b, n = this.nValue) {
        const line = [];
        this.rangeArray.map(x => line.push([x, (m * x + b) % n]));
        line.push([m]);
        return line;
    }
    verticalLine(x, n = this.nValue) {
        const line = [];
        this.rangeArray.map(y => line.push([x, y]));
        line.push('inf');
        return line;
    }
    lineAtInfinity(n = this.nValue) {
        return this.pointsAtInfinity(n);
    }
    allLines(n = this.nValue) {
        const lines = [];
        this.rangeArray.map(m => this.rangeArray.map(b => lines.push(this.ordinaryLine(m, b, n))));
        this.rangeArray.map(x => lines.push(this.verticalLine(x, n)));
        lines.push(this.lineAtInfinity(n));
        return lines;
    }
    makeDeck(n = this.nValue, imgs) {
        const points = this.allPoints(n);
        const mapping = {};
        // iterate through points[] and imgs[]
        points.forEach((point, index) => {
            const img = imgs[index];
            mapping[point] = img;
        });
        // loops through lines which contain points. 
        // loops those points onto the map's identical points
        // pushes value of point key (the picture) onto card array
        const lines = [];
        const allLines = this.allLines(n);
        for (const line of allLines) {
            const card = [];
            line.map(point => {
                if (typeof point != "string") { // [0, 0] -> to string
                    card.push(mapping[point.toString()]);
                }
                else {
                    card.push(mapping[point]); // 'inf' is already string
                }
            });
            lines.push(card);
        }
        return lines;
    }
    /** @returns cardObj.symbols as undefined if there are no cards left to draw
     */
    drawCard(state) {
        let card = this.cardsCopy.shift();
        if (card) {
            card = (0, shuffle_1.shuffleArray)(card);
        }
        const cardObj = { state: state, symbols: card };
        return cardObj;
    }
    /** @returns guess if match, false if not
     */
    checkGuess(guess, card) {
        if (card.symbols) {
            for (let emoji of card.symbols) {
                if (guess == emoji) {
                    return guess;
                }
            }
        }
        return false;
    }
    compareCards(card1, card2) {
        for (let symbol1 of card1) {
            for (let symbol2 of card2) {
                if (symbol1 == symbol2) {
                    return symbol1;
                }
            }
        }
        return 'No match';
    }
}
exports.Deck = Deck;
