'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense, use } from 'react';
import { Printer, ClipboardList, Trash2, Plus, X, Wrench, Building2, CarFront, Save, ArrowLeft, Loader2, MapPin, Fingerprint, EyeOff, Eye, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function EditarOSContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [dadosOS, setDadosOS] = useState<any>(null);
  const [responsavel, setResponsavel] = useState<string>('');
  const [ocultarValoresServicos, setOcultarValoresServicos] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // --- 1. CARREGAR PREFERÊNCIA DE EXIBIÇÃO ---
  useEffect(() => {
    const preference = localStorage.getItem('os_ocultar_valores');
    if (preference !== null) {
      setOcultarValoresServicos(preference === 'true');
    }
  }, []);

  // --- 2. CARREGAR DADOS DA OS DO SUPABASE ---
  useEffect(() => {
    const carregarOS = async () => {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('id_interno', id)
        .single();

      if (data && !error) {
        setDadosOS(data.dados_json);
        setResponsavel(data.dados_json.responsavel || '');
      } else {
        alert("Erro ao carregar OS ou OS não encontrada.");
        router.push('/dashboard');
      }
      setLoading(false);
    };

    carregarOS();
  }, [id, router]);

  // --- 3. FUNÇÃO DE CÓPIA (FORMATO OBJETO LITERAL PARA O SITE) ---
  const copiarJSON = () => {
    const obj = { ...dadosOS, responsavel };
    
    let str = "{\n";
    str += `  id: "${obj.id}",\n`;
    str += `  data: "${obj.data}",\n`;
    str += `  hora: "${obj.hora}",\n`;
    str += `  cliente: "${obj.cliente}",\n`;
    str += `  cnpj: "${obj.cnpj}",\n`;
    str += `  cidade: "${obj.cidade}",\n`;
    str += `  uf: "${obj.uf}",\n`;
    str += `  endereco: "${obj.endereco}",\n`;
    str += `  veiculo: "${obj.veiculo}",\n`;
    str += `  marca: "${obj.marca}",\n`;
    str += `  placa: "${obj.placa}",\n`;
    str += `  mecanico: "${obj.mecanico}",\n`;
    str += `  responsavel: "${responsavel}",\n`;
    
    str += `  servicos: [\n`;
    obj.servicos.forEach((s: any, i: number) => {
      str += `    { descricao: "${s.descricao}", valor: ${Number(s.valor).toFixed(2)} }${i === obj.servicos.length - 1 ? '' : ','}\n`;
    });
    str += `  ],\n`;

    str += `  pecas: [\n`;
    obj.pecas.forEach((p: any, i: number) => {
      str += `    { nome: "${p.nome}", qtd: ${p.qtd}, valorUnitario: ${Number(p.valorUnitario).toFixed(2)} }${i === obj.pecas.length - 1 ? '' : ','}\n`;
    });
    str += `  ]\n}`;

    navigator.clipboard.writeText(str);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const toggleOcultarValores = () => {
    const novoEstado = !ocultarValoresServicos;
    setOcultarValoresServicos(novoEstado);
    localStorage.setItem('os_ocultar_valores', String(novoEstado));
  };

  const atualizarNoBanco = async () => {
    if (!dadosOS) return;
    setIsSaving(true);
    try {
      const payload = {
        numero_os: dadosOS.id,
        cliente: dadosOS.cliente,
        placa: dadosOS.placa,
        dados_json: { ...dadosOS, responsavel },
      };
      const { error } = await supabase.from('ordens_servico').update(payload).eq('id_interno', id);
      if (error) throw error;
      alert("Ordem de Serviço atualizada!");
      router.push('/dashboard');
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Funções de manipulação de campos
  const updateServico = (index: number, field: string, value: any) => {
    const novosServicos = [...dadosOS.servicos];
    novosServicos[index][field] = (field === 'descricao') ? value : Number(value);
    setDadosOS({ ...dadosOS, servicos: novosServicos });
  };
  const adicionarServico = () => setDadosOS({ ...dadosOS, servicos: [...dadosOS.servicos, { descricao: 'NOVO SERVIÇO', valor: 0 }] });
  const removerServico = (index: number) => setDadosOS({ ...dadosOS, servicos: dadosOS.servicos.filter((_: any, i: number) => i !== index) });
  
  const updatePeca = (index: number, field: string, value: any) => {
    const novasPecas = [...dadosOS.pecas];
    novasPecas[index][field] = (field === 'nome') ? value : Number(value);
    setDadosOS({ ...dadosOS, pecas: novasPecas });
  };
  const adicionarPeca = () => setDadosOS({ ...dadosOS, pecas: [...dadosOS.pecas, { nome: 'NOVA PEÇA', qtd: 1, valorUnitario: 0 }] });
  const removerPeca = (index: number) => setDadosOS({ ...dadosOS, pecas: dadosOS.pecas.filter((_: any, i: number) => i !== index) });
  
  const updateDadosGerais = (field: string, value: string) => setDadosOS({ ...dadosOS, [field]: value });

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="text-blue-500 animate-spin" size={32} />
    </div>
  );

  const totalProdutos = dadosOS?.pecas?.reduce((acc: number, p: any) => acc + (p.qtd * p.valorUnitario), 0) || 0;
  const totalServicos = dadosOS?.servicos?.reduce((acc: number, s: any) => acc + (s.valor || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-black font-sans overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 10mm; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}} />

      <div className="flex h-screen no-print">
        {/* LADO ESQUERDO: EDITOR */}
        <div className="w-[450px] border-r border-zinc-800 bg-zinc-900 flex flex-col p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 text-zinc-500">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[10px] uppercase font-bold hover:text-white transition">
               <ArrowLeft size={14}/> Dashboard
            </button>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Edição Ativa</span>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="space-y-2 mb-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl">
                  <label className="text-[7px] font-black uppercase text-blue-400 block mb-1">Responsável</label>
                  <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <label className="text-[7px] font-black uppercase text-emerald-400 block mb-1">Placa</label>
                  <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={dadosOS.placa} onChange={(e) => updateDadosGerais('placa', e.target.value)} />
                </div>
              </div>

              <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700 space-y-3">
                <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 pb-1" value={dadosOS.cliente} onChange={(e) => updateDadosGerais('cliente', e.target.value)} placeholder="CLIENTE" />
                <div className="grid grid-cols-4 gap-2">
                  <input className="col-span-3 bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 pb-1" value={dadosOS.cidade} onChange={(e) => updateDadosGerais('cidade', e.target.value)} placeholder="CIDADE" />
                  <input className="bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 pb-1 text-center" value={dadosOS.uf} maxLength={2} onChange={(e) => updateDadosGerais('uf', e.target.value)} placeholder="UF" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <input className="bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 pb-1" value={dadosOS.cnpj} onChange={(e) => updateDadosGerais('cnpj', e.target.value)} placeholder="CNPJ" />
                   <input className="bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 pb-1" value={dadosOS.veiculo} onChange={(e) => updateDadosGerais('veiculo', e.target.value)} placeholder="VEÍCULO" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
              <section>
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Serviços</p>
                  <button onClick={adicionarServico} className="p-1 text-white hover:bg-zinc-800 rounded"><Plus size={14}/></button>
                </div>
                <div className="space-y-2">
                  {dadosOS.servicos.map((s: any, i: number) => (
                    <div key={i} className="bg-zinc-800/40 p-2 rounded border border-zinc-800 relative group">
                      <button onClick={() => removerServico(i)} className="absolute right-1 top-1 text-zinc-600 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                      <textarea className="w-full bg-transparent text-white text-[10px] font-bold outline-none uppercase resize-none" rows={1} value={s.descricao} onChange={(e) => updateServico(i, 'descricao', e.target.value)} />
                      <input type="number" className="bg-transparent text-emerald-400 text-[10px] font-black outline-none w-20" value={s.valor} onChange={(e) => updateServico(i, 'valor', e.target.value)} />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Peças</p>
                  <button onClick={adicionarPeca} className="p-1 text-white hover:bg-zinc-800 rounded"><Plus size={14}/></button>
                </div>
                <div className="space-y-2">
                  {dadosOS.pecas.map((p: any, i: number) => (
                    <div key={i} className="bg-black/20 p-2 rounded border border-zinc-800 relative group">
                      <button onClick={() => removerPeca(i)} className="absolute right-1 top-1 text-zinc-600 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                      <input className="w-full bg-transparent text-white text-[10px] font-bold outline-none uppercase mb-1" value={p.nome} onChange={(e) => updatePeca(i, 'nome', e.target.value)} />
                      <div className="flex gap-4">
                        <input type="number" className="bg-transparent text-zinc-400 text-[9px] font-bold outline-none w-10" value={p.qtd} onChange={(e) => updatePeca(i, 'qtd', e.target.value)} />
                        <input type="number" className="bg-transparent text-zinc-400 text-[9px] font-bold outline-none w-20" value={p.valorUnitario} onChange={(e) => updatePeca(i, 'valorUnitario', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <button onClick={atualizarNoBanco} disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                <Save size={18}/> {isSaving ? 'A guardar...' : 'Guardar Alterações'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={copiarJSON} className="bg-zinc-800 border border-zinc-700 text-zinc-300 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-700 transition">
                  {copiado ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                  {copiado ? 'Copiado!' : 'Copiar Código'}
                </button>
                <button onClick={toggleOcultarValores} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition flex items-center justify-center gap-2 ${ocultarValoresServicos ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                  {ocultarValoresServicos ? <EyeOff size={14}/> : <Eye size={14}/>} {ocultarValoresServicos ? 'Valores Ocultos' : 'Mostrar Valores'}
                </button>
              </div>

              <button onClick={() => window.print()} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
                <Printer size={18}/> Imprimir OS
              </button>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: PREVIEW */}
        <div className="flex-1 bg-zinc-950 p-12 overflow-y-auto flex justify-center scrollbar-hide">
          {dadosOS && (
            <div className="w-[210mm] bg-white shadow-2xl h-fit">
               <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} ocultarValores={ocultarValoresServicos} responsavel={responsavel} />
            </div>
          )}
        </div>
      </div>

      <div className="hidden print:block bg-white print-area">
        {dadosOS && <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} ocultarValores={ocultarValoresServicos} responsavel={responsavel} />}
      </div>
    </div>
  );
}

function OSContent({ dadosOS, totalProdutos, totalServicos, ocultarValores, responsavel }: any) {
  return (
    <div className="p-12 text-black bg-white font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">GR AUTO PEÇAS LTDA</h2>
          <p className="text-[10px] font-bold mt-1">Arapiraca-AL | CNPJ: 51.415.349/0001-25</p>
        </div>
        <div className="text-right border-l-2 border-black pl-6">
          <h1 className="text-xl font-black uppercase italic">Nº {dadosOS.id}</h1>
          <p className="text-[10px] font-bold">{dadosOS.data} | {dadosOS.hora}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-[11px] border border-black p-4">
        <div>
          <p className="font-black text-[8px] text-zinc-400 uppercase">Cliente</p>
          <p className="font-bold text-sm uppercase">{dadosOS.cliente}</p>
          <p>{dadosOS.cidade} - {dadosOS.uf}</p>
        </div>
        <div className="uppercase">
          <p className="font-black text-[8px] text-zinc-400 uppercase">Veículo</p>
          <p className="font-bold text-sm">{dadosOS.veiculo}</p>
          <p>Placa: {dadosOS.placa}</p>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full text-[10px] border border-black">
          <thead className="bg-zinc-100 uppercase font-black text-[9px] border-b border-black">
            <tr><th className="p-2 text-left">Serviços Executados</th><th className="p-2 text-right">Subtotal</th></tr>
          </thead>
          <tbody>
            {dadosOS.servicos.map((s: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase italic">
                <td className="p-2">{s.descricao}</td>
                <td className="p-2 text-right font-bold">{ocultarValores ? "" : `R$ ${Number(s.valor).toFixed(2)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <table className="w-full text-[10px] border border-black">
          <thead className="bg-zinc-100 uppercase font-black text-[9px] border-b border-black">
            <tr><th className="p-2 text-left">Peças / Materiais</th><th className="p-2 text-center w-12">Qtd</th><th className="p-2 text-right w-24">Total</th></tr>
          </thead>
          <tbody>
            {dadosOS.pecas.map((p: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase italic">
                <td className="p-2">{p.nome}</td>
                <td className="p-2 text-center">{p.qtd}</td>
                <td className="p-2 text-right font-black">R$ {(p.qtd * p.valorUnitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 border-2 border-black p-4 text-right shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-bold uppercase flex justify-between">Peças: <span>R$ {totalProdutos.toFixed(2)}</span></p>
          <p className="text-[10px] font-bold uppercase flex justify-between border-b border-black pb-1">Mão de Obra: <span>R$ {totalServicos.toFixed(2)}</span></p>
          <p className="text-lg font-black uppercase flex justify-between pt-1">Total: <span>R$ {(totalProdutos + totalServicos).toFixed(2)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-20 text-center text-[9px] font-black uppercase">
        <div className="border-t-2 border-black pt-2">Responsável: {responsavel}</div>
        <div className="border-t-2 border-black pt-2">Assinatura do Cliente</div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">A carregar editor...</div>}>
      <EditarOSContent params={params} />
    </Suspense>
  );
}