const sessions = new Map();
export function createSession(session) {
    sessions.set(session.sessionId, session);
}
export function getSession(sessionId) {
    return sessions.get(sessionId);
}
export function updateSession(sessionId, updates) {
    const session = sessions.get(sessionId);
    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }
    const updated = { ...session, ...updates };
    sessions.set(sessionId, updated);
    return updated;
}
export function deleteSession(sessionId) {
    return sessions.delete(sessionId);
}
//# sourceMappingURL=session.service.js.map