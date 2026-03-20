import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { ordersApi } from '../api/orders';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { success, error } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.list();
      // Sort by newest first
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [error]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setStatusUpdating(true);
    try {
      await ordersApi.updateStatus(id, status);
      success(`Order status updated to ${status}`);
      loadOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: status as any });
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getAllowedTransitions = (currentStatus: string) => {
    const allowed: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    return allowed[currentStatus] || [];
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending',
      PROCESSING: 'badge-processing',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  const columns = [
    { header: 'Order ID', render: (o: Order) => <span className="font-mono text-slate-400">#{o.id}</span> },
    { 
      header: 'Customer', 
      render: (o: Order) => (
        <div>
          <p className="font-medium text-slate-200">{o.customerName}</p>
          <p className="text-xs text-slate-400">{o.phone}</p>
        </div>
      ) 
    },
    { 
      header: 'Date', 
      render: (o: Order) => <span className="text-sm">{new Date(o.createdAt).toLocaleString()}</span> 
    },
    { 
      header: 'Total', 
      render: (o: Order) => <span className="font-medium text-emerald-400">{Number(o.totalAmount).toLocaleString()} ₫</span> 
    },
    { header: 'Status', render: (o: Order) => getStatusBadge(o.status) },
    {
      header: 'Actions',
      render: (o: Order) => (
        <button
          onClick={() => { setSelectedOrder(o); setModalOpen(true); }}
          className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
        >
          👁️ View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Orders Management</h1>
          <p className="text-slate-400 text-sm">Track and update customer orders</p>
        </div>
        <button onClick={loadOrders} className="btn-secondary rounded-full w-10 h-10 flex items-center justify-center p-0" title="Refresh">
          <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span>
        </button>
      </div>

      <Table columns={columns} data={orders} isLoading={loading} emptyMessage="No orders found." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Order #${selectedOrder?.id}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer Details</h4>
                <p className="font-medium text-white">{selectedOrder.customerName}</p>
                <p className="text-sm text-slate-400">📞 {selectedOrder.phone}</p>
                <p className="text-sm text-slate-400 mt-1">📍 {selectedOrder.address || 'No address provided'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Order Summary</h4>
                <p className="text-sm text-slate-400">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p className="text-sm text-slate-400 mt-1">Status: {getStatusBadge(selectedOrder.status)}</p>
                <p className="text-lg font-bold text-emerald-400 mt-2">Total: {Number(selectedOrder.totalAmount).toLocaleString()} ₫</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700/50 pb-2">Order Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                      <div>
                        <p className="font-medium text-slate-200">
                          {item.quantity}x {item.product?.name || `Product #${item.productId}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 space-x-2">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.sugarLevel && <span className="border-l border-slate-600 pl-2">Sugar: {item.sugarLevel}</span>}
                          {item.iceLevel && <span className="border-l border-slate-600 pl-2">Ice: {item.iceLevel}</span>}
                        </p>
                        {item.toppings && <p className="text-xs text-slate-500 mt-1">Toppings: {item.toppings}</p>}
                      </div>
                      <p className="font-medium text-slate-300">{Number(item.price).toLocaleString()} ₫</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No items found for this order.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {getAllowedTransitions(selectedOrder.status).length > 0 ? (
                  getAllowedTransitions(selectedOrder.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={statusUpdating}
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-all bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-slate-500"
                    >
                      Mark as {status}
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic">
                    Status cannot be changed from {selectedOrder.status}.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
