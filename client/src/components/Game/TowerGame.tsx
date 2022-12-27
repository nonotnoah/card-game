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
import Countdown from 'react-countdown'

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
  const [ready, setReady] = useState(false)
  const [countingDown, setCountingDown] = useState(false)
  const [count, setCount] = useState(0)
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    cardsRemaining: 100,
    middleCard: {
      state: 'faceDown',
      symbols: []
    },
    connectedPlayers: {
      [socket.userID]: {
        isHost: socket.isHost,
        username: socket.username,
        ready: false,
        score: 1,
        card: {
          state: 'faceDown',
          symbols: []
        }
      },
      // {
      // // 'asdf': {
      // //   isHost: false,
      // //   username: 'Dancer',
      // //   score: 0,
      // //   card: {
      // //     state: 'faceUp',
      // //     symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
      // //   }
      // // },
      // // 'adf': {
      // //   isHost: false,
      // //   username: 'Prancer',
      // //   score: 0,
      // //   card: {
      // //     state: 'faceUp',
      // //     symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
      // //   }
      // // },
      // // 'asf': {
      // //   isHost: false,
      // //   username: 'Vixen',
      // //   score: 0,
      // //   card: {
      // //     state: 'faceUp',
      // //     symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
      // //   }
      // // },
      // // 'asd': {
      // //   isHost: false,
      // //   username: 'Comet',
      // //   score: 0,
      // //   card: {
      // //     state: 'faceUp',
      // //     symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
      // //   }
      // // },
      // // 'sdf': {
      // //   isHost: false,
      // //   username: 'Cupid',
      // //   score: 0,
      // //   card: {
      // //     state: 'faceUp',
      // //     symbols: ['😎', '😎', '😎', '😎', '😎', '😎', '😎', '😎']
      // //   }
      // // }
      // }
    }
  }) // maybe this is a useref so you don't have to update the whole dom - test the performance of this

  useEffect(() => {
    socket.on('update', (updatedGameState: GameState) => {
      setGameState(updatedGameState)
      console.log('updated gameState', updatedGameState)
    })

    socket.on('reveal', (updatedGameState: GameState, seconds: number) => {
      setCountingDown(true)
      setCount(seconds)
      setTimeout(() => {
        setGameState(updatedGameState
          //   {
          // //   ...gameState,
          // //   middleCard: {
          // //     ...gameState.middleCard,
          // //     state: 'faceUp'
          // //   },
          // //   connectedPlayers: {
          // //     [socket.userID]: {
          // //       ...gameState.connectedPlayers[socket.userID],
          // //       card: {
          // //         ...gameState.connectedPlayers[socket.userID].card,
          // //         state: 'faceUp'
          // //       }
          // //     }
          // //   }
          // // })
          //   }
        )
      }, seconds * 1000)
    })

    // draw card
    socket.on("draw", (card: CardObj) => {
      // setGameState(gameState.)
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

  useEffect(() => {
    count > 0 && setTimeout(() => setCount(count - 1), 1000)
    if (count == 0) {
      setCountingDown(false)
    }
  }, [count])
  // let ct = 0
  // const countDown = (seconds: number) => {
  //   ct = seconds
  //   setTimeout(() => {
  //     setCount(ct)
  //     ct --
  //   }, seconds * 1000)
  // }

  const handleReady = () => {
    setReady(true)
    socket.emit('ready', socket.userID)
  }

  // testing
  const handleClick = () => {
    console.log(gameState)
  }
  return (
    <div className="game-wrapper">
      {/* <button onClick={() => handleClick()}>gamestate</button> */}
      {!gameState.isRunning && (
        ready ? (
          <div className='ready' > Waiting for players...</div>
        ) : (
          <button className="ready" onClick={() => handleReady()}>Ready?</button>
        )
      )}
      {countingDown && (
        <div className='countdown ready'>{count}</div>
      )}
      <MidCard card={gameState.middleCard}></MidCard>
      <MyEmojis card={gameState.connectedPlayers[socket.userID].card}></MyEmojis>
      <Players connectedPlayers={gameState.connectedPlayers} myUserID={socket.userID}></Players>
    </div >
  )
}