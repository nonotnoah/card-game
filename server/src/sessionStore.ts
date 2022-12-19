/* abstract */ class SessionStore {
  findSession(id: string) { }
  // saveSession(id: string, session: Map<any, any>) { }
  findAllSessions() { }
}
interface Session {
  userID: string,
  username: string,
  connected: Boolean,
  gameID: string,
  isHost: Boolean
}
class ServerSessionStore extends SessionStore {
  sessions
  constructor() {
    super();
    this.sessions = new Map<string, Session>(); // this will need to be cleared at some time
  }

  // not implemented
  findSession(id: string) {
    return this.sessions.get(id);
  }

  // saveSession(id: string, session: Map<any, any>) {
  saveSession(id: string, session: Session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }

  closeAllSessions() {
    this.sessions = new Map<string, Session>()
  }
}

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, username, connected]: [userID: string, username: string, connected: string]) =>
  userID ? { userID, username, connected: connected === "true" } : undefined;

// module.exports = {
//     InMemorySessionStore,
// };

export default ServerSessionStore