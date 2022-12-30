export default interface GameState {
  winner: string
  isRunning: boolean
  cardsRemaining: number
  middleCard: {
    state: string
    symbols: string[] | undefined
  }
  connectedPlayers: {
    [userID: string]: {
      connected: boolean
      isHost: boolean
      username: string
      ready: boolean
      score: number
      canPlay: boolean
      guessTimes: number[]
      card: {
        state: string
        symbols: string[] | undefined // TOOD: add undef handle in clientgame
      }
    }
  }
}