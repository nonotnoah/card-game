import * as React from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import '../styles/App.css'
import Card from './Cards'

function Dev() {
    const myDeck = new Deck(7)
    const deck = myDeck.makeDeck(7, animals)
    console.log(deck)

    const firstCard = deck[0]

    return (
        <Card card={firstCard} />
    )
}

export default Dev