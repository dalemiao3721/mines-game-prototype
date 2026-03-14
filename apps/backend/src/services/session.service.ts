import type { GameSession } from '@mines-game/shared'

const sessions = new Map<string, GameSession>()

export function createSession(session: GameSession): void {
  sessions.set(session.sessionId, session)
}

export function getSession(sessionId: string): GameSession | undefined {
  return sessions.get(sessionId)
}

export function updateSession(
  sessionId: string,
  updates: Partial<GameSession>,
): GameSession {
  const session = sessions.get(sessionId)
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`)
  }
  const updated = { ...session, ...updates }
  sessions.set(sessionId, updated)
  return updated
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId)
}
