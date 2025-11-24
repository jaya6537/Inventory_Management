import React, { useEffect, useState } from 'react';
import { X, Clock, TrendingUp, TrendingDown, User } from 'lucide-react';
import { Product, InventoryLog } from '../types';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface InventorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const InventorySidebar: React.FC<InventorySidebarProps> = ({ isOpen, onClose, product }) => {
  const [history, setHistory] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const logs = await api.getHistory(product.id);
          setHistory(logs);
        } catch (error) {
          console.error("Failed to load history", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, product]);

  // Prepare chart data: needs to be reversed (chronological) for the graph
  const chartData = [...history].reverse().map(log => ({
      date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      stock: log.newStock
  }));

  return (
    <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {product && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Inventory History</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* Current Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Current Stock</p>
                    <p className="text-3xl font-bold text-indigo-900 mt-1">{product.stock}</p>
                    <p className="text-xs text-indigo-400 mt-1">{product.unit}</p>
                </div>
                <div className={`p-4 rounded-xl border ${product.status === 'In Stock' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${product.status === 'In Stock' ? 'text-green-600' : 'text-red-600'}`}>Status</p>
                    <p className={`text-lg font-bold mt-2 ${product.status === 'In Stock' ? 'text-green-800' : 'text-red-800'}`}>{product.status}</p>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="mb-8 h-48 w-full">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Stock Trends</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Recent Activity
            </h3>

            {isLoading ? (
               <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
            ) : (
              <div className="space-y-0">
                {history.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No history available.</p>
                ) : (
                    history.map((log, idx) => {
                        const isIncrease = log.newStock > log.oldStock;
                        return (
                            <div key={log.id} className="relative pl-6 py-4 border-l-2 border-gray-100 last:pb-0">
                                {/* Timeline dot */}
                                <div className={`absolute left-[-5px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white ${isIncrease ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Stock {isIncrease ? 'increased' : 'decreased'} 
                                            <span className="text-gray-400 mx-1">from</span>
                                            <span className="line-through text-gray-400 text-xs">{log.oldStock}</span>
                                            <span className="text-gray-400 mx-1">to</span>
                                            <span className={`font-bold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>{log.newStock}</span>
                                        </p>
                                        <div className="flex items-center mt-1 gap-2">
                                            <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                                <User className="w-3 h-3" /> {log.changedBy}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySidebar;