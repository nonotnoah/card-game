import * as React from 'react';
import { useEffect, useState } from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import '../styles/App.css'
import CardProps from './Cards'
import { shuffleArray } from '../utils/shuffle';

type CardType = {
  card: (string[] | null | undefined)
}

shuffleArray(animals)

const myDeck = new Deck(7, animals)
shuffleArray(myDeck.cardsCopy)

function Dev() {
  const [cards, setCards] = useState({
    one: [] as string[],
    two: [] as string[]
  })
  const [match, setMatch] = useState('No match')

  const handleDraw = () => {
    const card1 = myDeck.drawCard()
    const card2 = myDeck.drawCard()
    if (Array.isArray(card1) && Array.isArray(card2)) {
      shuffleArray(card1)
      shuffleArray(card2)
      setCards({ one: card1, two: card2 })
    }
  }
  useEffect(() => {
    setMatch(myDeck.compareCards(cards.one, cards.two))
  }, [cards])

  return (
    <>
      <button onClick={() => handleDraw()}>Draw</button>
      <Card card={cards.one} />
      <Card card={cards.two} />
      <div className="match">{match}</div>
    </>
  )
}

export default Dev