import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : 'local'
const isMobileView = typeof window !== 'undefined'
  && window.matchMedia('(max-width: 520px)').matches
const authStorageKey = isMobileView
  ? `sb-${projectRef}-mobile-auth-token`
  : `sb-${projectRef}-auth-token`

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your local .env file.') 
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storageKey: authStorageKey,
    },
  },
)
