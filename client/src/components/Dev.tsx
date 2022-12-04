import * as React from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import '../styles/App.css'
import Card from './Cards'

type CardType = {
    card: (string[] | null | undefined)
}

function Dev() {
    const myDeck = new Deck(8, animals)
    const [cardOne, setCardOne] = React.useState(Array<string>)
    const [cardTwo, setCardTwo] = React.useState(Array<string>)
    const [match, setMatch] = React.useState('None')

    const handleDraw = () => {
        const card1 = myDeck.drawCard()
        const card2 = myDeck.drawCard()
        if (Array.isArray(card1) && Array.isArray(card2)) {
            setCardOne(card1)
            setCardTwo(card2)
            setMatch(myDeck.compareCards(cardOne, cardTwo))
        }
    }

    return (
        <>
        <button onClick={() => handleDraw()}>Draw</button>
        <Card card={cardOne} />
        <Card card={cardTwo} />
        <div className="match">{match}</div>
        </>
    )
}

export default Dev