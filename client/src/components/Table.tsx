import { useState, useRef, memo } from 'react';
import Card from './Cards';
import { Socket } from 'socket.io-client';
import { Counter } from './Counter';

interface DrawPayload {
    card1: string[],
    card2: string[],
    match: string
}
interface TableProps {
    cards: DrawPayload
    sendGuess: (guess: string) => void
}

const MemoCard = memo(Card)

function Table({ cards, sendGuess }: TableProps) {
    // const [showCard, setShowCard] = useState(false)
    const [selectOne, setSelectOne] = useState('')
    const [selectTwo, setSelectTwo] = useState('')
    console.log('table cards', cards)

    // const lastCard = useRef(cards)
    // if (lastCard.current != cards) {
    //     lastCard.current == cards 
    //     setSelectOne('')
    //     setSelectTwo('')
    // }

    let guess = { one: 'None', two: 'None' }
    const checkGuess = (id: number, guessed: string) => {
        if (id == 1) {
            guess.one = guessed
            setSelectOne(guessed)
        }
        if (id == 2) {
            guess.two = guessed
            setSelectTwo(guessed)
        }
        console.log('Card 1:', guess.one, '\nCard 2:', guess.two)
        if (guess.one == guess.two) {
            sendGuess(guessed)
        }
    }
    // socket event listeners
    // I can memoize the cards so they both don't update
    // when a new selection is made
    return (
        <div className="wrapper"> 
            <Counter></Counter>
            <MemoCard selection={selectOne} id={1} card={cards.card1} match={cards.match} onGuess={checkGuess} />
            <MemoCard selection={selectTwo} id={2} card={cards.card2} match={cards.match} onGuess={checkGuess} />
            {/* {showCard ? (
                <>
                    <Card clearGuess={clearGuess} id={1} card={cards.one} match={cards.match} onGuess={checkGuess} />
                    <Card clearGuess={clearGuess} id={2} card={cards.two} match={cards.match} onGuess={checkGuess} />
                </>
            ) : (
                <>
                    <h1>Nothing here!</h1>
                </>
            )} */}
        </div>
    );
}

export default Table