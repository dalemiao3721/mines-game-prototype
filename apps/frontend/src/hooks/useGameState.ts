import { useReducer, useCallback } from 'react'
import type { TileState, GameStatus, RTPSetting } from '../types'

export interface GameState {
  status: GameStatus
  tiles: TileState[]
  currentMultiplier: number
  nextMultiplier: number
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
  | { type: 'GAME_STARTED'; sessionId: string; serverSeedHash: string; nextMultiplier: number }
  | { type: 'TILE_SAFE'; tileIndex: number; newMultiplier: number; nextMultiplier: number }
  | { type: 'TILE_MINE'; tileIndex: number; serverSeed: string; minePositions: number[] }
  | { type: 'CASHOUT'; serverSeed: string; minePositions: number[]; payout: number; finalMultiplier: number }
  | { type: 'DISMISS_RESULT' }
  | { type: 'RESET' }

const initialState: GameState = {
  status: 'idle',
  tiles: Array(25).fill('unrevealed'),
  currentMultiplier: 1.0,
  nextMultiplier: 0,
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
        nextMultiplier: action.nextMultiplier,
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
        nextMultiplier: action.nextMultiplier,
        potentialPayout,
      }
    }

    case 'TILE_MINE': {
      const tiles = [...state.tiles]
      // Reveal all tiles: mine positions as 'mine', others as 'safe'
      for (let i = 0; i < tiles.length; i++) {
        if (action.minePositions.includes(i)) {
          tiles[i] = 'mine'
        } else if (tiles[i] === 'unrevealed') {
          tiles[i] = 'safe'
        }
      }
      return {
        ...state,
        status: 'lose',
        tiles,
        serverSeed: action.serverSeed,
        minePositions: action.minePositions,
        potentialPayout: 0,
        nextMultiplier: 0,
      }
    }

    case 'CASHOUT': {
      const tiles = [...state.tiles]
      // Reveal everything on cashout
      for (let i = 0; i < tiles.length; i++) {
        if (action.minePositions.includes(i)) {
          tiles[i] = 'mine'
        } else if (tiles[i] === 'unrevealed') {
          tiles[i] = 'safe'
        }
      }
      return {
        ...state,
        status: 'win',
        tiles, // Add revealed tiles here
        serverSeed: action.serverSeed,
        minePositions: action.minePositions,
        currentMultiplier: action.finalMultiplier,
        potentialPayout: action.payout,
        nextMultiplier: 0,
      }
    }

    case 'DISMISS_RESULT':
      return {
        ...state,
        status: 'idle',
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
  const gameStarted = useCallback((sessionId: string, serverSeedHash: string, nextMultiplier: number) =>
    dispatch({ type: 'GAME_STARTED', sessionId, serverSeedHash, nextMultiplier }), [])
  const tileSafe = useCallback((tileIndex: number, newMultiplier: number, nextMultiplier: number) =>
    dispatch({ type: 'TILE_SAFE', tileIndex, newMultiplier, nextMultiplier }), [])
  const tileMine = useCallback((tileIndex: number, serverSeed: string, minePositions: number[]) =>
    dispatch({ type: 'TILE_MINE', tileIndex, serverSeed, minePositions }), [])
  const cashout = useCallback((serverSeed: string, minePositions: number[], payout: number, finalMultiplier: number) =>
    dispatch({ type: 'CASHOUT', serverSeed, minePositions, payout, finalMultiplier }), [])
  const dismissResult = useCallback(() => dispatch({ type: 'DISMISS_RESULT' }), [])
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
    dismissResult,
    reset,
  }
}
