import { Product, InventoryLog, ImportResponse } from '../types';

// TOGGLE THIS TO FALSE TO USE REAL BACKEND
const DEMO_MODE = true;

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Headphones', image: 'https://picsum.photos/50/50?random=1', unit: 'pcs', category: 'Electronics', brand: 'Sony', stock: 120, status: 'In Stock' },
  { id: 2, name: 'Ergonomic Chair', image: 'https://picsum.photos/50/50?random=2', unit: 'pcs', category: 'Furniture', brand: 'Herman Miller', stock: 0, status: 'Out of Stock' },
  { id: 3, name: 'Mechanical Keyboard', image: 'https://picsum.photos/50/50?random=3', unit: 'pcs', category: 'Electronics', brand: 'Keychron', stock: 45, status: 'In Stock' },
  { id: 4, name: 'Organic Coffee Beans', image: 'https://picsum.photos/50/50?random=4', unit: 'kg', category: 'Grocery', brand: 'Blue Bottle', stock: 200, status: 'In Stock' },
  { id: 5, name: '27" 4K Monitor', image: 'https://picsum.photos/50/50?random=5', unit: 'pcs', category: 'Electronics', brand: 'Dell', stock: 12, status: 'In Stock' },
];

const MOCK_LOGS: InventoryLog[] = [
  { id: 101, productId: 1, oldStock: 100, newStock: 120, changedBy: 'admin', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 102, productId: 1, oldStock: 120, newStock: 110, changedBy: 'system', timestamp: new Date().toISOString() },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getProducts: async (query: string = '', category: string = ''): Promise<Product[]> => {
    if (DEMO_MODE) {
      await delay(600);
      let filtered = [...MOCK_PRODUCTS];
      if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      }
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      return filtered;
    }
    
    const params = new URLSearchParams();
    if (query) params.append('name', query);
    if (category) params.append('category', category);
    
    const res = await fetch(`/api/products/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  updateProduct: async (id: number, updates: Partial<Product>): Promise<Product> => {
    if (DEMO_MODE) {
      await delay(500);
      const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (productIndex === -1) throw new Error('Product not found');
      
      const updatedProduct = { ...MOCK_PRODUCTS[productIndex], ...updates };
      // Update status based on stock automatically for demo
      if (updates.stock !== undefined) {
        updatedProduct.status = updates.stock > 0 ? 'In Stock' : 'Out of Stock';
      }
      MOCK_PRODUCTS[productIndex] = updatedProduct;
      return updatedProduct;
    }

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (DEMO_MODE) {
      await delay(400);
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
      return;
    }

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    if (DEMO_MODE) {
        await delay(500);
        const newProduct = { ...product, id: Math.floor(Math.random() * 10000) };
        MOCK_PRODUCTS.push(newProduct);
        return newProduct;
    }
    // Assuming POST /api/products exists for creation even though prompt didn't explicitly detail it in backend tasks, it's needed for frontend task 1
    const res = await fetch(`/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  getHistory: async (id: number): Promise<InventoryLog[]> => {
    if (DEMO_MODE) {
      await delay(400);
      // Generate some random history for demo if not static
      return MOCK_LOGS.filter(l => l.productId === id).concat([
          { id: Math.random(), productId: id, oldStock: 10, newStock: 15, changedBy: 'User', timestamp: new Date(Date.now() - 10000000).toISOString() }
      ]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    const res = await fetch(`/api/products/${id}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  importCSV: async (file: File): Promise<ImportResponse> => {
    if (DEMO_MODE) {
      await delay(1000);
      return { added: 5, skipped: 1, duplicates: [] };
    }

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/products/import', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Import failed');
    return res.json();
  },

  exportCSV: (): void => {
    if (DEMO_MODE) {
      alert("In a real env, this triggers GET /api/products/export download.");
      return;
    }
    window.location.href = '/api/products/export';
  }
};