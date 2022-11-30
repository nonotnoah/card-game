import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { io } from 'socket.io-client'

function App() {
  const connect = () => {
      console.log('Client connecting...')
      const socket = io('http://localhost:5000')
  }
  

  useEffect(() => {
    connect()
  }, [])

  return (
    <h1>Test</h1>
  );

}
export default App
