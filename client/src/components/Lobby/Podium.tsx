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
              <div className="place">1st 🥇</div>
              <div className="podium-username">
                {`${getEmoji(podium[1].username)} ${podium[1].username}`}
              </div>
              <div className="podium-score">
                Score: {podium[1].score}
              </div>
              <div className="podium-time">
                Avg guess: {podium[1].reactionTime == 100 ? 'N/A' : podium[1].reactionTime} seconds
              </div>
            </div>
          )}
          <div className="half-wrapper">
            {podium[2].username && (
              <div className="second-place">
              <div className="place">2nd 🥈</div>
                <div className="podium-username">
                  {`${getEmoji(podium[2].username)} ${podium[2].username}`}
                </div>
                <div className="podium-score">
                  Score: {podium[2].score}
                </div>
                <div className="podium-time">
                  {podium[2].reactionTime == 100 ? 'N/A' : podium[2].reactionTime} seconds
                </div>
              </div>
            )}
            {podium[3].username && (
              <div className="third-place">
              <div className="place">3rd 🥉</div>
                <div className="podium-username">
                  {`${getEmoji(podium[3].username)} ${podium[3].username}`}
                </div>
                <div className="podium-score">
                  Score: {podium[3].score}
                </div>
                <div className="podium-time">
                  {podium[3].reactionTime == 100 ? 'N/A' : podium[3].reactionTime} seconds
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