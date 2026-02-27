'use client';

import React, { useState, useEffect } from 'react';
import { Printer, ClipboardList, Trash2, Edit3, Code, Layout, Eye, EyeOff } from 'lucide-react';

export default function SistemaTriplePainel() {
  const [textoBruto, setTextoBruto] = useState<string>('');
  const [dadosOS, setDadosOS] = useState<any>(null);
  const [mostrarItens, setMostrarItens] = useState<boolean>(true); // Controle de visibilidade

  useEffect(() => {
    if (textoBruto.trim().length > 10) {
      processarCodigoIA();
    }
  }, [textoBruto]);

  const processarCodigoIA = () => {
    try {
      const extract = (regex: RegExp, fallback = '') => {
        const match = textoBruto.match(regex);
        return match ? match[1] : fallback;
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
        chegada: extract(/chegada:\s*['"]([^'"]*)['"]/i),
        servicos: [],
        pecas: []
      };

      const servicoBlock = textoBruto.match(/servicos:\s*\[([\s\S]*?)\]/i);
      if (servicoBlock) {
        const itens = servicoBlock[1].match(/\{[\s\S]*?\}/g);
        itens?.forEach(item => {
          const desc = item.match(/descricao:\s*['"]([\s\S]*?)['"]/i);
          const val = item.match(/valor:\s*([\d.]+)/i);
          if (desc && val) novosDados.servicos.push({ descricao: desc[1].trim(), valor: Number(val[1]) });
        });
      }

      const pecaBlock = textoBruto.match(/pecas:\s*\[([\s\S]*?)\]/i);
      if (pecaBlock) {
        const itens = pecaBlock[1].match(/\{[\s\S]*?\}/g);
        itens?.forEach(item => {
          const nome = item.match(/nome:\s*['"]([\s\S]*?)['"]/i);
          const qtd = item.match(/qtd:\s*(\d+)/i);
          const val = item.match(/valorUnitario:\s*([\d.]+)/i);
          if (nome && qtd && val) novosDados.pecas.push({ nome: nome[1].trim(), qtd: Number(qtd[1]), valorUnitario: Number(val[1]) });
        });
      }
      setDadosOS(novosDados);
    } catch (e) { console.error("Erro ao processar código"); }
  };

  const handleEdit = (campo: string, valor: any) => {
    setDadosOS({ ...dadosOS, [campo]: valor });
  };

  const totalProdutos = dadosOS?.pecas?.reduce((acc: number, p: any) => acc + (p.qtd * p.valorUnitario), 0) || 0;
  const totalServicos = dadosOS?.servicos?.reduce((acc: number, s: any) => acc + (s.valor || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-black">
      <div className="flex h-screen print:hidden">
        
        {/* COLUNA ESQUERDA: EDITOR */}
        <div className="w-[450px] border-r border-zinc-800 bg-zinc-900/50 flex flex-col p-6 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between text-white mb-6">
            <h1 className="text-xs font-black uppercase tracking-widest text-zinc-400">Painel GR Auto</h1>
            <button onClick={() => {setTextoBruto(''); setDadosOS(null);}} className="text-zinc-600 hover:text-red-400"><Trash2 size={18}/></button>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-2 italic">
              <Code size={14}/> 1. Cole o Código da IA
            </label>
            <textarea
              className="w-full h-24 bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] text-zinc-400 font-mono outline-none focus:border-white transition-all"
              value={textoBruto}
              onChange={(e) => setTextoBruto(e.target.value)}
              placeholder="Cole aqui..."
            />
          </div>

          {dadosOS && (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
              <div className="border-t border-zinc-800 pt-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-widest">
                  <Edit3 size={14}/> 2. Editor de Cabeçalho
                </label>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputOS label="Nº OS" value={dadosOS.id} onChange={(v: string) => handleEdit('id', v)} />
                  <InputOS label="Data" value={dadosOS.data} onChange={(v: string) => handleEdit('data', v)} />
                </div>
                <InputOS label="Cliente" value={dadosOS.cliente} onChange={(v: string) => handleEdit('cliente', v)} />
                <InputOS label="Endereço" value={dadosOS.endereco} onChange={(v: string) => handleEdit('endereco', v)} />
              </div>

              {/* BOTÃO PARA OCULTAR/MOSTRAR ITENS */}
              <button 
                onClick={() => setMostrarItens(!mostrarItens)}
                className="flex items-center justify-between w-full bg-zinc-800/50 hover:bg-zinc-800 p-3 rounded-xl border border-zinc-700 transition-all group"
              >
                <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white transition-colors flex items-center gap-2">
                  {mostrarItens ? <EyeOff size={14} /> : <Eye size={14} />} 
                  {mostrarItens ? 'Ocultar Itens Detalhados' : 'Mostrar Serviços e Peças'}
                </span>
                <span className="text-[9px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                  {dadosOS.servicos.length + dadosOS.pecas.length} itens
                </span>
              </button>

              {/* EDITOR DE SERVIÇOS E PEÇAS (CONDICIONAL) */}
              {mostrarItens && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800">
                    <span className="text-[9px] font-black uppercase text-zinc-500 block mb-3 underline">Serviços</span>
                    {dadosOS.servicos.map((s: any, i: number) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input className="bg-zinc-800 border-zinc-700 rounded-lg p-2 text-[10px] text-white flex-1 outline-none" value={s.descricao} onChange={(e) => {
                          const novos = [...dadosOS.servicos]; novos[i].descricao = e.target.value; handleEdit('servicos', novos);
                        }} />
                        <input className="bg-zinc-800 border-zinc-700 rounded-lg p-2 text-[10px] text-white w-20 outline-none" type="number" value={s.valor} onChange={(e) => {
                          const novos = [...dadosOS.servicos]; novos[i].valor = Number(e.target.value); handleEdit('servicos', novos);
                        }} />
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800">
                    <span className="text-[9px] font-black uppercase text-zinc-500 block mb-3 underline">Peças</span>
                    {dadosOS.pecas.map((p: any, i: number) => (
                      <div key={i} className="flex gap-2 mb-2 items-center">
                        <input className="bg-zinc-800 border-zinc-700 rounded-lg p-2 text-[10px] text-white flex-1 outline-none" value={p.nome} onChange={(e) => {
                          const novos = [...dadosOS.pecas]; novos[i].nome = e.target.value; handleEdit('pecas', novos);
                        }} />
                        <input className="bg-zinc-800 border-zinc-700 rounded-lg p-2 text-[10px] text-white w-10 text-center outline-none" type="number" value={p.qtd} onChange={(e) => {
                          const novos = [...dadosOS.pecas]; novos[i].qtd = Number(e.target.value); handleEdit('pecas', novos);
                        }} />
                        <input className="bg-zinc-800 border-zinc-700 rounded-lg p-2 text-[10px] text-white w-16 outline-none" type="number" value={p.valorUnitario} onChange={(e) => {
                          const novos = [...dadosOS.pecas]; novos[i].valorUnitario = Number(e.target.value); handleEdit('pecas', novos);
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => window.print()} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase text-[11px] flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all">
                <Printer size={18}/> Imprimir Agora
              </button>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: PREVIEW */}
        <div className="flex-1 bg-zinc-950 p-12 overflow-y-auto flex justify-center scrollbar-hide">
          {dadosOS ? (
            <div className="w-[210mm] bg-white shadow-2xl h-fit min-h-[297mm]">
               <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-800 opacity-20"><ClipboardList size={100}/></div>
          )}
        </div>
      </div>

      <div className="hidden print:block bg-white">{dadosOS && <OSContent dadosOS={dadosOS} totalProdutos={totalProdutos} totalServicos={totalServicos} />}</div>
    </div>
  );
}

// Subcomponentes auxiliares mantidos conforme versão anterior...
function InputOS({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-400 transition-all" />
    </div>
  );
}

function OSContent({ dadosOS, totalProdutos, totalServicos }: any) {
  return (
    <div className="p-12 text-black font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">GR AUTO PEÇAS LTDA</h2>
          <p className="text-[10px] font-bold mt-2">Rua Coronel Vicente Ramos, 1552 - Arapiraca-AL<br />CNPJ: 51.415.349/0001-25</p>
        </div>
        <div className="text-right border-l-2 border-black pl-6 font-black uppercase">
          <h1 className="text-xl leading-none">Ordem de Serviço</h1>
          <p className="text-4xl italic mt-1 leading-none">Nº {dadosOS.id}</p>
          <p className="text-[10px] mt-2 font-bold uppercase tracking-tight">Data: {dadosOS.data} | {dadosOS.hora}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 text-[11px]">
        <div className="border border-black p-4 space-y-1">
          <p className="font-black border-b border-black mb-1 uppercase text-[9px]">Cliente</p>
          <p className="font-bold text-sm uppercase">{dadosOS.cliente}</p>
          <p><span className="font-black">CNPJ:</span> {dadosOS.cnpj}</p>
          <p><span className="font-black uppercase">Cidade:</span> {dadosOS.cidade} - {dadosOS.uf}</p>
          <p><span className="font-black uppercase text-[9px]">Endereço:</span> {dadosOS.endereco}</p>
        </div>
        <div className="border border-black p-4 space-y-1 uppercase text-[10px]">
          <p className="font-black border-b border-black mb-1 uppercase text-[9px]">Veículo</p>
          <p><span className="font-black uppercase text-[9px]">Marca:</span> {dadosOS.marca}</p>
          <p><span className="font-black uppercase text-[9px]">Veículo:</span> {dadosOS.veiculo}</p>
          <p><span className="font-black uppercase text-[9px]">Placa:</span> {dadosOS.placa}</p>
          <p><span className="font-black uppercase text-[9px]">Mecânico:</span> {dadosOS.mecanico}</p>
        </div>
      </div>

      <div className="mb-8 font-medium">
        <p className="font-black uppercase text-[10px] mb-2 border-l-2 border-black pl-2">Serviços Executados</p>
        <table className="w-full text-[10px] border border-black">
          <thead><tr className="border-b border-black bg-zinc-50 uppercase font-black"><th className="p-2 text-left">Descrição</th><th className="p-2 text-right w-32">Subtotal</th></tr></thead>
          <tbody>
            {dadosOS.servicos.map((s: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase">
                <td className="p-2">{s.descricao}</td>
                <td className="p-2 text-right font-black italic">R$ {Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8 font-medium">
        <p className="font-black uppercase text-[10px] mb-2 border-l-2 border-black pl-2">Peças e Materiais</p>
        <table className="w-full text-[10px] border border-black">
          <thead><tr className="border-b border-black bg-zinc-50 uppercase font-black"><th className="p-2 text-left">Item</th><th className="p-2 w-16 text-center">Qtd</th><th className="p-2 w-32 text-right">Total</th></tr></thead>
          <tbody>
            {dadosOS.pecas.map((p: any, i: number) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 uppercase">
                <td className="p-2">{p.nome}</td>
                <td className="p-2 text-center font-bold">{p.qtd}</td>
                <td className="p-2 text-right font-black italic">R$ {(p.qtd * p.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-12 break-inside-avoid">
        <div className="w-72 border-2 border-black p-4 text-right space-y-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Peças: R$ {totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase pb-1">Mão de Obra: R$ {totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-base font-black uppercase border-t border-black pt-2">Total: R$ {(totalProdutos + totalServicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-20 text-center text-[9px] font-black uppercase">
        <div className="border-t border-black pt-2">Responsável: Jamylle</div>
        <div className="border-t border-black pt-2">Assinatura do Cliente</div>
      </div>
    </div>
  );
}