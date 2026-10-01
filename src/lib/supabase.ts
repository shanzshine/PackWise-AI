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
  // Return a chainable, awaitable query proxy. Every operation remains chainable
  // (select().eq().order(), auth.signOut(), storage.from().upload(), etc.) and
  // resolves once it is awaited. This keeps offline/demo mode from hanging.
  const noopResult = { data: null, error: { message: 'Supabase not configured' } }
  const chainable: any = new Proxy({}, {
    get: (_target, prop) => {
      if (prop === 'then') {
        return (resolve: (value: typeof noopResult) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(noopResult).then(resolve, reject)
      }
      return (..._args: any[]) => chainable
    },
  })
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
