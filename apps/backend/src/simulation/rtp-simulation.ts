/**
 * RTP Validation Script — 雙重驗證策略
 *
 * 1. 解析驗算（Analytical Verification）：直接計算 E[payout | m, d] 是否等於 RTP × BET
 *    對所有有效 (m, d) 組合進行精確數學驗算，誤差應為浮點精度級別（< 0.001%）
 *
 * 2. Monte Carlo 模擬（限制 d ≤ 5）：模擬「保守型玩家」行為
 *    排除超低勝率的極端組合，10 萬次即可穩定收斂
 *
 * 執行方式: npx tsx src/simulation/rtp-simulation.ts
 */

import { calcMultiplier, combination } from '../utils/combinatorics'

const RTP_VALUES = [94, 96, 97, 98, 99] as const
const TOTAL_TILES = 25
const BET_AMOUNT = 100
const MAX_MINES = 10   // 模擬範圍：1~10 顆地雷
const MAX_D = 5        // 模擬範圍：最多點 5 格（保守玩家行為）

// ──────────────────────────────────────────────────────────────
// Part 1: 解析驗算
// ──────────────────────────────────────────────────────────────

function analyticalExpectedPayout(m: number, d: number, rtp: number): number {
  // P(survive d tiles with m mines in 25) = C(25-m, d) / C(25, d)
  const pSurvive = Number(combination(TOTAL_TILES - m, d)) / Number(combination(TOTAL_TILES, d))
  const multiplier = calcMultiplier(m, d, rtp)
  return pSurvive * BET_AMOUNT * multiplier
}

function runAnalyticalVerification(rtp: number): { passed: boolean; maxError: number; testedCases: number } {
  let maxError = 0
  let testedCases = 0
  const expected = BET_AMOUNT * (rtp / 100)

  for (let m = 1; m < TOTAL_TILES; m++) {
    for (let d = 1; d <= TOTAL_TILES - m; d++) {
      const payout = analyticalExpectedPayout(m, d, rtp)
      const error = Math.abs(payout - expected) / expected * 100 // percentage error
      if (error > maxError) maxError = error
      testedCases++
    }
  }

  return { passed: maxError < 0.01, maxError, testedCases }
}

// ──────────────────────────────────────────────────────────────
// Part 2: Monte Carlo 模擬（限 d ≤ 5，避免高方差極端組合）
// ──────────────────────────────────────────────────────────────

function simulateOneGame(mineCount: number, targetOpen: number, rtp: number): number {
  const deck = Array.from({ length: TOTAL_TILES }, (_, i) => i < mineCount ? 1 : 0)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]] as [0 | 1, 0 | 1]
  }
  for (let i = 0; i < targetOpen; i++) {
    if (deck[i] === 1) return 0
  }
  return BET_AMOUNT * calcMultiplier(mineCount, targetOpen, rtp)
}

function runMonteCarlo(rtp: number, simulations = 500_000): { actualRTP: number; winRate: number } {
  let totalBet = 0, totalPayout = 0, wins = 0

  for (let i = 0; i < simulations; i++) {
    const m = Math.floor(Math.random() * MAX_MINES) + 1
    const maxD = Math.min(MAX_D, TOTAL_TILES - m)
    const d = Math.floor(Math.random() * maxD) + 1

    totalBet += BET_AMOUNT
    const payout = simulateOneGame(m, d, rtp)
    totalPayout += payout
    if (payout > 0) wins++
  }

  return { actualRTP: (totalPayout / totalBet) * 100, winRate: (wins / simulations) * 100 }
}

// ──────────────────────────────────────────────────────────────
// 輸出報告
// ──────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(70))
console.log('  RTP 驗證報告')
console.log('='.repeat(70))

console.log('\n【Part 1】解析驗算 — 對所有有效 (m,d) 組合直接計算期望值')
console.log(`  E[payout | m, d] = P(survive) × multiplier × BET 應等於 RTP × BET`)
console.log('-'.repeat(70))

let allAnalyticalPassed = true
for (const rtp of RTP_VALUES) {
  const { passed, maxError, testedCases } = runAnalyticalVerification(rtp)
  if (!passed) allAnalyticalPassed = false
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`  RTP ${rtp}%  最大誤差 ${maxError.toFixed(4)}%  測試組合數 ${testedCases}  ${status}`)
}

console.log('\n【Part 2】Monte Carlo 模擬 — 保守玩家行為（d ≤ 5, m = 1~10）')
console.log(`  模擬次數: 500,000 次 / RTP，目標誤差 < 0.5%`)
console.log('-'.repeat(70))

let allMCPassed = true
for (const rtp of RTP_VALUES) {
  const { actualRTP, winRate } = runMonteCarlo(rtp)
  const error = Math.abs(actualRTP - rtp)
  const passed = error < 0.5
  if (!passed) allMCPassed = false
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`  RTP ${rtp}%  實際 ${actualRTP.toFixed(3)}%  誤差 ${error.toFixed(3)}%  勝率 ${winRate.toFixed(1)}%  ${status}`)
}

console.log('\n' + '='.repeat(70))
const finalPass = allAnalyticalPassed && allMCPassed
console.log(`  最終結果: ${finalPass ? '✅ RTP 驗證完全通過' : '❌ 部分驗證失敗'}`)
console.log('='.repeat(70) + '\n')
