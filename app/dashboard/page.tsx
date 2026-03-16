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
  const [hasFetched, setHasFetched] = useState(false);

  // --- PROTEÇÃO DE ROTA E BUSCA ÚNICA (EVITA LOOP #310) ---
  useEffect(() => {
    const inicializarDashboard = async () => {
      // getSession é mais estável para verificações de renderização
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      // Só executa a busca se ainda não foi feita nesta sessão do componente
      if (!hasFetched) {
        await fetchOrdens();
        setHasFetched(true);
      }
    };

    inicializarDashboard();
  }, [router, hasFetched]);

  const fetchOrdens = async () => {
    try {
      setLoading(true);
      // Selecionamos colunas específicas para evitar erro 400 por payload pesado ou malformado
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('id_interno, numero_os, cliente, placa, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrdens(data);
    } catch (err: any) {
      console.error("Erro na busca:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DE EXCLUSÃO COM CONFIRMAÇÃO ---
  const deletarOS = async (id_interno: string, numero_os: any) => {
    const numOS = String(numero_os);
    const confirmacao = prompt(`Para excluir, digite o número da OS (${numOS}):`);

    if (confirmacao === numOS) {
      try {
        const { error } = await supabase
          .from('ordens_servico')
          .delete()
          .eq('id_interno', id_interno);

        if (error) throw error;
        
        // Atualiza o estado local sem precisar recarregar tudo do banco
        setOrdens(prev => prev.filter(os => os.id_interno !== id_interno));
        alert("Excluída com sucesso.");
      } catch (err: any) {
        alert("Erro ao excluir: " + err.message);
      }
    } else if (confirmacao !== null) {
      alert("Número incorreto!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- FILTRO DE BUSCA BLINDADO (EVITA ERRO DE TIPO) ---
  const ordensFiltradas = ordens.filter(os => {
    const termo = searchTerm.toLowerCase();
    const cliente = String(os.cliente || "").toLowerCase();
    const placa = String(os.placa || "").toLowerCase();
    const numero = String(os.numero_os || "").toLowerCase();

    return cliente.includes(termo) || placa.includes(termo) || numero.includes(termo);
  });

  // Mostra loading apenas na primeira carga para evitar flashes de conteúdo
  if (loading && !hasFetched) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
          Sincronizando Dados...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <FileText className="text-blue-500" size={24} /> Painel Geral
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Gerenciamento Compartilhado | GR Auto Peças
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
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

      {/* BARRA DE BUSCA */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, placa ou número..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="max-w-6xl mx-auto">
        {ordensFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {ordensFiltradas.map((os) => (
              <div 
                key={os.id_interno}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-black border border-zinc-800 p-3.5 rounded-2xl text-blue-500 group-hover:scale-105 transition-transform">
                    <Car size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                        Nº {os.numero_os}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                        <Calendar size={12} /> {os.created_at ? new Date(os.created_at).toLocaleDateString('pt-BR') : '--/--/--'}
                      </span>
                    </div>
                    <h3 className="text-white font-bold uppercase text-sm tracking-tight">{os.cliente}</h3>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase">{os.placa || 'Sem Placa'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
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
            <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">
              {loading ? "Carregando..." : "Nenhuma ordem encontrada"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}