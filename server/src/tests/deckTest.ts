import emojis from "../utils/emojis"
import { shuffleNumberArray, shuffleStringArray } from "../utils/shuffle"

function makeDeck(numOfSymbols: number) {
  const shuffledEmojis = shuffleStringArray(emojis)
  let cardsWithNumbers: number[][] = []
  const shuffle = true
  const n = numOfSymbols - 1 // prime number
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

  const cardsWithSymbols = cardsWithNumbers.map((card, index) =>
    card.map(num =>
      shuffledEmojis[num - 1]
    )
  )

  return cardsWithSymbols
}


function checkValidity(deck: string[][]) {
  let match: boolean = false
  for (let i = 0; i < deck.length; i++) {
    for (let j = 0; j < deck.length; j++) {
      match = deck[i].some(symbol => deck[j].includes(symbol))
    }
    match ? console.log(`card ${i} ✅`) : console.log(`card ${i} ❌`)
  }
}
const deck = makeDeck(8)
checkValidity(deck)
// console.log(deck)