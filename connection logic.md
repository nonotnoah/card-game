## first connection:

**App.tsx (client):**

- check for 'sessionID' in tab's session storage (not there)

- connection with `socket.auth = { username }`

**index.ts (server):**

- check for `socket.handshake.auth.sessionID` (will be undefined)

- assign a `randomID()` for `socket.sessionID` and `socket.userID` 

- use `socket.handshake.auth.username` for `socket.username`

- emit sessionID to socket

**ClientGame.tsx (client):**

- save 'sessionID' in tab's session storage

**index.ts (server):**

- save `sessionID: { userID, username, roomID, connection: true }` in server storage

## on disconnect:

**index.ts (server):**

- check if socket has left `socket.roomID`

- save `sessionID: { userID, username, roomID, connection: false}` in server storage

## on reconnect:

**App.tsx (client):**

- check for 'sessionID' in tab's session storage (it's there this time)

- check for 'room' in tab's session storage (only there if a game was in progress)

- connection with `socket.auth = { sessionID, room }`

**index.ts (server):**

- check for `socket.handshake.auth.sessionID` (will be the value stored in tab's session storage)

- look for sessionID in server storage

- set sessionID from `handshake.auth`, userID, username, roomID from server storage

- join socket to old room `socket.join(socket.roomID)` if `socket.roomID` is not undefined (client was in a game before dc),

- emit sessionID to socket

**ClientGame.tsx (client):**

- save 'sessionID' in tab's session storage

**index.ts (server):**

- save `sessionID: { userID, username, roomID, connection: true }` in server storage
