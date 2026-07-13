import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Create a real Supabase client only when env vars are configured.
 * Otherwise return a safe no-op proxy so the rest of the app doesn't crash.
 */
function createSafeClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  console.warn('[PackWise] Supabase env vars not set — running without database.')
  // Return a proxy that returns { data: null, error: null } for any call chain
  const noopResult = { data: null, error: { message: 'Supabase not configured' } }
  const chainable: any = new Proxy({}, {
    get: () => (..._args: any[]) => chainable,
  })
  // Override terminal methods that return promises
  chainable.then = (resolve: any) => resolve(noopResult)
  chainable.insert = () => Promise.resolve(noopResult)
  chainable.select = () => Promise.resolve(noopResult)
  chainable.update = () => Promise.resolve(noopResult)
  chainable.delete = () => Promise.resolve(noopResult)
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'from') return () => chainable
      if (prop === 'auth') return chainable
      if (prop === 'storage') return chainable
      return () => chainable
    },
  }
  return new Proxy({}, handler) as unknown as SupabaseClient
}

export const supabase = createSafeClient()
