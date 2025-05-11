import { createClient } from '@supabase/supabase-js'

// Le variabili d'ambiente in Vite sono accessibili tramite import.meta.env
// e devono essere prefissate con VITE_ nel file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validazione più rigorosa dell'URL
if (!supabaseUrl || typeof supabaseUrl !== 'string' || !supabaseUrl.startsWith('http')) {
  console.error('VITE_SUPABASE_URL non è definito o non è un URL valido. Controlla il tuo file .env e assicurati che la variabile inizi con VITE_ e sia un URL completo (es: https://xyz.supabase.co). Valore attuale:', supabaseUrl);
  throw new Error('VITE_SUPABASE_URL deve essere un URL valido (es: https://xyz.supabase.co)')
}

if (!supabaseKey || typeof supabaseKey !== 'string') {
  console.error('VITE_SUPABASE_ANON_KEY non è definito o non è una stringa valida. Controlla il tuo file .env e assicurati che la variabile inizi con VITE_. Valore attuale:', supabaseKey);
  throw new Error('VITE_SUPABASE_ANON_KEY è richiesta e deve essere una stringa')
}

export const supabase = createClient(supabaseUrl, supabaseKey)