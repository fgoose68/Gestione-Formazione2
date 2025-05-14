import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tqsrqwughplknttckjaw.supabase.co"
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3Jxd3VnaHBsa250dGNramF3Iiwicm9sZSI6ImFub24iLCJpYXQj3Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)