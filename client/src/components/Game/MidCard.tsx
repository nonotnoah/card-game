import { useRef, useState } from "react"

interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface CardProps {
  canPlay: boolean
  card: CardObj
  match: { userID: string, guess: string }
  onClick: (emoji: string) => void
  countDown: boolean
}

export default function MidCard({ canPlay, card, onClick, match, countDown }: CardProps) {
  // const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
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

  const handleClick = (emoji: string) => {
    if (canPlay) {
      onClick(emoji)
    }
  }
  
  checkPlayable()

  // animations 
  const [midClass, setMidClass] = useState('mid-card rotate')
  const startFadeIn = useRef(false)
  const slideInOut = () => {
    if (match.guess != '') {
      setTimeout(() => {
        setMidClass('mid-card slide-out')
      }, 1000)
      setTimeout(() => {
        setMidClass('mid-card slide-in')
      }, 1750)
      setTimeout(() => {
        setMidClass('mid-card rotate')
      }, 2500)
    }
  }

  const spinIn = () => {
    setMidClass('mid-card fadein')
    setTimeout(() => {
      setMidClass('mid-card rotate')
      startFadeIn.current = false
    }, 0)
  }

  const spinOut = () => {
    console.log('spun middle card')
    setTimeout(() => {
      setMidClass('mid-card spinout')
    }, 1000)
    setTimeout(() => {
      setMidClass('mid-card rotate')
    }, 1500)
  }

  if (countDown && !startFadeIn.current) {
    startFadeIn.current = true
    spinIn()
  }
  if (match.guess != '') {
    spinOut()
  }

  return (
    <div className="mid-card-wrapper">
      <div className={midClass}>
        {card.state == 'faceUp' ? (
          card.symbols?.map(emoji => (
            <div className="symbol-wrapper">
              <span
                className={`
                  ${match.guess == emoji ? 'flash-correct' : ''}
                  ${symbolClass}
                `}
                onClick={() => handleClick(emoji)} key={midKey()}>{emoji}</span>
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