import { env } from './env'

// ──────────────────────────────────────────────
// JWT Auth Helpers
// ──────────────────────────────────────────────

const encoder = new TextEncoder()
const keyData = encoder.encode(env.JWT_SECRET)

/**
 * Sign a JWT payload using HMAC-SHA256.
 */
export async function signJwt(payload: Record<string, unknown>, expiresInSec = 30 * 24 * 3600): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + (expiresInSec || 86400) }

  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '')
  const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/=/g, '')
  const data = encoder.encode(`${headerB64}.${payloadB64}`)

  const signature = await crypto.subtle.sign('HMAC', key, data)
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${headerB64}.${payloadB64}.${sigB64}`
}

/**
 * Verify and decode a JWT token.
 */
export async function verifyJwt<T = Record<string, unknown>>(token: string): Promise<T | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !sigB64) return null

    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])

    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    if (!valid) return null

    const payload = JSON.parse(atob(payloadB64))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload as T
  } catch {
    return null
  }
}

/**
 * Hash a password using Bun's built-in Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, { algorithm: 'argon2id' })
}

/**
 * Verify a password against an Argon2id hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash)
}
