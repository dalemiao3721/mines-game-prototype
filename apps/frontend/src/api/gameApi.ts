import type {
  StartGameRequest,
  StartGameResponse,
  PickTileRequest,
  PickTileResponse,
  CashoutRequest,
  CashoutResponse,
} from '../types'

const BASE_URL = '/mines-api/game'

async function request<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const gameApi = {
  start: (data: StartGameRequest) =>
    request<StartGameResponse>('/start', data),

  pick: (data: PickTileRequest) =>
    request<PickTileResponse>('/pick', data),

  cashout: (data: CashoutRequest) =>
    request<CashoutResponse>('/cashout', data),

  /** Fetch balance from the lobby API (frontend-direct call) */
  getLobbyBalance: async (lobbyToken: string): Promise<{ balance: number; currency: string }> => {
    const res = await fetch('/api/game/balance', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${lobbyToken}` },
    })
    if (!res.ok) {
      throw new Error(`Failed to get lobby balance: HTTP ${res.status}`)
    }
    return res.json()
  },
}
