import { useRef, useState } from "react"

interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  hasGuessed: boolean
  canPlay: boolean
  card: CardObj
  match: { userID: string, guess: string }
  onClick: (emoji: string) => void
  countDown: boolean
}

export default function MidCard({ hasGuessed, canPlay, card, onClick, match, countDown }: CardProps) {
  const [symbolClass, setSymbolClass] = useState('')
  const symbClassSet = useRef(false)
  const faceDown: string[] = []

  let key = 0
  const midKey = () => {
    key++
    return key.toString()
  }

  // check every render if player can play
  const checkPlayable = () => {
    if (!canPlay && !symbClassSet.current) {
      setSymbolClass('opacity-50')
      symbClassSet.current = true
    } else if (canPlay && symbClassSet.current) {
      symbClassSet.current = false
    }
  }

  // checkPlayable() // see if filter works

  const handleClick = (emoji: string) => {
    console.log(canPlay, hasGuessed)
    if (canPlay && !hasGuessed) {
      onClick(emoji)
    }
  }

  // animations 
  const [midClass, setMidClass] = useState('mid-card rotate')
  const startFadeIn = useRef(false)

  const fadeIn = () => {
    setMidClass('mid-card fadein')
    setTimeout(() => {
      setMidClass('mid-card rotate')
      // startFadeIn.current = false
    }, 3000)
  }

  const spinOut = () => {
    console.log('spun middle card')
    setTimeout(() => {
      setMidClass('mid-card spinout')
    }, 1000) // wait 1s for flash
    // card changes at 1250ms
    setTimeout(() => {
      setMidClass('mid-card rotate')
    }, 1500) // card stops spinning
  }

  if (countDown && !startFadeIn.current) {
    startFadeIn.current = true
    fadeIn()
  }
  if (match.guess != '') {
    spinOut()
  }

  return (
    <div className="mid-card-wrapper">
      <div className={midClass}>
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div key={midKey()} className="symbol-wrapper">
              <span
                className={`
                  ${match.guess == emoji ? 'flash-correct' : ''}
                  ${symbolClass}
                `}
                onClick={() => handleClick(emoji)} >{emoji}</span>
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