interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  card: CardObj
  match: { userID: string, guess: string }
  myUserID: string
}

export default function MyEmojis({ card, match, myUserID }: CardProps) {
  // const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
  const faceDown: string[] = []
  return (
    <div className="my-emoji-wrapper">
      <div className="my-emojis">
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div className="symbol-wrapper">
              <span className={match.userID == myUserID ? match.guess == emoji ? 'flash-correct' : 'flash-wrong' : ''}>{emoji}</span>
            </div>
          ))
        ) : (
          faceDown.map(emoji => (
            <div className="symbol-wrapper">
              <span>{emoji}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
      // <div className="my-emojis">
      //   <span>👑🟢😊😂🤣❤️😒😁</span>
      // </div>