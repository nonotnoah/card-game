interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  card: CardObj
  match: { userID: string, guess: string }
  onClick: (emoji: string) => void
}

export default function MidCard({ card, onClick, match }: CardProps) {
  // const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
  const faceDown: string[] = []

  let key = 0
  const midKey = () => {
    key++
    return key.toString()
  }

  const handleClick = (emoji: string) => {
    onClick(emoji)
  }
  return (
    <div className="mid-card-wrapper">
      <div className="mid-card">
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div className="symbol-wrapper">
              <span className={match.guess == emoji ? 'flash-correct' : ''} onClick={() => handleClick(emoji)} key={midKey()}>{emoji}</span>
            </div>
          ))
        ) : (
          faceDown.map(emoji => (
            <div className="symbol-wrapper">
              <span key={midKey()}>{emoji}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )

  // return (
  //   <div className="mid-card-wrapper">
  //     <div className="mid-card">
  //       <div className="symbol-wrapper">
  //         <span>😎</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>🤦‍</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>💕</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>🤷‍♂️</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>🙌</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span id='test'>👑</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>🤞</span>
  //       </div>
  //       <div className="symbol-wrapper">
  //         <span>😢</span>
  //       </div>
  //     </div>
  //   </div>
  // )
}