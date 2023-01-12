// powerups: 
// lightning - speeds up rotation for opponents
// ice cube  - freezes rotation for you
// assist    - removes half of non-matching symbols
import '../../styles/TowerGame.scss'
import MidCard from './MidCard'
import MyEmojis from './MyEmojis'
import Players from './Players'
import { Suspense, lazy, useEffect, useState, ReactNode, useRef } from 'react'
import { Socket } from 'socket.io-client'
import GameState from '../../../../server/src/interfaces/GameState' // LOL

const SymbolThemeL = lazy(() => import('./Styles/SymbolsL'))
const SymbolThemeM = lazy(() => import('./Styles/SymbolsM'))
const SymbolThemeS = lazy(() => import('./Styles/SymbolsS'))

interface MySocket extends Socket {
  [key: string]: any;
}
interface TowerGameProps {
  socket: MySocket;
  initEvent?: string
  numSymbols: number
}
interface CardObj {
  state: string,
  symbols: string[] | undefined
}

export default function TowerGame({ numSymbols, socket, initEvent }: TowerGameProps) {
  const [ready, setReady] = useState(false)
  const [countingDown, setCountingDown] = useState(false)
  const [count, setCount] = useState(0)
  const [match, setMatch] = useState({ userID: '', guess: '' })
  const hasGuessed = useRef(false)
  const [gameState, setGameState] = useState<GameState>({
    winner: '',
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
        score: 0,
        canPlay: true,
        guessTimes: [],
        pingBuffer: [],
        avgPing: 0,
        card: {
          state: 'faceDown',
          symbols: []
        }
      },
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

  /**  @description trigger function with args after delay in ms
   * 
   * */
  const asyncWait = (func: Function, args: any, time: number) => {
    setTimeout(() => {
      func(args)
    }, time)
  }

  useEffect(() => {
    // send client ping on any event received
    socket.onAny(() => {
      socket.emit('ping', Date.now())
    })
    socket.on('update', (reason, updatedGameState: GameState) => {
      if (reason == 'next turn') {
        hasGuessed.current = false
        asyncWait(setGameState, updatedGameState, 1250)
        asyncWait(setMatch, { userID: '', guess: '' }, 500)
        console.log(hasGuessed)
      } else if (reason == 'no one guessed right') {
        hasGuessed.current = false
      } else {
        setGameState(updatedGameState)
      }
      console.log('updated gameState', updatedGameState, 'because', reason)
    })

    socket.on('reveal', (updatedGameState: GameState, seconds: number) => {
      setCountingDown(true)
      setCount(seconds)
      setTimeout(() => {
        hasGuessed.current = false
        setGameState(updatedGameState)
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
      // manually clear all listeners. triggers when component unmounts
      socket.removeListener('goodMatch')
      socket.removeListener('draw')
      socket.removeListener('playerLeave')
      socket.removeListener('reveal')
      socket.removeListener('update')
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
    // console.log('asked for update')


  }, [])

  const handleReady = () => {
    setReady(true)
    socket.emit('ready', socket.userID)
  }

  const handleGuess = (emoji: string) => {
    hasGuessed.current = true
    socket.emit('guess', emoji, Date.now()) // TODO: send timestamp
    // console.log('clicked', emoji)
    
  }

  // testing
  const handleClick = () => {
    console.log(gameState)
  }

  interface ThemeProps {
    children?: ReactNode
  }

  const ThemeSelector = ({ children }: ThemeProps) => {
    console.log(numSymbols)
    return (
      <>
        <Suspense fallback={<></>}>
          {(numSymbols === 6) && <SymbolThemeS />}
          {(numSymbols === 8) && <SymbolThemeM />}
          {(numSymbols === 9) && <SymbolThemeL />}
        </Suspense>
        {children}
      </>
    )
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
        <div className='countdown center'>{count}</div>
      )}
      {(!currentPlayer.canPlay && !countingDown) && (
        <div className='filter'>Wrong guess!</div>
      )}
      {(currentPlayer.canPlay && gameState.isRunning && !countingDown) && (
        <div className="center remaining">{gameState.cardsRemaining}</div>
      )}
      <ThemeSelector />
      <MidCard
        hasGuessed={hasGuessed.current}
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