import { useState, useRef, memo, useEffect } from 'react';
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
    const [selectOne, setSelectOne] = useState('')
    const [selectTwo, setSelectTwo] = useState('')
    // console.log('table cards', cards)

    // 
    let guess = useRef({ one: 'None', two: 'None' })
    const lastCard = useRef(cards)
    // this checks if there's a new card every render
    useEffect(() => {
        if (lastCard.current !== cards) {
            console.log('new card detected', cards)
            // sets lastCard to current
            lastCard.current = cards
            // removes selection. only causes one re-render since lastCard is now up to date
            setSelectOne('')
            setSelectTwo('')
            // resets guesses
            guess.current.one = ''
            guess.current.two = ''
        }
    })

    const checkGuess = (id: number, guessed: string) => {
        if (id == 1) {
            guess.current.one = guessed
            setSelectOne(guessed)
        }
        if (id == 2) {
            guess.current.two = guessed
            setSelectTwo(guessed)
        }
        console.log('Card 1:', guess.current.one, '\nCard 2:', guess.current.two)
        if (guessed != '' && guess.current.one == guess.current.two) {
            sendGuess(guessed)
        }
    }
    
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