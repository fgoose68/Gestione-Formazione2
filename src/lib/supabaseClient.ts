import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validazione più rigorosa dell'URL
if (!supabaseUrl || !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  throw new Error('URL Supabase non valido. Formato atteso: https://[id-progetto].supabase.co')
}

export const supabase = createClient(supabaseUrl, supabaseKey)