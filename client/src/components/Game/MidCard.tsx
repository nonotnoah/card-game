interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  card: CardObj
}

export default function MidCard({ card }: CardProps) {
  let key = 0
  const midKey = () => {
    key ++
    console.log(key)
    return key.toString()
  }
  const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
  return (
    <div className="mid-card-wrapper">
      <div className="mid-card">
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div key={midKey()} className="symbol-wrapper">
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