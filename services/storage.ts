import { Sector, Transaction } from '../types';

const API_URL = 'http://localhost:3001';

// Helpers para lidar com erros de conexão
const handleRequest = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Falha na conexão com o servidor:", error);
    throw error;
  }
};

export const getSectors = async (): Promise<Sector[]> => {
  try {
    const raw = await handleRequest('/setores'); // ou '/sectors' se ainda estiver assim

    // Normaliza o id como string
    return raw.map((s: any) => ({
      id: String(s.id),
      name: s.name
    }));
  } catch (error) {
    console.warn("Retornando lista vazia devido a erro de conexão.");
    return [];
  }
};


export const saveSectors = async (sectors: Sector[]): Promise<void> => {
  // Esta função era usada no LocalStorage para salvar tudo.
  // No modelo de API, salvamos individualmente. Mantida apenas se necessário por compatibilidade,
  // mas idealmente não deve ser usada diretamente.
  console.warn("saveSectors (bulk) não é suportado via API REST.");
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const bruto = await handleRequest('/movimentacoes');

    return bruto.map((t: any) => ({
      id: String(t.id),              // 👈 agora o banco tem coluna id
      type: t.type,
      sectorId: t.sectorId ? String(t.sectorId) : '',
      sectorName: t.sectorName || 'Desconhecido',
      date: t.date,
      description: t.description,
      category: t.category,
      quantity: t.quantity,
      assetId: t.assetId ? String(t.assetId) : '',
      timestamp: t.timestamp
    }));
  } catch (error) {
    console.warn('Retornando lista vazia de transações devido a erro.');
    return [];
  }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  await handleRequest('/movimentacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
};

export const atualizarMovimentacao = async (transacao: Transaction): Promise<void> => {
  await handleRequest(`/movimentacoes/${transacao.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao)
  })
}

export const excluirMovimentacao = async (id: string): Promise<void> => {
  await handleRequest(`/movimentacoes/${id}`, {
    method: 'DELETE'
  })
}


export const deleteSector = async (id: string): Promise<void> => {
  await handleRequest(`/setores/${id}`, {
    method: 'DELETE'
  });
};

export const updateSector = async (updatedSector: Sector): Promise<void> => {
  await handleRequest(`/setores/${updatedSector.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: updatedSector.name })
  });
};

export const createSector = async (name: string): Promise<Sector> => {
  const newSector: Sector = {
    id: Date.now().toString(), // ou crypto.randomUUID()
    name
  };
  
  await handleRequest('/setores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSector)
  });

  return newSector;
};
