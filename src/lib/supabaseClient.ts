import { createClient } from '@supabase/supabase-js';

// Le variabili d'ambiente in Vite devono iniziare con VITE_
// e sono accessibili tramite import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Errore: Le variabili d'ambiente VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non sono definite." +
    " Assicurati di aver creato un file .env nella root del progetto con questi valori." +
    " Esempio di file .env:\n" +
    "VITE_SUPABASE_URL=https://tuo-progetto.supabase.co\n" +
    "VITE_SUPABASE_ANON_KEY=tua-anon-key"
  );
  // Potresti voler lanciare un errore qui o gestire il caso in cui le chiavi non sono disponibili
  // throw new Error("Variabili d'ambiente Supabase non configurate.");
}

export const supabase = createClient(supabaseUrl as string, supabaseKey as string);