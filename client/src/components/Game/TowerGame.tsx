// powerups: 
// lightning - speeds up rotation for opponents
// ice cube  - freezes rotation for you
// assist    - removes half of non-matching symbols
import '../../styles/TowerGame.scss'
import MidCard from './MidCard'
import MyEmojis from './MyEmojis'
import Players from './Players'
import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import GameState from '../../../../server/src/interfaces/GameState' // LOL

interface MySocket extends Socket {
  [key: string]: any;
}
interface SocketProps {
  socket: MySocket;
}
interface CardObj {
  state: string,
  symbols: string[] | undefined
}

export default function TowerGame({ socket }: SocketProps) {
  const [gameState, setGameState] = useState<GameState>({
    cardsRemaining: 50,
    middleCard: {
      state: 'faceUp',
      symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
    },
    connectedPlayers: {
      [socket.userID]: {
        isHost: socket.isHost,
        username: socket.username,
        score: 1,
        card: {
          state: 'faceUp',
          // symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
          symbols: []
        }
      },
      'asdf': {
        isHost: false,
        username: 'Dancer',
        score: 0,
        card: {
          state: 'faceUp',
          symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
        }
      },
      'adf': {
        isHost: false,
        username: 'Prancer',
        score: 0,
        card: {
          state: 'faceUp',
          symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
        }
      },
      'asf': {
        isHost: false,
        username: 'Vixen',
        score: 0,
        card: {
          state: 'faceUp',
          symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
        }
      },
      'asd': {
        isHost: false,
        username: 'Comet',
        score: 0,
        card: {
          state: 'faceUp',
          symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
        }
      },
      'sdf': {
        isHost: false,
        username: 'Cupid',
        score: 0,
        card: {
          state: 'faceUp',
          symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
        }
      }
    }
  }) // maybe this is a useref so you don't have to update the whole dom - test the performance of this

  useEffect(() => {
    socket.emit('ready')
  }, [])

  useEffect(() => {
    socket.on('update', (updatedGameState: GameState) => {
      setGameState(updatedGameState)
    })

    // draw card
    socket.on("draw", (card: CardObj) => {
      // setCards(val);
      console.log("drawing new card", card);
    });

    socket.on("reconnect", (updatedGameState: GameState) => {
      setGameState(updatedGameState)
      // do other stuff
    });

    // cb
    return (): void => {
      socket.removeAllListeners();
    };
  }, [socket]);

  // testing
  const handleClick = () => {
    setGameState({
      ...gameState,
      connectedPlayers: {
        'userID': {
          ...gameState.connectedPlayers['asdf'],
          card: {
            ...gameState.connectedPlayers['asdf'].card,
            symbols: ['👑', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
          }
        }
      }
    })
  }
  return (
    <div className="game-wrapper">
      {/* <button onClick={() => handleClick()}>click</button> */}
      <MidCard card={gameState.middleCard}></MidCard>
      <MyEmojis card={gameState.connectedPlayers[socket.userID].card}></MyEmojis>
      <Players connectedPlayers={gameState.connectedPlayers}></Players>
    </div>
  )
}