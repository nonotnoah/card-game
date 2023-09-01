"use strict";
exports.__esModule = true;
var emojis_1 = require("../utils/emojis");
var shuffle_1 = require("../utils/shuffle");
function makeDeck(numOfSymbols) {
    var shuffledEmojis = (0, shuffle_1.shuffleStringArray)(emojis_1["default"]);
    var cardsWithNumbers = [];
    var shuffle = true;
    var n = numOfSymbols - 1; // prime number
    // add first set of n + 1 cards
    for (var i = 0; i < n + 1; i++) {
        // add new card with first symbol
        cardsWithNumbers.push([1]);
        // add n + 1 symbols on the card
        for (var j = 0; j < n; j++) {
            cardsWithNumbers[i].push((j + 1) + (i * n) + 1);
        }
    }
    // add n sets of n cards
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            // append a new card with 1 symbol
            cardsWithNumbers.push([i + 2]);
            // add n symbols on the card
            for (var k = 0; k < n; k++) {
                var val = (n + 1 + n * k + (i * k + j) % n) + 1;
                cardsWithNumbers[cardsWithNumbers.length - 1].push(val);
            }
        }
    }
    if (shuffle) {
        var shuffledCards = cardsWithNumbers.map(function (card) { return (0, shuffle_1.shuffleNumberArray)(card); });
        cardsWithNumbers = shuffledCards;
    }
    var cardsWithSymbols = cardsWithNumbers.map(function (card, index) {
        return card.map(function (num) {
            return shuffledEmojis[num - 1];
        });
    });
    return cardsWithSymbols;
}
function checkValidity(deck) {
    var match = false;
    for (var i = 0; i < deck.length; i++) {
        var _loop_1 = function (j) {
            match = deck[i].some(function (symbol) { return deck[j].includes(symbol); });
        };
        for (var j = 0; j < deck.length; j++) {
            _loop_1(j);
        }
        match ? console.log("card ".concat(i, " \u2705")) : console.log("card ".concat(i, " \u274C"));
    }
}
var deck = makeDeck(8);
checkValidity(deck);
// console.log(deck)
