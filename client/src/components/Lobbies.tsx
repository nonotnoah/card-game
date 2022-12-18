import { useState, useRef } from "react"
import createRoomID from "../utils/createRoomID"
import HostLobby from "./HostLobby"
import JoinLobby from "./JoinLobby"

export default function Lobbies() {
    const [host, setHost] = useState(false)
    const [join, setJoin] = useState(false)
    const gameID = useRef('')

    const createRoom = () => {
        // gameID.current = createRoomID()
        gameID.current = '12345'
        setHost(true)
    }

    const joinRoom = (id: string) => {
        gameID.current = id
        setHost(false)
        setJoin(true)
    }

    return (
        <div className="wrapper">
            {host ? (
                <HostLobby gameID={gameID.current}></HostLobby>
            ) : join ? (
                <JoinLobby gameID={gameID.current}></JoinLobby>
            ) : (
                <div className="wrapper">
                    <button
                        onClick={() => createRoom()}
                        className="host">Create Room
                    </button>
                    <button // TODO: this will be an input
                        onClick={() => joinRoom('12345')}
                        className="join">Join Room
                    </button>
                </div>
            )}
        </div>
    )
}