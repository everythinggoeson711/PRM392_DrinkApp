import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { usersApi } from '../api/users';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (err: any) {
      error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [error]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'customer' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Partial<User> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role as 'admin' | 'customer',
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await usersApi.update(editingUser.id, payload);
        success('User updated successfully');
      } else {
        if (!formData.password) throw new Error('Password is required for new users');
        await usersApi.create(payload as any);
        success('User created successfully');
      }
      handleCloseModal();
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'admin') {
      if (!window.confirm('WARNING: You are about to delete an ADMIN account. Are you sure?')) return;
    } else {
      if (!window.confirm('Are you sure you want to delete this user?')) return;
    }

    try {
      await usersApi.delete(user.id);
      success('User deleted');
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Failed to delete user');
    }
  };

  const columns = [
    { 
      header: 'Avatar', 
      render: (u: User) => (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${
          u.role === 'admin' ? 'bg-gradient-to-tr from-rose-500 to-orange-400' : 'bg-gradient-to-tr from-blue-500 to-emerald-400'
        }`}>
          {u.name.charAt(0).toUpperCase()}
        </div>
      ) 
    },
    { 
      header: 'Name', 
      render: (u: User) => (
        <div>
          <p className="font-medium text-slate-200">{u.name}</p>
          <p className="text-xs text-slate-400">{u.email}</p>
        </div>
      )
    },
    { 
      header: 'Role', 
      render: (u: User) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          u.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-700/50 text-slate-300'
        }`}>
          {u.role}
        </span>
      )
    },
    { 
      header: 'Joined', 
      render: (u: User) => <span className="text-sm text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</span> 
    },
    {
      header: 'Actions',
      render: (u: User) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(u)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded border border-blue-500/20">✏️</button>
          <button onClick={() => handleDelete(u)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/20">🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
          <p className="text-slate-400 text-sm">Manage administrators and customers</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <span>➕</span> New User
        </button>
      </div>

      <Table columns={columns} data={users} isLoading={loading} emptyMessage="No users found." />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="glass-input"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password {editingUser && '(Leave blank to keep unchanged)'} {(!editingUser) && '*'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="glass-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat bg-[right_1rem_center]"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[120px]">
              {submitting ? <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : editingUser ? 'Save Updates' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
