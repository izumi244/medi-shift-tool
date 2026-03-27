import { User, SessionData } from '@/types/auth'

const SESSION_DURATION = 60 * 60 * 1000        // 1時間
const REMEMBER_DURATION = 14 * 24 * 60 * 60 * 1000  // 2週間

export function createSession(user: User, rememberMe: boolean, sessionToken: string): SessionData {
  const duration = rememberMe ? REMEMBER_DURATION : SESSION_DURATION

  return {
    user,
    session_token: sessionToken,
    expires_at: Date.now() + duration,
    remember_me: rememberMe
  }
}

/**
 * 現在のセッションからセッショントークンを取得
 */
export function getSessionToken(): string | null {
  const session = getSession()
  return session?.session_token || null
}

export function saveSession(session: SessionData): void {
  const storage = session.remember_me ? localStorage : sessionStorage
  storage.setItem('session', JSON.stringify(session))
}

export function getSession(): SessionData | null {
  // まずsessionStorageをチェック
  let sessionData = sessionStorage.getItem('session')
  if (!sessionData) {
    // なければlocalStorageをチェック
    sessionData = localStorage.getItem('session')
  }

  if (!sessionData) return null

  try {
    const session: SessionData = JSON.parse(sessionData)
    
    // 期限チェック
    if (Date.now() > session.expires_at) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem('session')
  localStorage.removeItem('session')
}

export function isSessionValid(): boolean {
  const session = getSession()
  return session !== null
}
