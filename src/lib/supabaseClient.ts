import { createClient } from '@supabase/supabase-js'

// Recupera le variabili d'ambiente specifiche di Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica che le variabili siano definite, altrimenti lancia un errore chiaro
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL non è definita. Controlla il tuo file .env");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY non è definita. Controlla il tuo file .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);