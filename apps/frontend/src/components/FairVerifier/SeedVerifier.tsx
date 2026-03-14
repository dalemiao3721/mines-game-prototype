import { useState } from 'react'

interface SeedVerifierProps {
  serverSeedHash: string | null
  serverSeed: string | null
  minePositions: number[]
}

export function SeedVerifier({
  serverSeedHash,
  serverSeed,
  minePositions,
}: SeedVerifierProps) {
  const [expanded, setExpanded] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'idle' | 'pass' | 'fail'>('idle')

  const handleVerify = async () => {
    if (!serverSeed || !serverSeedHash) return
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(serverSeed)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setVerifyResult(hashHex === serverSeedHash ? 'pass' : 'fail')
    } catch {
      setVerifyResult('fail')
    }
  }

  return (
    <div className="control-panel__section mt-2 pt-4 border-t border-[var(--glass-border)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm hover:opacity-80 transition-opacity"
      >
        <span className="control-panel__label">Provably Fair</span>
        <span className="text-white/50 text-xs">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 text-xs">
          {/* Server Seed Hash */}
          <div>
            <div className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest mb-1.5">Server Seed Hash</div>
            <div className="font-mono text-white/50 bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-lg p-2.5 break-all shadow-inner">
              {serverSeedHash ?? 'Not available'}
            </div>
          </div>

          {/* Server Seed (only after game ends) */}
          {serverSeed && (
            <>
              <div>
                <div className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest mb-1.5">Server Seed (revealed)</div>
                <div className="font-mono text-white/70 bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-lg p-2.5 break-all shadow-inner">
                  {serverSeed}
                </div>
              </div>

              <div>
                <div className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest mb-1.5">Mine Positions</div>
                <div className="font-mono text-accent-red/90 bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-lg p-2.5 shadow-inner">
                  [{minePositions.join(', ')}]
                </div>
              </div>

              <button
                onClick={handleVerify}
                className="w-full py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] text-white/70 font-bold hover:bg-[rgba(255,255,255,0.08)] hover:text-white hover:border-accent-purple/50 transition-all uppercase tracking-wider text-[0.7rem]"
              >
                Verify Hash
              </button>

              {verifyResult !== 'idle' && (
                <div
                  className={`text-center py-2.5 rounded-lg font-bold text-[0.75rem] uppercase tracking-wide border ${
                    verifyResult === 'pass'
                      ? 'bg-accent-green/10 text-accent-green border-accent-green/30 shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                      : 'bg-accent-red/10 text-accent-red border-accent-red/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {verifyResult === 'pass'
                    ? 'Fair Game Verified'
                    : 'Verification Failed'}
                </div>
              )}
            </>
          )}

          {!serverSeed && (
            <div className="text-white/30 text-center py-2 font-medium italic">
              Seed revealed after game ends
            </div>
          )}
        </div>
      )}
    </div>
  )
}
