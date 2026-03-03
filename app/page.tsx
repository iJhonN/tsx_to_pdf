'use client';

import React, { useState, useEffect } from 'react';
import { Printer, ClipboardList, Trash2, Plus, Eye, EyeOff, X, UserCog, CarFront, Wrench } from 'lucide-react';

export default function SistemaGeradorOS() {
  const [textoBruto, setTextoBruto] = useState<string>('');
  const [dadosOS, setDadosOS] = useState<any>(null);
  const [ocultarValoresServicos, setOcultarValoresServicos] = useState<boolean>(false);
  const [responsavel, setResponsavel] = useState<string>('Jamylle');

  useEffect(() => {
    if (textoBruto.trim().length > 10) {
      processarCodigoIA();
    }
  }, [textoBruto]);

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

      // Captura o bloco de serviços corretamente
      const servicoBlock = textoBruto.match(/servicos:\s*\[([\s\S]*?)\]/i);
      if (servicoBlock) {
        const regexS = /\{\s*descricao:\s*['"]([^'"]+)['"]\s*,\s*valor:\s*([\d.]+)\s*\}/gi;
        let m;
        while ((m = regexS.exec(servicoBlock[1])) !== null) {
          novosDados.servicos.push({ descricao: m[1].trim(), valor: Number(m[2]) });
        }
      }

      // Captura o bloco de peças
      const pecaBlock = textoBruto.match(/pecas:\s*\[([\s\S]*?)\]/i);
      if (pecaBlock) {
        const regexP = /\{\s*nome:\s*['"]([^'"]+)['"]\s*,\s*qtd:\s*(\d+)\s*,\s*valorUnitario:\s*([\d.]+)\s*\}/gi;
        let m;
        while ((m = regexP.exec(pecaBlock[1])) !== null) {
          novosDados.pecas.push({ nome: m[1].trim(), qtd: Number(m[2]), valorUnitario: Number(m[3]) });
        }
      }
      setDadosOS(novosDados);
    } catch (e) { console.error("Erro ao processar código colado"); }
  };

  const updatePeca = (index: number, field: string, value: any) => {
    const novasPecas = [...dadosOS.pecas];
    novasPecas[index][field] = (field === 'nome') ? value : Number(value);
    setDadosOS({ ...dadosOS, pecas: novasPecas });
  };

  const updateServico = (index: number, field: string, value: any) => {
    const novosServicos = [...dadosOS.servicos];
    novosServicos[index][field] = (field === 'descricao') ? value : Number(value);
    setDadosOS({ ...dadosOS, servicos: novosServicos });
  };

  const updateDadosGerais = (field: string, value: string) => {
    setDadosOS({ ...dadosOS, [field]: value });
  };

  const removerPeca = (index: number) => {
    const novasPecas = dadosOS.pecas.filter((_: any, i: number) => i !== index);
    setDadosOS({ ...dadosOS, pecas: novasPecas });
  };

  const adicionarPeca = () => {
    setDadosOS({ ...dadosOS, pecas: [...dadosOS.pecas, { nome: 'NOVA PEÇA', qtd: 1, valorUnitario: 0 }] });
  };

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
        {/* PAINEL LATERAL */}
        <div className="w-[450px] border-r border-zinc-800 bg-zinc-900 flex flex-col p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 text-zinc-500">
            <h1 className="text-[10px] font-black uppercase tracking-widest text-white/50">Painel GR Auto</h1>
            <button onClick={() => {setTextoBruto(''); setDadosOS(null);}}><Trash2 size={16}/></button>
          </div>

          {!dadosOS ? (
            <textarea
              className="flex-1 w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-400 font-mono outline-none focus:border-white transition-all resize-none"
              value={textoBruto}
              onChange={(e) => setTextoBruto(e.target.value)}
              placeholder="Cole o código aqui..."
            />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* CABEÇALHO RÁPIDO */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl">
                  <label className="text-[7px] font-black uppercase text-blue-400 block mb-1">Responsável</label>
                  <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <label className="text-[7px] font-black uppercase text-emerald-400 block mb-1">Placa</label>
                  <input className="w-full bg-transparent text-white text-[11px] font-bold outline-none uppercase" value={dadosOS.placa} onChange={(e) => updateDadosGerais('placa', e.target.value)} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                {/* SEÇÃO DE SERVIÇOS */}
                <section>
                  <p className="text-[10px] font-black uppercase text-zinc-500 mb-3 flex items-center gap-2 border-b border-zinc-800 pb-1">
                    <Wrench size={12}/> Serviços Executados
                  </p>
                  <div className="space-y-3">
                    {dadosOS.servicos.map((s: any, i: number) => (
                      <div key={i} className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-xl">
                        <textarea 
                          className="w-full bg-transparent text-white text-[10px] font-bold outline-none uppercase resize-none mb-1" 
                          rows={2}
                          value={s.descricao} 
                          onChange={(e) => updateServico(i, 'descricao', e.target.value)} 
                        />
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="text-[9px] font-black italic">R$</span>
                          <input 
                            type="number" 
                            className="bg-transparent text-[11px] font-black outline-none w-full" 
                            value={s.valor} 
                            onChange={(e) => updateServico(i, 'valor', e.target.value)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SEÇÃO DE PEÇAS */}
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
                          <div className="flex-1">
                            <label className="text-[7px] text-zinc-600 font-black uppercase block">Qtd</label>
                            <input type="number" className="w-full bg-transparent text-white text-[10px] outline-none font-bold" value={p.qtd} onChange={(e) => updatePeca(i, 'qtd', e.target.value)} />
                          </div>
                          <div className="flex-1">
                            <label className="text-[7px] text-zinc-600 font-black uppercase block">Preço Unit.</label>
                            <input type="number" className="w-full bg-transparent text-white text-[10px] outline-none font-bold" value={p.valorUnitario} onChange={(e) => updatePeca(i, 'valorUnitario', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                <button 
                  onClick={() => setOcultarValoresServicos(!ocultarValoresServicos)} 
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${ocultarValoresServicos ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                >
                  {ocultarValoresServicos ? 'Valores Serviços Ocultos' : 'Ocultar Valores Serviços'}
                </button>
                <button onClick={() => window.print()} className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-200 shadow-xl transition-all">
                  <Printer size={18}/> Imprimir OS Completa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ÁREA DE PRÉ-VISUALIZAÇÃO */}
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

function OSContent({ dadosOS, totalProdutos, totalServicos, ocultarValores, responsavel }: any) {
  return (
    <div className="p-12 text-black bg-white font-sans h-auto">
      {/* CABEÇALHO */}
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

      {/* DADOS CLIENTE / VEÍCULO */}
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

      {/* TABELA DE SERVIÇOS */}
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

      {/* TABELA DE PEÇAS */}
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

      {/* RESUMO DE VALORES */}
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

      {/* ASSINATURAS */}
      <div className="grid grid-cols-2 gap-12 mt-20 text-center text-[9px] font-black uppercase">
        <div className="border-t-2 border-black pt-2">Responsável: {responsavel}</div>
        <div className="border-t-2 border-black pt-2">Assinatura do Cliente</div>
      </div>
    </div>
  );
}