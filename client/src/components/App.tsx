import { useEffect, useState, useRef } from 'react'
import './styles/App.css'
import { io } from 'socket.io-client'

function App() {
  const connect = () => {
      console.log('Client connecting...')
      const socket = io('http://localhost:5000')
  }
  
  // value can be accessed with playerCount.current
  // does not trigger a re-render
  const playerCount = useRef(0)

  useEffect(() => {
    connect()
  }, [])

  return (
    <h1>Test</h1>
  );

}
export default App
