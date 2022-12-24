import emojis from "./emojis"
// why doesn't this work
// type SpecialArray = (number | number[] | string)[]
type SpecialArray = any[]
interface Card {
  card: string[]
}

class Deck {
  private rangeArray: SpecialArray = []
  private nValue: number // number of symbols on a card is nValue+1
  private cards: string[][]
  cardsCopy: string[][]

  constructor(n: number, imgs: string[] = emojis) {
    this.rangeArray = this.range(n)
    this.nValue = n
    this.cards = this.makeDeck(n, imgs)
    // make a deep copy of the deck
    this.cardsCopy = [...this.cards]
    // this.test()
  }

  public length() {
    return this.cardsCopy.length
  }

  private range(n: number = this.nValue) {
    const arr: SpecialArray = []
    for (let i = 0; i < n; i++) {
      arr.push(i)
    }
    return arr
  }

  private test(n: number = this.nValue) {
    console.log(this.cardsCopy)
    console.log('ordinarypoints:', this.ordinaryPoints(n))
    console.log('pointsatinfinity:', this.pointsAtInfinity(n))
    console.log('allpoints:', this.allPoints(n))
    console.log('alllines:', this.allLines(n))
  }

  private ordinaryPoints(n: number = this.nValue) {
    const arr: SpecialArray = []
    this.rangeArray.map(x => this.rangeArray.map(y => arr.push([x, y])))
    return arr
  }

  private pointsAtInfinity(n: number = this.nValue) {
    const pts = [...this.rangeArray]
    pts.push('inf')
    return pts
  }

  private allPoints(n: number = this.nValue) {
    const ordPts = this.ordinaryPoints(n)
    const ptsAtInf = this.pointsAtInfinity(n)
    for (const element of ptsAtInf) {
      ordPts.push(element)
    }
    return ordPts
  }

  private ordinaryLine(m: number, b: number, n: number = this.nValue) {
    const line: number[][] = []
    this.rangeArray.map(x => line.push([x, (m * x + b) % n]))
    line.push([m])
    return line
  }

  private verticalLine(x: number, n: number = this.nValue) {
    const line: (number[] | string)[] = []
    this.rangeArray.map(y => line.push([x, y]))
    line.push('inf')
    return line
  }

  private lineAtInfinity(n: number = this.nValue) {
    return this.pointsAtInfinity(n)
  }

  private allLines(n: number = this.nValue) {
    const lines: any[][] = []
    this.rangeArray.map(m => this.rangeArray.map(b => lines.push(this.ordinaryLine(m, b, n))))
    this.rangeArray.map(x => lines.push(this.verticalLine(x, n)))
    lines.push(this.lineAtInfinity(n))
    return lines
  }

  private makeDeck(n: number = this.nValue, imgs: string[]) {
    const points = this.allPoints(n)

    const mapping: any = {}

    // iterate through points[] and imgs[]
    points.forEach((point, index) => {
      const img = imgs[index]
      mapping[point] = img
    })

    // loops through lines which contain points. 
    // loops those points onto the map's identical points
    // pushes value of point key (the picture) onto card array
    const lines: string[][] = []
    const allLines = this.allLines(n)
    for (const line of allLines) {
      const card: any[] = []
      line.map(point => {
        if (typeof point != "string") { // [0, 0] -> to string
          card.push(mapping[point.toString()])
        } else {
          card.push(mapping[point]) // 'inf' is already string
        }
      })
      lines.push(card)
    }
    return lines
  }

  /** @returns cardObj.symbols as undefined if there are no cards left to draw
   */
  public drawCard(state: string) {
    const card = this.cardsCopy.shift()
    const cardObj = { state: state, symbols: card }
    return cardObj
  }

  /** @returns guess if match, false if not
   */
  public checkGuess(guess: string, card: { state: string, symbols: string[] | undefined }) {
    if (card.symbols) {
      for (let emoji of card.symbols) {
        if (guess == emoji) {
          return guess
        }
      }
    }
    return false
  }

  public compareCards(card1: Card['card'], card2: Card['card']) {
    for (let symbol1 of card1) {
      for (let symbol2 of card2) {
        if (symbol1 == symbol2) {
          return symbol1
        }
      }
    }
    return 'No match'
  }
}

export { Deck as Deck }