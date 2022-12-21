import { Socket } from "socket.io-client"
import Lobby from "./Lobby"

interface MySocket extends Socket {
  [key: string]: any
}
interface PlayerProps {
  socket: MySocket
  onUsernameSubmit: (username: string) => void
  onCancel: () => void
}

export default function Players({ socket, onUsernameSubmit, onCancel }: PlayerProps) {
  const handleUsernameSubmit = (username: string) => {
    onUsernameSubmit(username)
  }
  const handleCancel = () => {
    onCancel()
  }
  return (
    <div className="profile-wrapper">
      <div className="title">Players</div>
      <div className="guy-wrapper">
        <Lobby socket={socket} />
        <img src="" alt="" />
      </div>
      {/* <div className="username-wrapper">
        <input
          onSubmit={() => handleUsernameSubmit('')}
          className="username"
          type="text"
          placeholder="Enter your name" id="name"
        />
        <button className="submit-button">{'>'}</button>
      </div> */}
      <div className="menu-button">
        <button onClick={() => handleCancel()} className="cancel">Home</button>
      </div>
    </div >
  )
}