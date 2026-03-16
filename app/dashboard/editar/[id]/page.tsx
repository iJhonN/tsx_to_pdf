'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense, use } from 'react';
import { Printer, Trash2, Plus, X, Wrench, Building2, CarFront, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function EditarOSContent({ params }: { params: any }) {
  const unwrappedParams: any = use(params);
  const osId = unwrappedParams.id;
  const router = useRouter();

  const [dadosOS, setDadosOS] = useState<any>(null);
  const [responsavel, setResponsavel] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const carregarOS = async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('id_interno', osId)
        .single();

      if (data && !error) {
        setDadosOS(data.dados_json);
        setResponsavel(data.dados_json.responsavel || '');
      }
      setLoading(false);
    };
    carregarOS();
  }, [osId]);

  const atualizarNoBanco = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('ordens_servico')
      .update({
        cliente: dadosOS.cliente,
        placa: dadosOS.placa,
        dados_json: { ...dadosOS, responsavel }
      })
      .eq('id_interno', osId);

    if (error) alert("Erro ao atualizar");
    else {
      alert("Atualizado!");
      router.push('/dashboard');
    }
    setIsSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Carregando OS...</div>;

  const totalProdutos = dadosOS?.pecas?.reduce((acc: number, p: any) => acc + (p.qtd * p.valorUnitario), 0) || 0;
  const totalServicos = dadosOS?.servicos?.reduce((acc: number, s: any) => acc + (s.valor || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-black">
        {/* DESIGN EXATAMENTE IGUAL À PAGE.TSX */}
        <div className="flex h-screen no-print">
            <div className="w-[450px] border-r border-zinc-800 bg-zinc-900 flex flex-col p-6">
                 <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500 mb-6">
                    <ArrowLeft size={14}/> Voltar ao Dashboard
                </button>
                
                {/* Form de Edição (Use a mesma estrutura da página de criar) */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Renderize aqui os mesmos inputs que você usa na criação */}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <button onClick={atualizarNoBanco} disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase text-[11px]">
                       {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 bg-zinc-950 p-12 flex justify-center overflow-y-auto">
                 <div className="w-[210mm] bg-white shadow-2xl h-fit">
                    <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} ocultarValores={false} responsavel={responsavel} />
                </div>
            </div>
        </div>
    </div>
  );
}

// Copie o componente OSContent aqui também ou crie um arquivo compartilhado para ele.
function OSContent({ dadosOS, totalProdutos, totalServicos, ocultarValores, responsavel }: any) {
    return ( <div className="p-12 text-black bg-white font-sans"> {/* Seu layout de sempre */} </div> );
}

export default function Page({ params }: { params: any }) {
  return <Suspense><EditarOSContent params={params} /></Suspense>;
}