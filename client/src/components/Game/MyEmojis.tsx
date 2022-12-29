import { useState } from "react"

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

  const [myEmojiClass, setMyEmojiClass] = useState('my-emojis')
  const slideInOut = () => {
    setTimeout(() => {
      setMyEmojiClass('slide-down my-emojis')
    }, 1000)
    setTimeout(() => {
      setMyEmojiClass('slide-up my-emojis')
    }, 1250)
  }
  if (match.guess != '' && match.userID == myUserID) {
    slideInOut()
  }

  return (
    <div className="my-emoji-wrapper">
      <div className={myEmojiClass}>
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div className="symbol-wrapper">
              <span className={match.userID == myUserID ? match.guess == emoji ? 'flash-correct' : '' : ''}>{emoji}</span>
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