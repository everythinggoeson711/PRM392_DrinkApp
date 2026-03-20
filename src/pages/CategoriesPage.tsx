import React, { useEffect, useState } from 'react';
import type { Category } from '../types';
import { categoriesApi } from '../api/categories';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err: any) {
      error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [error]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
        success('Category updated successfully');
      } else {
        await categoriesApi.create(formData);
        success('Category created successfully');
      }
      handleCloseModal();
      loadCategories();
    } catch (err: any) {
      error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      success('Category deleted');
      loadCategories();
    } catch (err: any) {
      error(err.message || 'Failed to delete category');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Category },
    { header: 'Name', accessor: 'name' as keyof Category },
    { header: 'Description', accessor: 'description' as keyof Category },
    {
      header: 'Actions',
      render: (cat: Category) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(cat)}
            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors border border-blue-500/20"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors border border-red-500/20"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Categories</h1>
          <p className="text-slate-400 text-sm">Manage drink categories in the menu</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary group flex items-center gap-2">
          <span className="text-xl group-hover:rotate-90 transition-transform">➕</span> 
          New Category
        </button>
      </div>

      <Table columns={columns} data={categories} isLoading={loading} emptyMessage="No categories found. Create your first category to get started." />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input"
              placeholder="e.g. Milk Tea, Coffee, Fruit Tea..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input min-h-[100px] resize-y"
              placeholder="Optional brief description..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[120px]">
              {submitting ? <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
