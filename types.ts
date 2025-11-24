export interface Product {
  id: number;
  name: string;
  image: string;
  unit: string;
  category: string;
  brand: string;
  stock: number;
  status: 'In Stock' | 'Out of Stock';
}

export interface InventoryLog {
  id: number;
  productId: number;
  oldStock: number;
  newStock: number;
  changedBy: string;
  timestamp: string;
}

export interface ImportResponse {
  added: number;
  skipped: number;
  duplicates: Array<{ name: string; existingId: number }>;
}

export enum SortOption {
  NAME_ASC = 'Name (A-Z)',
  NAME_DESC = 'Name (Z-A)',
  STOCK_ASC = 'Stock (Low-High)',
  STOCK_DESC = 'Stock (High-Low)',
}
