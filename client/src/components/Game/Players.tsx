import { useEffect, useRef } from 'react'
import { getEmoji } from '../../utils/animalEmojis'
interface CardObj {
  state: string,
  symbols: string[] | undefined
}
interface PlayerProps {
  connectedPlayers: {
    [userID: string]: {
      connected: boolean
      isHost: boolean
      username: string
      ready: boolean
      score: number
      card: CardObj
    }
  },
  match: { userID: string, guess: string }
  myUserID: string
}
export default function Players({ connectedPlayers, match, myUserID }: PlayerProps) {
  const players = Object.keys(connectedPlayers)
  const numPlayers = players.length
  let ct = 0

  // const faceDown = ['🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫', '🚫']
  const faceDown: string[] = ['❓']

  // }
  return (
    // <div className={`player-wrapper-${numPlayers}`}>
    <div className='player-wrapper-lg'>
      <div className="player-wrapper-left">
        {players?.flatMap(userID => (
          players.indexOf(userID) % 2 != 0 ? [] : [ // if player is even
            <div className="player-wrapper">
              <div className={`
              ${connectedPlayers[userID].connected == false ? 'disconnected' : ''} username`}>
                {`
                ${getEmoji(connectedPlayers[userID].username)} 
                ${connectedPlayers[userID].username} 
                ${connectedPlayers[userID].isHost ? '' : ''}
                ${userID == myUserID ? '(you)' : ''}
                ${connectedPlayers[userID].ready ? '✅' : ''}
                ${connectedPlayers[userID].score}
              `}
              </div>
              <div className="player-emojis">
                {connectedPlayers[userID].card.state == 'faceUp' ? (
                  connectedPlayers[userID].card.symbols?.map(emoji => (
                    <span className={`
                    ${userID == match.userID ? emoji == match.guess ? 'flash-correct' : '' : ''}
                    `}>
                      {emoji}
                    </span>
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
          players.indexOf(userID) % 2 == 0 ? [] : [ // if player is odd
            <div className="player-wrapper">
              <div className={`
              ${connectedPlayers[userID].connected == false ? 'disconnected' : ''} username`}>
                {`
                ${getEmoji(connectedPlayers[userID].username)} 
                ${connectedPlayers[userID].username} 
                ${connectedPlayers[userID].isHost ? '' : ''}
                ${userID == myUserID ? '(you)' : ''}
                ${connectedPlayers[userID].ready ? '✅' : ''}
                ${connectedPlayers[userID].score}
              `}
              </div>
              <div className="player-emojis">
                {connectedPlayers[userID].card.state == 'faceUp' ? (
                  connectedPlayers[userID].card.symbols?.map(emoji => (
                    <span className={`
                    ${userID == match.userID ? emoji == match.guess ? 'flash-correct' : '' : ''}
                    `}>
                      {emoji}
                    </span>
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