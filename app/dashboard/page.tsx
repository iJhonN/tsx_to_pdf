'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  CarFront, 
  User, 
  FileText, 
  ArrowRight, 
  Wrench,
  LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Função para procurar as OS no banco de dados
  const fetchOS = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setOrdens(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOS();
  }, []);

  // Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Filtro de pesquisa (Placa, Cliente ou Número da OS)
  const filteredOS = ordens.filter(os => 
    os.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.numero_os?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/20">
              <Wrench size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                GR AUTO <span className="text-blue-500">PEÇAS</span>
              </h1>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em]">
                Sistema de Gestão de Ordens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => router.push('/')}
              className="flex-1 md:flex-none bg-white text-black px-6 py-4 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl"
            >
              <Plus size={18}/> Nova OS
            </button>
            <button 
              onClick={handleSignOut}
              className="bg-zinc-900 text-zinc-500 p-4 rounded-2xl hover:text-red-500 border border-zinc-800 transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
          <input
            type="text"
            placeholder="PESQUISAR POR PLACA, CLIENTE OU N° DA OS..."
            className="w-full bg-zinc-900/50 border border-zinc-800 p-5 pl-14 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de OS */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="font-black uppercase tracking-widest text-[10px]">A aceder à base de dados...</p>
            </div>
          ) : filteredOS.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Nenhuma ordem encontrada</p>
            </div>
          ) : (
            filteredOS.map((os) => (
              <div 
                key={os.id_interno}
                className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="hidden sm:flex bg-black p-4 rounded-2xl text-blue-500 border border-zinc-800 group-hover:scale-110 transition-all">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-emerald-400 font-black text-xs tracking-tighter">OS #{os.numero_os}</span>
                      <span className="bg-zinc-800 text-zinc-500 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                        {new Date(os.data_os).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-black uppercase text-zinc-100 mb-2 truncate max-w-[250px] md:max-w-md">
                      {os.cliente}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-zinc-500">
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
                        <CarFront size={14} className="text-zinc-700" />
                        <span className="text-zinc-400">{os.placa || 'Sem Placa'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
                        <User size={14} className="text-zinc-700" />
                        <span className="text-zinc-400">{os.dados_json?.mecanico || 'S/ Mecânico'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto md:gap-8 border-t border-zinc-800 md:border-0 pt-4 md:pt-0">
                  <div className="md:text-right">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Total Geral</p>
                    <p className="text-base font-black text-white italic tracking-tighter">
                      R$ {Number(
                        (os.dados_json?.pecas?.reduce((acc: any, p: any) => acc + (p.qtd * p.valorUnitario), 0) || 0) +
                        (os.dados_json?.servicos?.reduce((acc: any, s: any) => acc + (s.valor || 0), 0) || 0)
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push(`/?edit=${os.id_interno}`)}
                    className="bg-blue-600/10 text-blue-500 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.5em]">
            GR Auto Peças v2.0 • Ligado ao Supabase Cloud
          </p>
        </div>
      </div>
    </div>
  );
}