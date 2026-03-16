'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit3, 
  LogOut, 
  Car, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function DashboardOS() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  // --- PROTEÇÃO DE ROTA ---
  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user: activeUser }, error } = await supabase.auth.getUser();
      
      if (error || !activeUser) {
        router.push('/login');
        return;
      }
      
      setUser(activeUser);
      fetchOrdens();
    };

    checkUserAndFetch();
  }, [router]);

  const fetchOrdens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrdens(data);
    } catch (err) {
      console.error("Erro ao buscar OS:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DE EXCLUSÃO COM CONFIRMAÇÃO POR NÚMERO ---
  const deletarOS = async (id_interno: string, numero_os: string) => {
    const numFormatado = String(numero_os);
    const confirmacao = prompt(`ATENÇÃO: Para excluir a OS do cliente, digite o número da OS (${numFormatado}) abaixo:`);

    if (confirmacao === numFormatado) {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id_interno', id_interno);

      if (!error) {
        setOrdens(prev => prev.filter(os => os.id_interno !== id_interno));
        alert("Ordem de serviço excluída com sucesso.");
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    } else if (confirmacao !== null) {
      alert("Número incorreto. A exclusão foi cancelada.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- FILTRO CORRIGIDO (Evita erro toLowerCase em números) ---
  const ordensFiltradas = ordens.filter(os => {
    const cliente = os.cliente?.toLowerCase() || '';
    const placa = os.placa?.toLowerCase() || '';
    const numero = String(os.numero_os || '').toLowerCase();
    const busca = searchTerm.toLowerCase();

    return cliente.includes(busca) || placa.includes(busca) || numero.includes(busca);
  });

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
          Sincronizando Banco de Dados...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <FileText className="text-blue-500" size={24} /> Painel Geral
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Acesso Compartilhado | GR Auto Peças
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={16} /> Nova OS
          </button>
          <button 
            onClick={handleLogout}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 p-2.5 rounded-xl transition-all border border-zinc-800"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* BUSCA */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, placa ou número da OS..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-zinc-700 font-black uppercase text-xs animate-pulse">
            Buscando ordens de serviço...
          </div>
        ) : ordensFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {ordensFiltradas.map((os) => (
              <div 
                key={os.id_interno}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition-all group hover:bg-zinc-900"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-black border border-zinc-800 p-3.5 rounded-2xl text-blue-500 group-hover:text-blue-400 transition-colors">
                    <Car size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                        Nº {os.numero_os}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                        <Calendar size={12} /> {os.created_at ? new Date(os.created_at).toLocaleDateString('pt-BR') : 'Sem data'}
                      </span>
                    </div>
                    <h3 className="text-white font-bold uppercase text-sm tracking-tight">{os.cliente}</h3>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase">{os.placa || 'Sem Placa'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-zinc-800 pt-4 md:border-none md:pt-0">
                  <button 
                    onClick={() => router.push(`/?edit=${os.id_interno}`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all"
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => deletarOS(os.id_interno, os.numero_os)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-zinc-900 rounded-3xl">
            <AlertTriangle className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Nenhuma ordem encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}