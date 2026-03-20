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
export {};
//# sourceMappingURL=rtp-simulation.d.ts.map