import React, { useState, useEffect } from 'react';
import { Store, Plus, Pencil, Trash2, X, Check, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import ProductFormModal from '../../components/admin/ProductFormModal';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/categories/admin/all')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleStockUpdate = async (id, currentStock, change) => {
    try {
      const res = await api.put(`/products/${id}/stock`, {
        changeAmount: change,
        reason: 'Quick Admin Adjustment'
      });
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stockQuantity: res.data.stockQuantity } : p));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock.');
    }
  }

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleModalSuccess = (savedProduct, isEdit) => {
    if (isEdit) {
      // Keep revenue and unitsSold from old state since saving only returns raw product
      setProducts((prev) => prev.map((p) => (p._id === savedProduct._id ? { ...savedProduct, revenue: p.revenue, unitsSold: p.unitsSold } : p)));
    } else {
      // New product has 0 revenue/unitsSold initially
      setProducts((prev) => [{ ...savedProduct, revenue: 0, unitsSold: 0 }, ...prev]);
    }
    setModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categoryId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Products Inventory
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage pricing, details, and stock levels.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:border-brand-yellow/50 focus:bg-white focus:ring-4 focus:ring-brand-yellow/10 rounded-xl py-2 pl-9 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all outline-none"
          />
        </div>
        <div className="text-sm font-bold text-gray-500 hidden sm:block">
          {filteredProducts.length} items
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4 rounded-tl-2xl">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Sales / Rev</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-sm">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48 mb-1"></div><div className="h-3 bg-gray-50 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No products found. Add a new product to get started.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                           <Store className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{product.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{product.categoryId?.name || 'Uncategorized'}</span>
                          {product.isCombo && (
                            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">COMBO</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-brand-dark">₹{product.cost}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         product.stockQuantity === 0 ? 'bg-red-500' :
                         product.stockQuantity < 10 ? 'bg-yellow-400' : 'bg-green-500'
                       }`} />
                       <span className="font-bold w-6">{product.stockQuantity}</span>
                       <div className="flex items-center bg-gray-100 rounded-md border border-gray-200 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleStockUpdate(product._id, product.stockQuantity, -1)} className="px-2 hover:bg-gray-200 rounded-l-md font-bold text-gray-500 hover:text-red-600">-</button>
                         <button onClick={() => handleStockUpdate(product._id, product.stockQuantity, 1)} className="px-2 hover:bg-gray-200 border-l border-gray-200 rounded-r-md font-bold text-gray-500 hover:text-green-600">+</button>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div><span className="font-bold text-gray-800">{product.unitsSold || 0}</span> items</div>
                    <div className="text-xs text-green-600 font-bold flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3"/> ₹{(product.revenue || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          allProducts={products}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminProductsPage;
