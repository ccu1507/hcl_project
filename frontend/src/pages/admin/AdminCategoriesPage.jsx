import React, { useState, useEffect } from 'react';
import { Layers, Plus, Pencil, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';
import CategoryFormModal from '../../components/admin/CategoryFormModal';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories/admin/all');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleModalSuccess = (savedCategory, isEdit) => {
    if (isEdit) {
      setCategories((prev) => prev.map((c) => (c._id === savedCategory._id ? savedCategory : c)));
    } else {
      setCategories((prev) => [...prev, savedCategory]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Categories
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage product categories for your store.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white h-32 rounded-2xl border border-gray-100 p-5">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mb-3" />
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No categories found</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Create your first category to start organizing products.</p>
          <button
            onClick={openAddModal}
            className="text-brand-red font-bold hover:underline"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 overflow-hidden">
                  {category.logoUrl ? (
                    <img src={category.logoUrl} alt={category.name} className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-brand-dark text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {category.name}
              </h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{category.description}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminCategoriesPage;
