'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Search, Plus, CarFront, User, FileText, Calendar, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOS = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error) setOrdens(data);
    setLoading(false);
  };

  useEffect(() => { fetchOS(); }, []);

  const filteredOS = ordens.filter(os => 
    os.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.numero_os?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Painel de <span className="text-blue-500">Controle</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">GR Auto Peças - Histórico de OS</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-white text-black px-6 py-4 rounded-2xl font-black uppercase text-[11px] flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
          >
            <Plus size={18}/> Nova Ordem de Serviço
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="PESQUISAR POR PLACA, CLIENTE OU NÚMERO DA OS..."
            className="w-full bg-zinc-900 border border-zinc-800 p-5 pl-14 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Listagem Estilo Cards Dark */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-20 text-zinc-600 animate-pulse font-black uppercase tracking-widest text-xs">Carregando base de dados...</div>
          ) : filteredOS.map((os) => (
            <div 
              key={os.id_interno}
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-600 transition-all group"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="bg-black p-4 rounded-xl text-blue-500 border border-zinc-800 group-hover:border-blue-500/50 transition-all">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 font-black text-xs">#{os.numero_os}</span>
                    <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">{new Date(os.data_os).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase leading-none mb-1 text-zinc-200">{os.cliente}</h3>
                  <div className="flex gap-4 text-zinc-500">
                    <p className="text-[10px] font-bold flex items-center gap-1 uppercase"><CarFront size={12}/> {os.placa}</p>
                    <p className="text-[10px] font-bold flex items-center gap-1 uppercase"><User size={12}/> {os.dados_json.mecanico || 'S/M'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-zinc-800 md:border-0 pt-4 md:pt-0">
                <div className="text-right mr-4">
                  <p className="text-[8px] font-black text-zinc-600 uppercase">Valor Total</p>
                  <p className="text-sm font-black text-white italic">
                    R$ {(os.dados_json.pecas?.reduce((acc:any, p:any) => acc + (p.qtd * p.valorUnitario), 0) + 
                         os.dados_json.servicos?.reduce((acc:any, s:any) => acc + (s.valor || 0), 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>
                <button 
                  onClick={() => router.push(`/?edit=${os.id_interno}`)}
                  className="bg-zinc-800 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}