import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import InventorySidebar from './components/InventorySidebar';
import AddProductModal from './components/AddProductModal';
import { Product } from './types';
import { api } from './services/api';

function App() {
  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Selection & Modals
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initial Load
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts(searchQuery, categoryFilter);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, fetchProducts]);

  // Actions
  const handleImport = async (file: File) => {
    try {
      const res = await api.importCSV(file);
      alert(`Import Successful!\nAdded: ${res.added}\nSkipped: ${res.skipped}\nDuplicates: ${res.duplicates.length}`);
      fetchProducts(); // Refresh
    } catch (error) {
      alert('Error importing file');
    }
  };

  const handleUpdateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      // Optimistic Update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      const updated = await api.updateProduct(id, updates);
      
      // Confirm with server data
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      alert('Failed to update product');
      fetchProducts(); // Revert
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleCreateProduct = async (newProductData: Omit<Product, 'id'>) => {
      try {
          await api.createProduct(newProductData);
          fetchProducts();
      } catch (error) {
          throw error;
      }
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(id);
    setIsHistoryOpen(true);
  };

  // Extract unique categories for filter
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onImport={handleImport}
        onExport={api.exportCSV}
        onAddProduct={() => setIsAddModalOpen(true)}
        categories={uniqueCategories}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ProductTable
            products={products}
            isLoading={isLoading}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onSelectProduct={handleSelectProduct}
          />
        </div>
      </main>

      {/* Slide-over Sidebar */}
      <InventorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        product={selectedProduct}
      />

      {/* Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateProduct}
      />
      
      {/* Overlay for Sidebar */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 transition-opacity"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default App;