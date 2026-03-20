import { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders';
import { productsApi } from '../api/products';
import { usersApi } from '../api/users';
import { useToast } from '../components/Toast';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, products, users] = await Promise.all([
          ordersApi.list(),
          productsApi.list(),
          usersApi.list(),
        ]);

        const totalRevenue = orders
          .filter(o => o.status === 'COMPLETED')
          .reduce((sum, order) => sum + Number(order.totalAmount), 0);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          revenue: totalRevenue,
        });
      } catch (err: any) {
        error(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `${stats.revenue.toLocaleString()} ₫`, icon: '💰', color: 'from-emerald-500 to-teal-400' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: '🛒', color: 'from-blue-500 to-indigo-400' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: '🏷️', color: 'from-purple-500 to-pink-400' },
    { label: 'Users', value: stats.totalUsers.toString(), icon: '👥', color: 'from-orange-500 to-amber-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-400">Welcome to the Drink Admin Control Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-card p-6 overflow-hidden relative group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{card.label}</p>
                  <h3 className="text-3xl font-bold text-slate-100 placeholder-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                    {card.value}
                  </h3>
                </div>
                <span className="text-3xl opacity-80 filter drop-shadow-md">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="text-6xl">🚀</span>
          <h3 className="text-xl font-medium text-slate-300">Welcome back Admin</h3>
          <p className="text-slate-500 max-w-md mx-auto">Use the sidebar navigation to manage products, view incoming orders, and manage users.</p>
        </div>
      </div>
    </div>
  );
};
