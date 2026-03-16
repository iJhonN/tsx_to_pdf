'use client';

// Força a renderização dinâmica para evitar erro de build na Vercel
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { Printer, ClipboardList, Trash2, Plus, X, Wrench, Building2, CarFront, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

function SistemaOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const osIdFromUrl = searchParams.get('edit');

  const [textoBruto, setTextoBruto] = useState<string>('');
  const [dadosOS, setDadosOS] = useState<any>(null);
  const [ocultarValoresServicos, setOcultarValoresServicos] = useState<boolean>(false);
  const [responsavel, setResponsavel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- TRAVA DE SEGURANÇA: VERIFICA SE ESTÁ LOGADO ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Se não houver usuário, manda para o login (ajuste a rota se for diferente)
        router.push('/login'); 
      } else {
        setLoadingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    if (osIdFromUrl && !loadingAuth) {
      const carregarDadosDB = async () => {
        const { data, error } = await supabase
          .from('ordens_servico')
          .select('*')
          .eq('id_interno', osIdFromUrl)
          .single();

        if (data && !error) {
          setDadosOS(data.dados_json);
          setResponsavel(data.dados_json.responsavel || '');
        }
      };
      carregarDadosDB();
    }
  }, [osIdFromUrl, loadingAuth]);

  // Se estiver verificando o login, mostra um loading para não vazar o conteúdo
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
          Verificando Acesso...
        </div>
      </div>
    );
  }

  // --- RESTO DA SUA LÓGICA ORIGINAL ---

  const processarCodigoIA = () => {
    try {
      const extract = (regex: RegExp, fallback = '') => {
        const match = textoBruto.match(regex);
        return match ? match[1].trim() : fallback;
      };

      const novosDados: any = {
        id: extract(/id:\s*['"]([^'"]+)['"]/i),
        data: extract(/data:\s*['"]([^'"]+)['"]/i),
        hora: extract(/hora:\s*['"]([^'"]+)['"]/i),
        cliente: extract(/cliente:\s*['"]([^'"]+)['"]/i),
        cnpj: extract(/cnpj:\s*['"]([^'"]*)['"]/i),
        cidade: extract(/cidade:\s*['"]([^'"]+)['"]/i),
        uf: extract(/uf:\s*['"]([^'"]+)['"]/i),
        endereco: extract(/endereco:\s*['"]([^'"]*)['"]/i),
        veiculo: extract(/veiculo:\s*['"]([^'"]+)['"]/i),
        marca: extract(/marca:\s*['"]([^'"]+)['"]/i),
        placa: extract(/placa:\s*['"]([^'"]+)['"]/i),
        mecanico: extract(/mecanico:\s*['"]([^'"]+)['"]/i),
        servicos: [],
        pecas: []
      };

      const servicoBlock = textoBruto.match(/servicos:\s*\[([\s\S]*?)\]/i);
      if (servicoBlock) {
        const regexS = /\{\s*descricao:\s*['"]([^'"]+)['"]\s*,\s*valor:\s*([\d.]+)\s*\}/gi;
        let m; while ((m = regexS.exec(servicoBlock[1])) !== null) {
          novosDados.servicos.push({ descricao: m[1].trim(), valor: Number(m[2]) });
        }
      }

      const pecaBlock = textoBruto.match(/pecas:\s*\[([\s\S]*?)\]/i);
      if (pecaBlock) {
        const regexP = /\{\s*nome:\s*['"]([^'"]+)['"]\s*,\s*qtd:\s*(\d+)\s*,\s*valorUnitario:\s*([\d.]+)\s*\}/gi;
        let m; while ((m = regexP.exec(pecaBlock[1])) !== null) {
          novosDados.pecas.push({ nome: m[1].trim(), qtd: Number(m[2]), valorUnitario: Number(m[3]) });
        }
      }
      setDadosOS(novosDados);
    } catch (e) { console.error("Erro ao processar"); }
  };

  const salvarNoBanco = async () => {
    if (!dadosOS) return;
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      const jsonParaSalvar = { ...dadosOS, responsavel };
      const payload = {
        id_interno: osIdFromUrl || undefined,
        numero_os: dadosOS.id,
        cliente: dadosOS.cliente,
        placa: dadosOS.placa,
        data_os: new Date().toISOString().split('T')[0],
        dados_json: jsonParaSalvar,
        user_id: user.id 
      };

      const { error } = await supabase.from('ordens_servico').upsert(payload);
      
      if (error) {
        alert("Erro ao salvar: " + error.message);
      } else {
        alert(osIdFromUrl ? "OS Atualizada!" : "OS Salva no Banco!");
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Funções de update/add/remove (Mantidas iguais)
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

  const totalProdutos = dadosOS?.pecas?.reduce((acc: number, p: any) => acc + (p.qtd * p.valorUnitario), 0) || 0;
  const totalServicos = dadosOS?.servicos?.reduce((acc: number, s: any) => acc + (s.valor || 0), 0) || 0;

  useEffect(() => {
    if (textoBruto.trim().length > 10) {
      processarCodigoIA();
    }
  }, [textoBruto]);

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
        {/* Painel Lateral */}
        <div className="w-[450px] border-r border-zinc-800 bg-zinc-900 flex flex-col p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 text-zinc-500">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[10px] uppercase font-bold hover:text-white transition">
               <ArrowLeft size={14}/> Dashboard
            </button>
            <button onClick={() => {setTextoBruto(''); setDadosOS(null); router.push('/');}}><Trash2 size={16}/></button>
          </div>

          {!dadosOS ? (
            <textarea
              className="flex-1 w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-400 font-mono outline-none focus:border-white transition-all resize-none"
              value={textoBruto}
              onChange={(e) => setTextoBruto(e.target.value)}
              placeholder="Cole o código gerado pela IA aqui..."
            />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="space-y-2 mb-6">
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl">
                    <label className="text-[7px] font-black uppercase text-blue-400 block mb-1 tracking-tighter">Responsável</label>
                    <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                    <label className="text-[7px] font-black uppercase text-emerald-400 block mb-1 tracking-tighter">Placa</label>
                    <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={dadosOS.placa} onChange={(e) => updateDadosGerais('placa', e.target.value)} />
                  </div>
                </div>

                <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700 space-y-3">
                  <div>
                    <label className="text-[7px] font-black uppercase text-zinc-500 flex items-center gap-1 mb-1"><Building2 size={10}/> Cliente / Secretaria</label>
                    <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 focus:border-white pb-1" value={dadosOS.cliente} onChange={(e) => updateDadosGerais('cliente', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[7px] font-black uppercase text-zinc-500 flex items-center gap-1 mb-1"><CarFront size={10}/> Marca</label>
                      <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 focus:border-white pb-1" value={dadosOS.marca} onChange={(e) => updateDadosGerais('marca', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[7px] font-black uppercase text-zinc-500 flex items-center gap-1 mb-1"><CarFront size={10}/> Veículo / Modelo</label>
                      <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase border-b border-zinc-700 focus:border-white pb-1" value={dadosOS.veiculo} onChange={(e) => updateDadosGerais('veiculo', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                <section>
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                      <Wrench size={12}/> Serviços Executados
                    </p>
                    <button onClick={adicionarServico} className="bg-white text-black p-1 rounded hover:bg-zinc-200 transition-colors">
                      <Plus size={12}/>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dadosOS.servicos.map((s: any, i: number) => (
                      <div key={i} className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-xl relative group">
                        <button onClick={() => removerServico(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={14}/>
                        </button>
                        <textarea className="w-full bg-transparent text-white text-[10px] font-bold outline-none uppercase resize-none mb-1 pr-6" rows={2} value={s.descricao} onChange={(e) => updateServico(i, 'descricao', e.target.value)} />
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="text-[9px] font-black italic">R$</span>
                          <input type="number" className="bg-transparent text-[11px] font-black outline-none w-full" value={s.valor} onChange={(e) => updateServico(i, 'valor', e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                      <ClipboardList size={12}/> Peças e Materiais
                    </p>
                    <button onClick={adicionarPeca} className="bg-white text-black p-1 rounded hover:bg-zinc-200 transition-colors">
                      <Plus size={12}/>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dadosOS.pecas.map((p: any, i: number) => (
                      <div key={i} className="bg-black/30 border border-zinc-800 p-3 rounded-xl relative group">
                        <button onClick={() => removerPeca(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={14}/>
                        </button>
                        <input className="w-full bg-transparent text-white text-[10px] font-bold outline-none uppercase mb-2 pr-6" value={p.nome} onChange={(e) => updatePeca(i, 'nome', e.target.value)} />
                        <div className="flex gap-4">
                          <div className="flex-1"><label className="text-[7px] text-zinc-600 font-black uppercase block">Qtd</label><input type="number" className="w-full bg-transparent text-white text-[10px] outline-none font-bold" value={p.qtd} onChange={(e) => updatePeca(i, 'qtd', e.target.value)} /></div>
                          <div className="flex-1"><label className="text-[7px] text-zinc-600 font-black uppercase block">Unit.</label><input type="number" className="w-full bg-transparent text-white text-[10px] outline-none font-bold" value={p.valorUnitario} onChange={(e) => updatePeca(i, 'valorUnitario', e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                <button 
                  onClick={salvarNoBanco} 
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl transition-all disabled:opacity-50"
                >
                   <Save size={18}/> {isSaving ? 'Salvando...' : osIdFromUrl ? 'Atualizar OS' : 'Salvar OS no Banco'}
                </button>
                <button onClick={() => setOcultarValoresServicos(!ocultarValoresServicos)} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${ocultarValoresServicos ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {ocultarValoresServicos ? 'Valores Serviços Ocultos' : 'Ocultar Valores Serviços'}
                </button>
                <button onClick={() => window.print()} className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-200 shadow-xl">
                  <Printer size={18}/> Imprimir OS
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visualização da OS */}
        <div className="flex-1 bg-zinc-950 p-12 overflow-y-auto flex justify-center scrollbar-hide">
          {dadosOS ? (
            <div className="w-[210mm] bg-white shadow-2xl h-fit mb-10">
               <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} ocultarValores={ocultarValoresServicos} responsavel={responsavel} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-800 opacity-20"><ClipboardList size={100}/></div>
          )}
        </div>
      </div>

      <div className="hidden print:block bg-white print-area">
        {dadosOS && <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} ocultarValores={ocultarValoresServicos} responsavel={responsavel} />}
      </div>
    </div>
  );
}

// Componente da OS (Visualização para Impressão)
function OSContent({ dadosOS, totalProdutos, totalServicos, ocultarValores, responsavel }: any) {
  return (
    <div className="p-12 text-black bg-white font-sans h-auto">
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">GR AUTO PEÇAS LTDA</h2>
          <div className="text-[10px] font-bold mt-2 leading-tight">
            <p>Rua Coronel Vicente Ramos, 1552 - Olho d'água dos Cazuzinhas</p>
            <p>Arapiraca-AL | CEP: 57304-403</p>
            <p>CNPJ: 51.415.349/0001-25</p>
            <p>E-mail: grautopecas06@gmail.com | Tel: (82) 99612-8411</p>
          </div>
        </div>
        <div className="text-right border-l-2 border-black pl-6 font-black uppercase">
          <h1 className="text-xl leading-none">Ordem de Serviço</h1>
          <p className="text-4xl italic mt-1 leading-none tracking-tighter">Nº {dadosOS.id}</p>
          <p className="text-[10px] mt-2 font-bold tracking-tight">Data: {dadosOS.data} | {dadosOS.hora}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-[11px]">
        <div className="border border-black p-4 space-y-1">
          <p className="font-black border-b border-black mb-1 uppercase text-[8px] text-zinc-500">Dados do Cliente</p>
          <p className="font-bold text-sm uppercase">{dadosOS.cliente}</p>
          <p><span className="font-black">CNPJ/CPF:</span> {dadosOS.cnpj}</p>
          <p><span className="font-black">Cidade:</span> {dadosOS.cidade} - {dadosOS.uf}</p>
        </div>
        <div className="border border-black p-4 space-y-1 uppercase">
          <p className="font-black border-b border-black mb-1 uppercase text-[8px] text-zinc-500">Dados do Veículo</p>
          <p className="font-bold text-sm leading-none mb-1">{dadosOS.marca} {dadosOS.veiculo}</p>
          <p><span className="font-black">Placa:</span> {dadosOS.placa}</p>
          <p><span className="font-black">Mecânico:</span> {dadosOS.mecanico}</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-black uppercase text-[10px] mb-2 border-l-4 border-black pl-2">Serviços Executados</p>
        <table className="w-full text-[10px] border border-black">
          <thead>
            <tr className="border-b border-black bg-zinc-100 uppercase font-black text-[9px]">
              <th className="p-2 text-left">Descrição do Serviço</th>
              <th className="p-2 text-right w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {dadosOS.servicos.map((s: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase">
                <td className="p-2 whitespace-pre-wrap">{s.descricao}</td>
                <td className="p-2 text-right font-bold italic">
                  {ocultarValores ? "" : `R$ ${Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <p className="font-black uppercase text-[10px] mb-2 border-l-4 border-black pl-2">Peças e Materiais</p>
        <table className="w-full text-[10px] border border-black">
          <thead>
            <tr className="border-b border-black bg-zinc-100 uppercase font-black text-[9px]">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 w-12 text-center">Qtd</th>
              <th className="p-2 w-28 text-right">V. Unit</th>
              <th className="p-2 w-28 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {dadosOS.pecas.map((p: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase">
                <td className="p-2">{p.nome}</td>
                <td className="p-2 text-center font-bold text-sm">{p.qtd}</td>
                <td className="p-2 text-right">R$ {Number(p.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-black italic">R$ {(p.qtd * p.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-80 border-2 border-black p-4 text-right space-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between"><span>Total Peças:</span><span>R$ {totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between border-b border-zinc-300 pb-1"><span>Mão de Obra:</span><span>R$ {totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
          <p className="text-lg font-black uppercase pt-1 flex justify-between items-center">
            <span className="text-xs">Valor Total:</span>
            <span>R$ {(totalProdutos + totalServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-20 text-center text-[9px] font-black uppercase">
        <div className="border-t-2 border-black pt-2">Responsável: {responsavel}</div>
        <div className="border-t-2 border-black pt-2">Assinatura do Cliente</div>
      </div>
    </div>
  );
}

export default function SistemaGeradorOS() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest animate-pulse">Iniciando...</div>}>
      <SistemaOSContent />
    </Suspense>
  );
}