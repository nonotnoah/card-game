import { shuffleStringArray, shuffleDeck, shuffleNumberArray } from "./shuffle"

interface DeckProps {
  numOfSymbols: number
  symbols: string[]
}
export class Deck {
  // The number of symbols on a card has to be a prime number + 1
  numOfSymbols: number
  symbols: string[]
  maxNumOfCards: number
  cards: string[][]

  constructor({ numOfSymbols, symbols }: DeckProps) {
    this.numOfSymbols = numOfSymbols
    this.symbols = shuffleStringArray(symbols)
    this.maxNumOfCards = numOfSymbols ^ 2 + numOfSymbols + 1
    this.cards = shuffleDeck(this.makeDeck())
  }

  makeDeck() {
    let cardsWithNumbers: number[][] = []
    const shuffle = true
    const n = this.numOfSymbols - 1 // prime number
    // add first set of n + 1 cards
    for (let i = 0; i < n + 1; i++) {
      // add new card with first symbol
      cardsWithNumbers.push([1])
      // add n + 1 symbols on the card
      for (let j = 0; j < n; j++) {
        cardsWithNumbers[i].push((j + 1) + (i * n) + 1)
      }
    }

    // add n sets of n cards
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // append a new card with 1 symbol
        cardsWithNumbers.push([i + 2])
        // add n symbols on the card
        for (let k = 0; k < n; k++) {
          const val = (n + 1 + n * k + (i * k + j) % n) + 1
          cardsWithNumbers[cardsWithNumbers.length - 1].push(val)
        }
      }
    }

    if (shuffle) {
      const shuffledCards = cardsWithNumbers.map(card => shuffleNumberArray(card))
      cardsWithNumbers = shuffledCards
    }

    const cardsWithSymbols = cardsWithNumbers.map(card =>
      card.map(num =>
        this.symbols[num - 1]
      )
    )

    return cardsWithSymbols
  }
}