export default interface GameState {
  cardsRemaining: number
  middleCard: {
    state: string
    symbols: string[] | undefined
  }
  connectedPlayers: {
    [userID: string]: {
      isHost: boolean
      username: string
      score: number
      card: {
        state: string
        symbols: string[] | undefined // TOOD: add undef handle in clientgame
      }
    }
  }
}