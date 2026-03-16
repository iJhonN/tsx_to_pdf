import { createBrowserClient } from '@supabase/ssr'

// Estas variáveis devem estar configuradas no seu .env.local 
// e também nas Environment Variables da Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de segurança para evitar que a aplicação quebre se as chaves faltarem
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Atenção: As chaves do Supabase não foram encontradas. Verifique o seu ficheiro .env ou as configurações da Vercel.'
  )
}

export const supabase = createBrowserClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
)