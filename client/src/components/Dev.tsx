import * as React from 'react';
import { useEffect, useState } from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import '../styles/App.css'
import CardProps from './Cards'
import { shuffleArray } from '../utils/shuffle';
import HostLobbyRoom from './Lobby/HostLobbyRoom';
import { io } from 'socket.io-client';

function Dev() {
  const socket = io('http://localhost:5000', {autoConnect: false})
  const auth = React.useRef({ username: 'test', gameID: '12345', isHost: true })
  socket.auth = auth.current

  useEffect(() => {
    // connect error
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    // save session
    socket.on("session", ({ sessionID, userID }) => {
      // socket.auth = { sessionID };
      // store in sessionStorage. this should implement localStorage in live build
      // sessionStorage.setItem("sessionID", sessionID);
      console.log("set sessionID:", sessionID);
    });

    // open host options if socket becomes host
    socket.on('newHost', (userID: string) => {
      console.log(userID)
    })

    return (): void => {
      socket.removeAllListeners();
    };
  }, [socket]);

  const handleCancel = () => {
    socket.emit('cancel')
    socket.disconnect()
    console.log('cancelled')
  }
  const asHost = () => {
    auth.current.isHost = true
    socket.connect()
  }
  const asGuest = () => {
    auth.current.isHost = false
    socket.connect()
  }

  return (
    <>
      <button onClick={() => handleCancel()}>Cancel</button>
      <button onClick={() => asHost()}>Host</button>
      <button onClick={() => asGuest()}>Guest</button>
    </>

  )
}

export default Dev