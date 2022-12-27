interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  card: CardObj
}

export default function MyEmojis({ card }: CardProps) {
  // const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
  const faceDown: string[] = []
  return (
    <div className="my-emoji-wrapper">
      <div className="my-emojis">
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div className="symbol-wrapper">
              <span>{emoji}</span>
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