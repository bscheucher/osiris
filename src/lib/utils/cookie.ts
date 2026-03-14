/* 
    This is a modified version of the SessionStore class from NextAuth.
    It is used to chunk the session cookie into smaller chunks to fit the allowed cookie size.
    Original source: ${projectRoot}/node_modules/next-auth/core/lib/cookie.d.ts
 */

import { CookieOption } from 'next-auth'

const ALLOWED_COOKIE_SIZE = 4096
// Based on commented out section above
const ESTIMATED_EMPTY_COOKIE_SIZE = 160
const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE

interface Cookie extends CookieOption {
  value: string
}

type Chunks = Record<string, string>

export class SessionStore {
  #chunks: Chunks = {}
  #option: CookieOption

  constructor(option: CookieOption, cookies?: Record<string, string>) {
    this.#option = option
    if (!cookies) return

    const { name: sessionCookiePrefix } = option

    for (const [name, value] of Object.entries(cookies)) {
      if (!name.startsWith(sessionCookiePrefix) || !value) continue
      this.#chunks[name] = value
    }
  }

  /**
   * The JWT Session or database Session ID
   * constructed from the cookie chunks.
   */
  get value() {
    // Sort the chunks by their keys before joining
    const sortedKeys = Object.keys(this.#chunks).sort((a, b) => {
      const aSuffix = parseInt(a.split('.').pop() || '0')
      const bSuffix = parseInt(b.split('.').pop() || '0')

      return aSuffix - bSuffix
    })

    // Use the sorted keys to join the chunks in the correct order
    return sortedKeys.map((key) => this.#chunks[key]).join('')
  }

  /** Given a cookie, return a list of cookies, chunked to fit the allowed cookie size. */
  #chunk(cookie: Cookie): Cookie[] {
    const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE)

    if (chunkCount === 1) {
      this.#chunks[cookie.name] = cookie.value
      return [cookie]
    }

    const cookies: Cookie[] = []
    for (let i = 0; i < chunkCount; i++) {
      const name = `${cookie.name}.${i}`
      const value = cookie.value.substr(i * CHUNK_SIZE, CHUNK_SIZE)
      cookies.push({ ...cookie, name, value })
      this.#chunks[name] = value
    }

    return cookies
  }

  /** Returns cleaned cookie chunks. */
  #clean(): Record<string, Cookie> {
    const cleanedChunks: Record<string, Cookie> = {}
    for (const name in this.#chunks) {
      delete this.#chunks?.[name]
      cleanedChunks[name] = {
        name,
        value: '',
        options: { ...this.#option.options, maxAge: 0 },
      }
    }
    return cleanedChunks
  }

  /**
   * Given a cookie value, return new cookies, chunked, to fit the allowed cookie size.
   * If the cookie has changed from chunked to unchunked or vice versa,
   * it deletes the old cookies as well.
   */
  chunk(value: string, options?: Partial<Cookie['options']>): Cookie[] {
    // Assume all cookies should be cleaned by default
    const cookies: Record<string, Cookie> = this.#clean()

    // Calculate new chunks
    const chunked = this.#chunk({
      name: this.#option.name,
      value,
      options: { ...this.#option.options, ...options },
    })

    // Update stored chunks / cookies
    for (const chunk of chunked) {
      cookies[chunk.name] = chunk
    }

    return Object.values(cookies)
  }

  /** Returns a list of cookies that should be cleaned. */
  clean(): Cookie[] {
    return Object.values(this.#clean())
  }
}
