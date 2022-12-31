import * as React from 'react';
import { useState, useEffect } from 'react';
import '../../styles/Podium.scss'
import { getEmoji } from '../../utils/animalEmojis';

interface Podium {
  1: {
    username: string
    score: number
    reactionTime: number
  }
  2: {
    username: string
    score: number
    reactionTime: number
  }
  3: {
    username: string
    score: number
    reactionTime: number
  }
}

interface PodiumProps {
  podium: Podium
  onClose: () => void
}

export default function Podium({ onClose, podium }: PodiumProps) {

  return (
    <div className="wrapper">
      <div className="podium-wrapper">
        <div className="win-text">
          {`${getEmoji(podium[1].username)} ${podium[1].username}`} wins!
        </div>
        <div className="places-wrapper">
          {podium[1].username && (
            <div className="first-place">
              <div className="podium-username">
                {`${getEmoji(podium[1].username)} ${podium[1].username}`}
              </div>
              <div className="place">1st 🥇</div>
              <ul className='place-list'>
                <li className="score list">
                  <div className="podium-score list-left">Score:</div>
                  <div className="list-right">{podium[1].score} matches</div>
                </li>
                <li className="time list">
                  <div className="podium-time list-left"> Avg guess: </div>
                  <div className="list-right">{podium[1].reactionTime == 100 ? 'N/A' : podium[1].reactionTime} seconds</div>
                </li>
              </ul>
            </div>
          )}
          <div className="half-wrapper">
            {podium[2].username && (
              <div className="second-place">
                <div className="podium-username">
                  {`${getEmoji(podium[2].username)} ${podium[2].username}`}
                  <div className="place">2nd 🥈</div>
                  <ul className='place-list'>
                    <li className="score list">
                      <div className="podium-score list-left">Score:</div>
                      <div className="list-right">{podium[2].score} matches</div>
                    </li>
                    <li className="time list">
                      <div className="podium-time list-left"> Avg guess: </div>
                      <div className="list-right">{podium[2].reactionTime == 100 ? 'N/A' : podium[2].reactionTime} seconds</div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {podium[3].username && (
              <div className="third-place">
                <div className="podium-username">
                  {`${getEmoji(podium[3].username)} ${podium[3].username}`}
                  <div className="place">3rd 🥉</div>
                  <ul className='place-list'>
                    <li className="score list">
                      <div className="podium-score list-left">Score:</div>
                      <div className="list-right">{podium[3].score} matches</div>
                    </li>
                    <li className="time list">
                      <div className="podium-time list-left"> Avg guess: </div>
                      <div className="list-right">{podium[3].reactionTime == 100 ? 'N/A' : podium[3].reactionTime} seconds</div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="close" onClick={() => onClose()}>Home</button>
      </div>
    </div>
  )
}