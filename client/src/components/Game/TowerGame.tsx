// powerups: 
// lightning - speeds up rotation for opponents
// ice cube  - freezes rotation for you
// assist    - removes half of non-matching symbols
import '../../styles/TowerGame.scss'

export default function TowerGame() {
  return (
    <div className="game-wrapper">
      <div className="mid-card-wrapper">
        <div className="mid-card">
          <div className="symbol-wrapper">
            <span>😎</span>
          </div>
          <div className="symbol-wrapper">
            <span>🤦‍</span>
          </div>
          <div className="symbol-wrapper">
            <span>💕</span>
          </div>
          <div className="symbol-wrapper">
            <span>🤷‍♂️</span>
          </div>
          <div className="symbol-wrapper">
            <span>🙌</span>
          </div>
          <div className="symbol-wrapper">
            <span id='test'>👑</span>
          </div>
          <div className="symbol-wrapper">
            <span>🤞</span>
          </div>
          <div className="symbol-wrapper">
            <span>😢</span>
          </div>
        </div>
      </div>
      <div className="my-emoji-wrapper">
        <div className="my-emojis">
          <span>👑🟢😊😂🤣❤️😒😁</span>
        </div>
      </div>
      <div className="six-player-wrapper">
        <div className="player-wrapper-left">
          <div className="player-wrapper">
            <div className="username">Dasher (host)</div>
            <div className="player-emojis">
              <span id='test'>👑</span>
              <span>🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
          <div className="player-wrapper">
            <div className="username">Dancer</div>
            <div className="player-emojis">
              <span>👑🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
          <div className="player-wrapper">
            <div className="username">Prancer</div>
            <div className="player-emojis">
              <span>👑🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
        </div>
        <div className="player-wrapper-right">
          <div className="player-wrapper">
            <div className="username">Vixen</div>
            <div className="player-emojis">
              <span>👑🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
          <div className="player-wrapper" >
            <div className="username">Comet (you)</div>
            <div className="player-emojis">
              <span>👑🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
          <div className="player-wrapper">
            <div className="username">Cupid</div>
            <div className="player-emojis">
              <span>👑🟢😊😂🤣❤️😒😁</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}