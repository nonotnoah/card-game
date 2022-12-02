import * as React from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'

function Dev() {

    const myDeck = new Deck(7)
    const deck = myDeck.makeDeck(7, animals)
    console.log(deck)
    return (
        <h1>Test</h1>
    )
}

export default Dev