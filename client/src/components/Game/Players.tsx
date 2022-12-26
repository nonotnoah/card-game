import { useRef } from 'react'
interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface PlayerProps {
  connectedPlayers: {
    [username: string]: {
      isHost: boolean
      username: string
      score: number
      card: CardObj
    }
  }
}
export default function Players({ connectedPlayers }: PlayerProps) {
  const players = Object.keys(connectedPlayers)
  const numPlayers = players.length
  let ct = 0

  const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']


  // }
  return (
    // <div className={`player-wrapper-${numPlayers}`}>
    <div className='player-wrapper-lg'>
      <div className="player-wrapper-left">
        {players?.flatMap(userID => (
          players.indexOf(userID)%2 != 0 ? [] : [ // if player is even
            <div className="player-wrapper">
              <div className="username">{`${connectedPlayers[userID].username} ${connectedPlayers[userID].isHost ? '(host)' : ''}`}</div>
              <div className="player-emojis">
                {connectedPlayers[userID].card.state == 'faceUp' ? (
                  connectedPlayers[userID].card.symbols?.map(emoji => (
                    <span>{emoji}</span>
                  ))
                ) : (
                  faceDown.map(emoji => (
                    <span>{emoji}</span>
                  ))
                )}
              </div>
            </div>
          ]
        ))}
      </div>
      <div className="player-wrapper-right">
        {players?.flatMap(userID => (
          players.indexOf(userID)%2 == 0 ? [] : [ // if player is odd
            <div className="player-wrapper">
              <div className="username">{`${connectedPlayers[userID].username} ${connectedPlayers[userID].isHost ? '(host)' : ''}`}</div>
              <div className="player-emojis">
                {connectedPlayers[userID].card.state == 'faceUp' ? (
                  connectedPlayers[userID].card.symbols?.map(emoji => (
                    <span>{emoji}</span>
                  ))
                ) : (
                  faceDown.map(emoji => (
                    <span>{emoji}</span>
                  ))
                )}
              </div>
            </div>
          ]
        ))}
      </div>
    </div>
  )
}
    // <div className='player-wrapper-lg'>
    //   <div className="player-wrapper-left">
    //     <div className="player-wrapper">
    //       <div className="username">Dasher (host)</div>
    //       <div className="player-emojis">
    //         <span id='test'>👑</span>
    //         <span>🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //     <div className="player-wrapper">
    //       <div className="username">Dancer</div>
    //       <div className="player-emojis">
    //         <span>👑🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //     <div className="player-wrapper">
    //       <div className="username">Prancer</div>
    //       <div className="player-emojis">
    //         <span>👑🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="player-wrapper-right">
    //     <div className="player-wrapper">
    //       <div className="username">Vixen</div>
    //       <div className="player-emojis">
    //         <span>👑🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //     <div className="player-wrapper" >
    //       <div className="username">Comet (you)</div>
    //       <div className="player-emojis">
    //         <span>👑🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //     <div className="player-wrapper">
    //       <div className="username">Cupid</div>
    //       <div className="player-emojis">
    //         <span>👑🟢😊😂🤣❤️😒😁</span>
    //       </div>
    //     </div>
    //   </div>
    // </div>