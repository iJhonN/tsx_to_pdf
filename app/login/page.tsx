'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Wrench, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage('Erro: ' + error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-zinc-900 p-10 border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 mb-4">
            <Wrench size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            GR Auto <span className="text-blue-500">Peças</span>
          </h2>
          <p className="mt-2 text-zinc-500 text-[11px] font-black uppercase tracking-widest">
            Acesso ao Sistema de Gestão
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 mb-1 block italic">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-zinc-800 bg-black/50 px-10 py-3 text-white placeholder-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="admin@grautopecas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 mb-1 block italic">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input
                  type="password"
                  required
                  className="block w-full rounded-xl border border-zinc-800 bg-black/50 px-10 py-3 text-white placeholder-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {message && (
            <div className="text-center text-[11px] font-bold text-red-500 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}