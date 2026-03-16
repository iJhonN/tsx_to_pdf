'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Se já estiver logado, pula para o dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/dashboard');
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // Delay técnico para o navegador gravar o cookie/localStorage
        setTimeout(() => {
          router.refresh();
          router.push('/dashboard');
        }, 800);
      }
    } catch (error: any) {
      alert("Erro ao entrar: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
            <Lock className="text-white" size={24} />
          </div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter">Acesso Restrito</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">GR Auto Peças</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl uppercase text-[11px] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}