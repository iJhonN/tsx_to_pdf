'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Trash2, Edit3, LogOut, Car, Calendar } from 'lucide-react';

export default function DashboardOS() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Verifica login e busca dados
  useEffect(() => {
    const inicializar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      fetchOrdens();
    };
    inicializar();
  }, [router]);

  // Busca TODAS as ordens (a política RLS agora permite ver tudo)
  const fetchOrdens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrdens(data);
    setLoading(false);
  };

  const deletarOS = async (id_interno: string, numero_os: string) => {
    const confirmacao = prompt(`Confirme a exclusão digitando o número da OS (${numero_os}):`);
    if (confirmacao === numero_os) {
      const { error } = await supabase.from('ordens_servico').delete().eq('id_interno', id_interno);
      if (!error) {
        setOrdens(ordens.filter(os => os.id_interno !== id_interno));
      } else {
        alert("Erro: " + error.message);
      }
    }
  };

  const ordensFiltradas = ordens.filter(os => 
    os.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.numero_os.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter">Painel Geral de OS</h1>
          <p className="text-[10px] text-zinc-600 font-bold uppercase">Todos os usuários podem visualizar e editar</p>
        </div>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2">
          <Plus size={16} /> Nova OS
        </button>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar em todas as OS..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-4">
        {loading ? (
          <div className="text-center py-10 animate-pulse uppercase text-xs font-black">Carregando dados globais...</div>
        ) : ordensFiltradas.map((os) => (
          <div key={os.id_interno} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-5 w-full">
              <div className="bg-black p-3 rounded-2xl text-blue-500"><Car size={24} /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Nº {os.numero_os}</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase italic">Editável por todos</span>
                </div>
                <h3 className="text-white font-bold uppercase text-sm">{os.cliente}</h3>
                <p className="text-[11px] uppercase">{os.placa || 'Sem Placa'}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => router.push(`/?edit=${os.id_interno}`)} className="flex-1 bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2">
                <Edit3 size={14} /> Editar
              </button>
              <button onClick={() => deletarOS(os.id_interno, os.numero_os)} className="flex-1 bg-red-500/10 text-red-500 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2">
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}