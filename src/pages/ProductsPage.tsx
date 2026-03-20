import React, { useEffect, useState, useRef } from 'react';
import type { Product, Category } from '../types';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', categoryId: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([productsApi.list(), categoriesApi.list()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [error]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        categoryId: product.categoryId?.toString() || '',
      });
      setPreviewUrl(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', categoryId: '' });
      setPreviewUrl(null);
    }
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        success('Product updated');
      } else {
        const created = await productsApi.create(payload);
        productId = created.id;
        success('Product created');
      }

      if (selectedImage && productId) {
        await productsApi.uploadImage(productId, selectedImage);
        success('Image uploaded successfully');
      }

      handleCloseModal();
      loadData();
    } catch (err: any) {
      error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      success('Product deleted');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  const columns = [
    { 
      header: 'Image', 
      render: (p: Product) => (
        <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center overflow-hidden">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">🥤</span>
          )}
        </div>
      ) 
    },
    { header: 'Name', accessor: 'name' as keyof Product },
    { 
      header: 'Category', 
      render: (p: Product) => {
        const cat = categories.find(c => c.id === p.categoryId);
        return <span className="px-2 py-1 rounded bg-slate-700/30 text-xs font-medium">{cat ? cat.name : 'Uncategorized'}</span>
      }
    },
    { 
      header: 'Price', 
      render: (p: Product) => <span className="font-medium text-emerald-400">{Number(p.price).toLocaleString()} ₫</span>
    },
    {
      header: 'Actions',
      render: (p: Product) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(p)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded">✏️</button>
          <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
          <p className="text-slate-400 text-sm">Manage drinks, pricing, and images</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <span>➕</span> New Product
        </button>
      </div>

      <Table columns={columns} data={products} isLoading={loading} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Create Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image Upload Area */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-48 h-48 rounded-2xl border-2 border-dashed border-slate-600/50 bg-slate-800/40 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-medium">
                      Change Image
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">📸</span>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-blue-400 transition-colors">Click to upload</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
              />
              <p className="text-xs text-slate-500 text-center">JPG, PNG, WEBP<br/>Max 5MB</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input"
                  placeholder="e.g. Classic Milk Tea"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Price (VND) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="glass-input"
                    placeholder="e.g. 35000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[120px]">
              {submitting ? <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
