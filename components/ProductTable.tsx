import React, { useState } from 'react';
import { Product } from '../types';
import { Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onUpdateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onSelectProduct: (id: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onUpdateProduct,
  onDeleteProduct,
  onSelectProduct
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const startEditing = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingId(product.id);
    setEditForm(product);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId) {
      await onUpdateProduct(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      await onDeleteProduct(id);
    }
  };

  const handleChange = (field: keyof Product, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => {
            const isEditing = editingId === product.id;

            return (
              <tr 
                key={product.id} 
                className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${isEditing ? 'bg-indigo-50/50' : ''}`}
                onClick={() => !isEditing && onSelectProduct(product.id)}
              >
                {/* Image & Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-lg object-cover border border-gray-200" src={product.image} alt="" />
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-40 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-32 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  )}
                </td>

                {/* Brand */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.brand || ''}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="w-24 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.brand
                  )}
                </td>

                {/* Unit */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.unit || ''}
                      onChange={(e) => handleChange('unit', e.target.value)}
                      className="w-20 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.unit
                  )}
                </td>

                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                   {isEditing ? (
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.stock
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                   {/* Status is derived from stock usually, but showing label logic */}
                   {product.stock > 0 ? (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                       In Stock
                     </span>
                   ) : (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                       Out of Stock
                     </span>
                   )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={saveEditing} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="text-gray-500 hover:text-gray-700 p-1 bg-gray-100 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => startEditing(e, product)} className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => handleDelete(e, product.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;