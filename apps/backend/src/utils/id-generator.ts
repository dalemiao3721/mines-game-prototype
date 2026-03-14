import crypto from 'crypto'

type IdPrefix = 'BET' | 'SESS' | 'SET' | 'DRAW'

export function generateId(prefix: IdPrefix): string {
  const random = crypto.randomBytes(12).toString('hex')
  const timestamp = Date.now().toString(36)
  return `${prefix}-${timestamp}-${random}`
}
