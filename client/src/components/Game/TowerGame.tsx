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
  initEvent?: string
}
interface CardObj {
  state: string,
  symbols: string[] | undefined
}

export default function TowerGame({ socket, initEvent }: SocketProps) {
  const [ready, setReady] = useState(false)
  const [countingDown, setCountingDown] = useState(false)
  const [count, setCount] = useState(0)
  const [match, setMatch] = useState({ userID: '', guess: '' })
  const [hasGuessed, setHasGuessed] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    cardsRemaining: 100,
    middleCard: {
      state: 'faceDown',
      symbols: []
    },
    connectedPlayers: {
      [socket.userID]: {
        connected: true,
        isHost: socket.isHost,
        username: socket.username,
        ready: false,
        score: 1,
        canPlay: true,
        guessTimes: [],
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

  const currentPlayer = gameState.connectedPlayers[socket.userID]

  switch (initEvent) {
    case 'reconnect': {
      socket.emit('reconnect') // gameModes.ts
      break
    }
    case 'update': {
      socket.emit('needUpdate')
      break
    }
  }

  const asyncWait = (func: Function, args: any, time: number) => {
    setTimeout(() => {
      func(args)
    }, time)
  }

  useEffect(() => {
    socket.on('update', (reason, updatedGameState: GameState) => {
      if (reason == 'next turn') {
        asyncWait(setGameState, updatedGameState, 1250)
        asyncWait(setMatch, { userID: '', guess: '' }, 500)
        setHasGuessed(true)
      } else {
        setGameState(updatedGameState)
      }
      console.log('updated gameState', updatedGameState, 'because', reason)
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

    socket.on('playerLeave', (updatedGameState: GameState) => {
      setGameState(updatedGameState)
      // TODO: trigger vote
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

    socket.on('goodMatch', (correctPayload: { userID: string, guess: string }) => {
      setMatch(correctPayload)
    })

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

  // ask for gameState on first render
  useEffect(() => {
    socket.emit('needUpdate')
    console.log('asked for update')
  }, [])

  const handleReady = () => {
    setReady(true)
    socket.emit('ready', socket.userID)
  }

  const handleGuess = (emoji: string) => {
    setHasGuessed(true)
    console.log('clicked', emoji)
    socket.emit('guess', emoji)
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
          <div className='center' > Waiting for players...</div>
        ) : (
          <button className="center" onClick={() => handleReady()}>Ready?</button>
        )
      )}
      {countingDown && (
        <div className='countdown ready'>{count}</div>
      )}
      {!currentPlayer.canPlay && (
        <div className='filter'>Wrong guess!</div>
      )}
      {(currentPlayer.canPlay && gameState.isRunning) && (
        <div className="center remaining">{gameState.cardsRemaining}</div>
      )}
      <MidCard
        hasGuessed={hasGuessed}
        canPlay={currentPlayer.canPlay}
        countDown={countingDown}
        match={match}
        onClick={(emoji) => handleGuess(emoji)}
        card={gameState.middleCard}
      />
      <MyEmojis
        match={match}
        card={currentPlayer.card}
        myUserID={socket.userID}
      />
      <Players
        match={match}
        connectedPlayers={gameState.connectedPlayers}
        myUserID={socket.userID}
      />
    </div >
  )
}