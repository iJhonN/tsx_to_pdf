import { createClient } from '@supabase/supabase-auth-helpers-nextjs'; // Opcional, ou use o padrão:
import { createClient as createBaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Criamos o cliente apenas uma vez (Singleton) para evitar problemas de memória e loops
export const supabase = createBaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Garante que o login não caia ao dar F5
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});