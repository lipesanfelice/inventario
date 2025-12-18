import React, { useEffect, useState } from 'react';
import { getTransactions, getSectors, atualizarMovimentacao, excluirMovimentacao } from '../services/storage';
import { Transaction, Sector, TransactionType, ItemCategory } from '../types';
import { Search, Filter, ArrowUpCircle, ArrowDownCircle, Package, Tag, Printer, Loader2, Pencil, Trash2, Save, X } from 'lucide-react';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [transacaoEditando, setTransacaoEditando] = useState<Transaction | null>(null);
  const [processando, setProcessando] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        const [movimentacoesCarregadas, setoresCarregados] = await Promise.all([
          getTransactions(),
          getSectors()
        ]);
        setTransactions(movimentacoesCarregadas);
        setSectors(setoresCarregados);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, []);

  const transacoesFiltradas = transactions.filter(t => {
    const termo = searchTerm.toLowerCase();
    const matchesSearch =
      t.description.toLowerCase().includes(termo) ||
      (t.assetId && t.assetId.toString().includes(searchTerm));
    const matchesSector = filterSector ? String(t.sectorId) === filterSector : true;
    const matchesType = filterType !== 'ALL' ? t.type === filterType : true;
    const matchesDate = filterDate ? t.date === filterDate : true;
    return matchesSearch && matchesSector && matchesType && matchesDate;
  });

  const handlePrint = () => {
    window.print();
  };

  const iniciarEdicao = (transacao: Transaction) => {
    setIdEditando(transacao.id);
    setTransacaoEditando({ ...transacao });
  };

  const cancelarEdicao = () => {
    setIdEditando(null);
    setTransacaoEditando(null);
  };

  const salvarEdicao = async () => {
    if (!transacaoEditando) return;
    try {
      setProcessando(true);
      await atualizarMovimentacao(transacaoEditando);
      setTransactions(anterior =>
        anterior.map(t => (t.id === transacaoEditando.id ? transacaoEditando : t))
      );
      cancelarEdicao();
    } catch (erro) {
      console.error('Erro ao atualizar movimentação:', erro);
    } finally {
      setProcessando(false);
    }
  };

  const removerTransacao = async (id: string) => {
    const confirmar = window.confirm('Deseja realmente excluir esta movimentação?');
    if (!confirmar) return;
    try {
      setProcessando(true);
      await excluirMovimentacao(id);
      setTransactions(anterior => anterior.filter(t => t.id !== id));
      if (idEditando === id) {
        cancelarEdicao();
      }
    } catch (erro) {
      console.error('Erro ao excluir movimentação:', erro);
    } finally {
      setProcessando(false);
    }
  };

  const atualizarCampoEdicao = (campo: keyof Transaction, valor: any) => {
    setTransacaoEditando(atual =>
      atual ? { ...atual, [campo]: valor } : atual
    );
  };

  const handleChangeSetorEdicao = (valorId: string) => {
    const setorSelecionado = sectors.find(s => String(s.id) === valorId);
    if (!setorSelecionado) {
      atualizarCampoEdicao('sectorId', valorId);
      return;
    }
    setTransacaoEditando(atual =>
      atual
        ? {
            ...atual,
            sectorId: String(setorSelecionado.id),
            sectorName: setorSelecionado.name
          }
        : atual
    );
  };

  return (
    <div className="space-y-6 print:space-y-2">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Movimentações</h1>
          <p className="text-gray-500">Visualize, edite e gerencie as entradas e saídas registradas no banco de dados.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border shadow-sm">
            Total: <span className="font-bold text-gray-900">{transacoesFiltradas.length}</span>
          </div>
          <button
            onClick={handlePrint}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </button>
        </div>
      </header>

      <div className="hidden print:block mb-4 border-b pb-2">
        <h1 className="text-2xl font-bold text-black">Relatório de Controle de Inventário</h1>
        <p className="text-sm text-gray-600">
          Gerado em: {new Date().toLocaleString('pt-BR')} | Registros listados: {transacoesFiltradas.length}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar descrição ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg bg-white text-gray-900"
          >
            <option value="">Todos os Setores</option>
            {sectors.map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg bg-white text-gray-900"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value={TransactionType.IN}>Entradas</option>
            <option value={TransactionType.OUT}>Saídas</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="min-w-full divide-y divide-gray-200 print:text-sm">
            <thead className="bg-gray-50 print:bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Setor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Qtd / Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                      <p>Carregando dados do banco...</p>
                    </div>
                  </td>
                </tr>
              ) : transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="w-8 h-8 text-gray-300" />
                      <p>Nenhum registro encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((t) => {
                  const emEdicao = idEditando === t.id;
                  const dados = emEdicao && transacaoEditando ? transacaoEditando : t;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {emEdicao ? (
                          <select
                            value={dados.type}
                            onChange={e => atualizarCampoEdicao('type', e.target.value as TransactionType)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={TransactionType.IN}>Entrada</option>
                            <option value={TransactionType.OUT}>Saída</option>
                          </select>
                        ) : dados.type === TransactionType.IN ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1 print:bg-transparent print:text-black print:border print:border-gray-300">
                            <ArrowDownCircle className="w-3 h-3 print:hidden" /> 
                            <span className="print:hidden">Entrada</span>
                            <span className="hidden print:inline">ENTRADA</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 gap-1 print:bg-transparent print:text-black print:border print:border-gray-300">
                            <ArrowUpCircle className="w-3 h-3 print:hidden" /> 
                            <span className="print:hidden">Saída</span>
                            <span className="hidden print:inline">SAÍDA</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">
                        {emEdicao ? (
                          <input
                            type="date"
                            value={dados.date}
                            onChange={e => atualizarCampoEdicao('date', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 print:text-black">
                        {emEdicao ? (
                          <select
                            value={dados.sectorId ? String(dados.sectorId) : ''}
                            onChange={e => handleChangeSetorEdicao(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm max-w-xs"
                          >
                            <option value="">Selecione um setor</option>
                            {sectors.map(s => (
                              <option key={s.id} value={String(s.id)}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          dados.sectorName
                        )}
                      </td>

                      <td
                        className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate print:max-w-none print:whitespace-normal print:text-black"
                        title={dados.description}
                      >
                        {emEdicao ? (
                          <input
                            type="text"
                            value={dados.description}
                            onChange={e => atualizarCampoEdicao('description', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          dados.description
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">
                        {emEdicao ? (
                          <select
                            value={dados.category}
                            onChange={e => atualizarCampoEdicao('category', e.target.value as ItemCategory)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={ItemCategory.ASSET}>Patrimônio</option>
                            <option value={ItemCategory.CARGO}>Carga</option>
                          </select>
                        ) : dados.category === ItemCategory.ASSET ? (
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-blue-500 print:hidden" />
                            <span>Patrimônio</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-amber-500 print:hidden" />
                            <span>Carga</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium print:text-black">
                        {dados.category === ItemCategory.ASSET ? (
                          emEdicao ? (
                            <input
                              type="text"
                              value={dados.assetId ?? ''}
                              onChange={e => atualizarCampoEdicao('assetId', e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                            />
                          ) : (
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 print:bg-transparent print:border-none print:p-0">
                              #{dados.assetId}
                            </span>
                          )
                        ) : emEdicao ? (
                          <input
                            type="number"
                            value={dados.quantity}
                            onChange={e => atualizarCampoEdicao('quantity', Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          />
                        ) : (
                          <span>{dados.quantity} un.</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:hidden">
                        {emEdicao ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={salvarEdicao}
                              disabled={processando}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <Save className="w-4 h-4" />
                              Salvar
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              disabled={processando}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 disabled:opacity-60"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => iniciarEdicao(t)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium hover:bg-slate-200"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => removerTransacao(t.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
