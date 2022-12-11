import { useEffect, useState, useRef } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'

function App() {
  // connect client
  // const connect = () => {
  //   const socket = io('http://localhost:5000')
  // }

  // useEffect(() => {
  //   connect()
  // }, [])
  const socket = io('http://localhost:5000')

  socket.on('draw', (val) => {
    const card1 = val.card1
    const card2 = val.card2
    const match = val.match
    console.log(val)
  })

  // value can be accessed with playerCount.current
  // does not trigger a re-render
  const playerCount = useRef(0)

  return (
    <h1>Test</h1>
  );

}
export default App
