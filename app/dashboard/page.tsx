'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Trash2, Edit3, LogOut, Car, Calendar, Loader2, AlertCircle } from 'lucide-react';

export default function DashboardOS() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // --- CARREGAR ORDENS DO BANCO ---
  const fetchOrdens = async () => {
    setLoading(true);
    setErrorLog(null);
    
    try {
      // 1. Verifica sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Busca todas as OS sem filtro de user_id (Equipe Total)
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*') 
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Dados recebidos do banco:", data);
      setOrdens(data || []);
      
    } catch (err: any) {
      console.error("Erro na busca:", err.message);
      setErrorLog(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, [router]);

  // --- FUNÇÃO DE EXCLUSÃO COM CONFIRMAÇÃO ---
  const deletarOS = async (id_interno: string, numero_os: any) => {
    const confirmacao = prompt(`Para confirmar a exclusão, digite o número da OS (${numero_os}):`);
    
    if (confirmacao === String(numero_os)) {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id_interno', id_interno);

      if (!error) {
        setOrdens(prev => prev.filter(os => os.id_interno !== id_interno));
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    } else if (confirmacao !== null) {
      alert("Número incorreto. Operação cancelada.");
    }
  };

  // --- FILTRO DE BUSCA ---
  const ordensFiltradas = ordens.filter(os => {
    const termo = searchTerm.toLowerCase();
    return (
      os.cliente?.toLowerCase().includes(termo) ||
      os.placa?.toLowerCase().includes(termo) ||
      String(os.numero_os).includes(termo)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-500 animate-spin" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizando Banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <FileText className="text-blue-500" /> Ordens de Serviço
          </h1>
          <p className="text-[10px] font-bold uppercase text-zinc-600">Gestão Compartilhada | GR Auto Peças</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => router.push('/')} 
            className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
          >
            <Plus size={18} /> Nova OS
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
            className="bg-zinc-900 text-zinc-500 p-3 rounded-2xl border border-zinc-800 hover:text-red-500 transition-all active:scale-95"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="max-w-6xl mx-auto mb-8 relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por Cliente, Placa ou Número da OS..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Log de Erro se houver */}
      {errorLog && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs">
          <AlertCircle size={18} />
          <span>Erro ao carregar: {errorLog}. Verifique as políticas RLS no Supabase.</span>
        </div>
      )}

      {/* Lista de OS */}
      <div className="max-w-6xl mx-auto grid gap-3">
        {ordensFiltradas.length > 0 ? (
          ordensFiltradas.map((os) => (
            <div 
              key={os.id_interno} 
              className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-600 hover:bg-zinc-900/60 transition-all group"
            >
              <div className="flex items-center gap-5 w-full">
                <div className="bg-black border border-zinc-800 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Car size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-md uppercase">
                      OS #{os.numero_os}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-white font-black uppercase text-base tracking-tight leading-none">
                    {os.cliente || 'CLIENTE NÃO INFORMADO'}
                  </h3>
                  <p className="text-[11px] font-bold uppercase mt-1.5 text-zinc-500 tracking-widest flex items-center gap-2">
                    PLACA: <span className="text-emerald-500">{os.placa || '---'}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => router.push(`/dashboard/editar/${os.id_interno}`)} 
                  className="flex-1 md:flex-none bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
                >
                  <Edit3 size={16} /> Editar
                </button>
                <button 
                  onClick={() => deletarOS(os.id_interno, os.numero_os)} 
                  className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  title="Excluir OS"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-zinc-900/10 border-2 border-dashed border-zinc-900 rounded-[40px] flex flex-col items-center gap-4">
            <div className="bg-zinc-900 p-6 rounded-full text-zinc-800">
               <FileText size={40} />
            </div>
            <div>
              <p className="text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">Nenhum registro encontrado</p>
              <p className="text-zinc-700 text-[10px] uppercase font-bold mt-1">Clique em "Nova OS" para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}