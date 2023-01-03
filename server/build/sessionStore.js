"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* abstract */ class SessionStore {
    findSession(id) { }
    // saveSession(id: string, session: Map<any, any>) { }
    findAllSessions() { }
}
class ServerSessionStore extends SessionStore {
    constructor() {
        super();
        this.sessions = new Map(); // this will need to be cleared at some time
    }
    // not implemented
    findSession(id) {
        return this.sessions.get(id);
    }
    // saveSession(id: string, session: Map<any, any>) {
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    deleteSession(id) {
        this.sessions.delete(id);
    }
    findAllSessions() {
        return [...this.sessions.values()];
    }
    closeAllSessions() {
        this.sessions = new Map();
    }
}
const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, username, connected]) => userID ? { userID, username, connected: connected === "true" } : undefined;
// module.exports = {
//     InMemorySessionStore,
// };
exports.default = ServerSessionStore;
