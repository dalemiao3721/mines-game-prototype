import { useReducer, useCallback } from 'react'
import type { TileState, GameStatus, RTPSetting } from '../types'

export interface GameState {
  status: GameStatus
  tiles: TileState[]
  currentMultiplier: number
  potentialPayout: number
  sessionId: string | null
  serverSeedHash: string | null
  serverSeed: string | null
  minePositions: number[]
  betAmount: number
  mineCount: number
  rtp: RTPSetting
}

type GameAction =
  | { type: 'SET_BET'; betAmount: number }
  | { type: 'SET_MINES'; mineCount: number }
  | { type: 'SET_RTP'; rtp: RTPSetting }
  | { type: 'GAME_STARTED'; sessionId: string; serverSeedHash: string }
  | { type: 'TILE_SAFE'; tileIndex: number; newMultiplier: number }
  | { type: 'TILE_MINE'; tileIndex: number; serverSeed: string; minePositions: number[] }
  | { type: 'CASHOUT'; serverSeed: string; minePositions: number[]; payout: number; finalMultiplier: number }
  | { type: 'RESET' }

const initialState: GameState = {
  status: 'idle',
  tiles: Array(25).fill('unrevealed'),
  currentMultiplier: 1.0,
  potentialPayout: 0,
  sessionId: null,
  serverSeedHash: null,
  serverSeed: null,
  minePositions: [],
  betAmount: 100,
  mineCount: 5,
  rtp: 96,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_BET':
      return { ...state, betAmount: action.betAmount }
    case 'SET_MINES':
      return { ...state, mineCount: action.mineCount }
    case 'SET_RTP':
      return { ...state, rtp: action.rtp }

    case 'GAME_STARTED':
      return {
        ...state,
        status: 'active',
        tiles: Array(25).fill('unrevealed'),
        currentMultiplier: 1.0,
        potentialPayout: state.betAmount,
        sessionId: action.sessionId,
        serverSeedHash: action.serverSeedHash,
        serverSeed: null,
        minePositions: [],
      }

    case 'TILE_SAFE': {
      const tiles = [...state.tiles]
      tiles[action.tileIndex] = 'safe'
      const potentialPayout = parseFloat((state.betAmount * action.newMultiplier).toFixed(2))
      return {
        ...state,
        tiles,
        currentMultiplier: action.newMultiplier,
        potentialPayout,
      }
    }

    case 'TILE_MINE': {
      const tiles = [...state.tiles]
      tiles[action.tileIndex] = 'mine'
      // Reveal all mine positions
      for (const pos of action.minePositions) {
        if (tiles[pos] === 'unrevealed') tiles[pos] = 'mine'
      }
      return {
        ...state,
        status: 'lose',
        tiles,
        serverSeed: action.serverSeed,
        minePositions: action.minePositions,
        potentialPayout: 0,
      }
    }

    case 'CASHOUT':
      return {
        ...state,
        status: 'win',
        serverSeed: action.serverSeed,
        minePositions: action.minePositions,
        currentMultiplier: action.finalMultiplier,
        potentialPayout: action.payout,
      }

    case 'RESET':
      return {
        ...initialState,
        betAmount: state.betAmount,
        mineCount: state.mineCount,
        rtp: state.rtp,
      }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const setBet = useCallback((betAmount: number) => dispatch({ type: 'SET_BET', betAmount }), [])
  const setMines = useCallback((mineCount: number) => dispatch({ type: 'SET_MINES', mineCount }), [])
  const setRTP = useCallback((rtp: RTPSetting) => dispatch({ type: 'SET_RTP', rtp }), [])
  const gameStarted = useCallback((sessionId: string, serverSeedHash: string) =>
    dispatch({ type: 'GAME_STARTED', sessionId, serverSeedHash }), [])
  const tileSafe = useCallback((tileIndex: number, newMultiplier: number) =>
    dispatch({ type: 'TILE_SAFE', tileIndex, newMultiplier }), [])
  const tileMine = useCallback((tileIndex: number, serverSeed: string, minePositions: number[]) =>
    dispatch({ type: 'TILE_MINE', tileIndex, serverSeed, minePositions }), [])
  const cashout = useCallback((serverSeed: string, minePositions: number[], payout: number, finalMultiplier: number) =>
    dispatch({ type: 'CASHOUT', serverSeed, minePositions, payout, finalMultiplier }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    state,
    setBet,
    setMines,
    setRTP,
    gameStarted,
    tileSafe,
    tileMine,
    cashout,
    reset,
  }
}
