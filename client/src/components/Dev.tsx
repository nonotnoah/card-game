import * as React from 'react';
import { useEffect, useState } from 'react';
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import '../styles/App.css'
import CardProps from './Cards'
import { shuffleArray } from '../utils/shuffle';
import HostLobbyRoom from './Lobby/HostLobbyRoom';

function Dev() {
  return (
    <HostLobbyRoom />

  )
}

export default Dev