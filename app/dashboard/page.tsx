'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Trash2, Edit3, LogOut, Car, Calendar, Loader2 } from 'lucide-react';

export default function DashboardOS() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar as OS do banco de dados
  useEffect(() => {
    const fetchOrdens = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('ordens_servico')
        .select('id_interno, numero_os, cliente, placa, created_at')
        .order('created_at', { ascending: false });

      if (!error) setOrdens(data || []);
      setLoading(false);
    };

    fetchOrdens();
  }, [router]);

  // Função de Excluir com confirmação exata
  const deletarOS = async (id_interno: string, numero_os: any) => {
    const confirmacao = prompt(`Para excluir, digite o número da OS (${numero_os}):`);
    
    if (confirmacao === String(numero_os)) {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id_interno', id_interno);

      if (!error) {
        setOrdens(prev => prev.filter(os => os.id_interno !== id_interno));
        alert("Ordem de serviço removida.");
      } else {
        alert("Erro ao excluir.");
      }
    } else if (confirmacao !== null) {
      alert("Número incorreto. A exclusão foi cancelada.");
    }
  };

  // Filtro de busca
  const ordensFiltradas = ordens.filter(os => 
    String(os.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(os.placa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(os.numero_os || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <FileText className="text-blue-500" /> Painel Geral
          </h1>
          <p className="text-[10px] font-bold uppercase text-zinc-600">GR Auto Peças</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => router.push('/')} 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={16} /> Nova OS
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
            className="bg-zinc-900 text-zinc-500 p-2.5 rounded-xl border border-zinc-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="max-w-6xl mx-auto mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por cliente, placa ou número da OS..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white outline-none focus:border-blue-500 transition-all"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de OS */}
      <div className="max-w-6xl mx-auto grid gap-3">
        {ordensFiltradas.length > 0 ? (
          ordensFiltradas.map((os) => (
            <div key={os.id_interno} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4 w-full">
                <div className="bg-black p-3 rounded-xl text-blue-500">
                  <Car size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase">
                      Nº {os.numero_os}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-white font-bold uppercase text-sm leading-none">{os.cliente}</h3>
                  <p className="text-[11px] uppercase mt-1 tracking-wider">{os.placa || 'Sem Placa'}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => router.push(`/dashboard/editar/${os.id_interno}`)} 
                  className="flex-1 md:flex-none bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <button 
                  onClick={() => deletarOS(os.id_interno, os.numero_os)} 
                  className="flex-1 md:flex-none bg-red-500/10 text-red-500 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">Nenhuma ordem de serviço encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}