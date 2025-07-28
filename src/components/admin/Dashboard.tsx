import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  dailyOrders: number;
  monthlyOrders: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    dailyOrders: 0,
    monthlyOrders: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      // Fetch orders for calculations
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfMonth);

      if (error) {
        console.error('Error fetching orders:', error);
        // Demo data
        setStats({
          dailyRevenue: 1250.50,
          monthlyRevenue: 18750.00,
          dailyOrders: 24,
          monthlyOrders: 187,
          topProducts: [
            { name: 'Marmita de Picanha', quantity: 15, revenue: 283.50 },
            { name: 'Marmita de Costela', quantity: 12, revenue: 238.80 },
            { name: 'Marmita de Maminha', quantity: 10, revenue: 169.00 },
            { name: 'Marmita de Alcatra', quantity: 8, revenue: 143.20 },
            { name: 'Marmita de Fraldinha', quantity: 6, revenue: 95.40 }
          ]
        });
      } else {
        // Calculate real stats from orders
        const deliveredOrders = orders?.filter(order => order.status === 'entregue') || [];
        const todayOrders = deliveredOrders.filter(order => 
          new Date(order.created_at) >= new Date(startOfDay)
        );

        const dailyRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const monthlyRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

        // Calculate top products
        const productStats: { [key: string]: { quantity: number; revenue: number } } = {};
        
        deliveredOrders.forEach(order => {
          order.items.forEach((item: any) => {
            const productName = item.product.name;
            if (!productStats[productName]) {
              productStats[productName] = { quantity: 0, revenue: 0 };
            }
            productStats[productName].quantity += item.quantity;
            productStats[productName].revenue += item.product.price * item.quantity;
          });
        });

        const topProducts = Object.entries(productStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        setStats({
          dailyRevenue,
          monthlyRevenue,
          dailyOrders: todayOrders.length,
          monthlyOrders: deliveredOrders.length,
          topProducts
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-80"></div>
            <div className="bg-gray-200 rounded-lg h-80"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Faturamento Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.dailyRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Faturamento Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {stats.monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-orange-600">{stats.dailyOrders}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pedidos Mês</p>
              <p className="text-2xl font-bold text-purple-600">{stats.monthlyOrders}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Receita por Produto</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.topProducts}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="revenue"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.topProducts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;