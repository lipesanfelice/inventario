import React, { useEffect, useState } from 'react';
import { getSectors, createSector, updateSector, deleteSector } from '../services/storage';
import { Sector } from '../types';
import { Plus, Edit2, Trash2, X, Check, Building2, Loader2 } from 'lucide-react';

const Sectors: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    setIsLoading(true);
    try {
      const data = await getSectors();
      setSectors(data);
    } catch (error) {
      console.error("Erro ao carregar setores", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectorName.trim()) {
      setIsLoading(true);
      try {
        await createSector(newSectorName.trim());
        setNewSectorName('');
        setIsAdding(false);
        await loadSectors();
      } catch (error) {
        alert("Erro ao criar setor");
        setIsLoading(false);
      }
    }
  };

  const startEdit = (sector: Sector) => {
    setEditingId(sector.id);
    setEditName(sector.name);
  };

  const handleUpdate = async () => {
    if (editingId && editName.trim()) {
      setIsLoading(true);
      try {
        await updateSector({ id: editingId, name: editName.trim() });
        setEditingId(null);
        setEditName('');
        await loadSectors();
      } catch (error) {
        alert("Erro ao atualizar setor");
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este setor?')) {
      setIsLoading(true);
      try {
        await deleteSector(id);
        await loadSectors();
      } catch (error) {
        alert("Erro ao excluir setor");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Setores</h1>
          <p className="text-gray-500">Adicione, edite ou remova setores do inventário.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 font-medium shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Setor
        </button>
      </header>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-md border border-brand-100 flex items-center gap-4 animate-in slide-in-from-top-2">
          <input
            type="text"
            autoFocus
            placeholder="Nome do novo setor..."
            value={newSectorName}
            onChange={(e) => setNewSectorName(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2 bg-white text-gray-900"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700">
              <Check className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}

      {isLoading && sectors.length === 0 ? (
        <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector) => (
            <div key={sector.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
              
              {editingId === sector.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-1 text-sm bg-white text-gray-900"
                  />
                  <button onClick={handleUpdate} className="text-green-600 hover:bg-green-50 p-1 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-50 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-brand-50 rounded-lg">
                      <Building2 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(sector)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sector.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{sector.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">ID: {sector.id}</p>
                </>
              )}
            </div>
          ))}
          
          {sectors.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p>Nenhum setor cadastrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sectors;