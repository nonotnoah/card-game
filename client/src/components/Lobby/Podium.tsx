import * as React from 'react';
import { useState, useEffect } from 'react';

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
      <button className="close" onClick={() => onClose()}>X</button>
      <div className="podium-wrapper">
        {podium[1].username && (
          <div className="first-place">
            <div className="podium-username">
              {podium[1].username}
            </div>
            <div className="podium-score">
              {podium[1].score}
            </div>
            <div className="podium-time">
              {podium[1].reactionTime}
            </div>
          </div>
        )}
        {podium[2].username && (
          <div className="second-place">
            <div className="podium-username">
              {podium[2].username}
            </div>
            <div className="podium-score">
              {podium[2].score}
            </div>
            <div className="podium-time">
              {podium[2].reactionTime}
            </div>
          </div>
        )}
        {podium[3].username && (
          <div className="third-place">
            <div className="podium-username">
              {podium[3].username}
            </div>
            <div className="podium-score">
              {podium[3].score}
            </div>
            <div className="podium-time">
              {podium[3].reactionTime}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}