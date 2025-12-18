export enum TransactionType {
  IN = 'ENTRADA',
  OUT = 'SAIDA'
}

export enum ItemCategory {
  ASSET = 'PATRIMONIO',
  CARGO = 'CARGA'
}

export interface Sector {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  sectorId: string;
  sectorName: string; // Denormalized for easier history display if sector is deleted
  date: string; // YYYY-MM-DD
  description: string;
  category: ItemCategory;
  quantity: number;
  assetId?: string; // Only for ASSET, 4 digits
  timestamp: number;
}
