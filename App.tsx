import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import InventorySidebar from './components/InventorySidebar';
import AddProductModal from './components/AddProductModal';
import { Product } from './types';
import { api } from './services/api';
import { useToast } from './components/Toast';

const ITEMS_PER_PAGE = 5;

function App() {
  const { addToast } = useToast();

  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

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
      setCurrentPage(1); // Reset to first page on filter change
    } catch (error) {
      console.error('Failed to fetch products', error);
      addToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter, addToast]);

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
      addToast(`Imported ${res.added} products. ${res.skipped} duplicates skipped.`, 'success');
      fetchProducts(); // Refresh
    } catch (error) {
      addToast('Error importing file', 'error');
    }
  };

  const handleUpdateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      // Optimistic Update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      const updated = await api.updateProduct(id, updates);
      
      // Confirm with server data
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      addToast('Product updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update product', 'error');
      fetchProducts(); // Revert
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product deleted', 'success');
    } catch (error) {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleCreateProduct = async (newProductData: Omit<Product, 'id'>) => {
      try {
          await api.createProduct(newProductData);
          addToast('Product created successfully', 'success');
          fetchProducts();
      } catch (error) {
          addToast('Failed to create product', 'error');
          throw error;
      }
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(id);
    setIsHistoryOpen(true);
  };

  const handleExport = () => {
    api.exportCSV();
    addToast('Export started', 'info');
  };

  // Extract unique categories for filter
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  // Client-side Pagination Logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onImport={handleImport}
        onExport={handleExport}
        onAddProduct={() => setIsAddModalOpen(true)}
        categories={uniqueCategories}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <ProductTable
            products={currentProducts}
            isLoading={isLoading}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onSelectProduct={handleSelectProduct}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
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