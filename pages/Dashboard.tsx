import React, { useEffect, useState } from 'react';
import { getSectors, addTransaction } from '../services/storage';
import { Sector, TransactionType, ItemCategory, Transaction } from '../types';
import { ArrowDownCircle, ArrowUpCircle, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<TransactionType>(TransactionType.IN);
  const [sectorId, setSectorId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.CARGO);
  const [quantity, setQuantity] = useState<number>(1);
  const [assetId, setAssetId] = useState<string>('');

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const loadedSectors = await getSectors();
        setSectors(loadedSectors);
        if (loadedSectors.length > 0) {
          setSectorId(loadedSectors[0].id);
        }
      } catch (err) {
        setErrorMsg("Erro ao carregar setores. Verifique se o servidor está rodando.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validation
    if (!sectorId) {
      setErrorMsg("Selecione um setor.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Insira uma descrição para o objeto.");
      return;
    }
    if (category === ItemCategory.ASSET) {
      if (!assetId || !/^\d{4}$/.test(assetId)) {
        setErrorMsg("Para itens de patrimônio, informe a placa com 4 números.");
        return;
      }
    }
    if (quantity < 1) {
      setErrorMsg("A quantidade deve ser pelo menos 1.");
      return;
    }

    setIsSaving(true);
    const selectedSector = sectors.find(s => s.id === sectorId);

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      sectorId,
      sectorName: selectedSector ? selectedSector.name : 'Desconhecido',
      date,
      description,
      category,
      quantity,
      assetId: category === ItemCategory.ASSET ? assetId : undefined,
      timestamp: Date.now()
    };

    try {
      await addTransaction(newTransaction);
      
      // Reset form
      setDescription('');
      setQuantity(1);
      setAssetId('');
      setSuccessMsg("Registro salvo com sucesso no banco de dados!");
      
      // Auto-dismiss success message
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Erro ao salvar. Verifique a conexão com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Itens</h1>
        <p className="text-gray-500">Registre a entrada ou saída de materiais e patrimônios.</p>
      </header>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Type Selection */}
        <div className="grid grid-cols-2 border-b border-gray-100">
          <label className={`cursor-pointer p-4 text-center font-semibold transition-colors flex items-center justify-center gap-2
            ${type === TransactionType.IN ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-500 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              name="type" 
              className="hidden" 
              checked={type === TransactionType.IN} 
              onChange={() => setType(TransactionType.IN)} 
            />
            <ArrowDownCircle className="w-5 h-5" />
            Entrada (Recebimento)
          </label>
          <label className={`cursor-pointer p-4 text-center font-semibold transition-colors flex items-center justify-center gap-2
            ${type === TransactionType.OUT ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'text-gray-500 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              name="type" 
              className="hidden" 
              checked={type === TransactionType.OUT} 
              onChange={() => setType(TransactionType.OUT)} 
            />
            <ArrowUpCircle className="w-5 h-5" />
            Saída (Entrega)
          </label>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Ocorrência</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2.5 bg-white text-gray-900"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
              <div className="relative">
                <select 
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2.5 bg-white text-gray-900 disabled:opacity-50"
                >
                  {isLoading ? (
                    <option>Carregando setores...</option>
                  ) : (
                    sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  )}
                  {!isLoading && sectors.length === 0 && <option value="">Nenhum setor disponível</option>}
                </select>
                {isLoading && <Loader2 className="w-4 h-4 absolute right-8 top-3 animate-spin text-gray-400" />}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Objeto</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Cadeira giratória, Caixas de papel A4..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2.5 bg-white text-gray-900"
            />
          </div>

          {/* Category Toggle */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={category === ItemCategory.CARGO} 
                    onChange={() => setCategory(ItemCategory.CARGO)}
                    className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Relação Carga (Consumível/Geral)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={category === ItemCategory.ASSET} 
                    onChange={() => setCategory(ItemCategory.ASSET)}
                    className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Patrimônio (Identificado)</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2.5 bg-white text-gray-900"
              />
            </div>

            {/* Asset ID (Conditional) */}
            <div className={`transition-opacity duration-200 ${category === ItemCategory.ASSET ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº Placa Patrimônio (4 dígitos)
                {category === ItemCategory.ASSET && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input 
                type="text" 
                maxLength={4}
                placeholder="0000"
                value={assetId}
                onChange={(e) => {
                  // Only allow numbers
                  const val = e.target.value.replace(/\D/g, '');
                  setAssetId(val);
                }}
                disabled={category !== ItemCategory.ASSET}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2.5 font-mono tracking-widest bg-white text-gray-900"
              />
            </div>
          </div>

        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving || isLoading}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 flex items-center gap-2 font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Salvando...' : 'Registrar Movimentação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;