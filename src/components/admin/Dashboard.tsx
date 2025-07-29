import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ).toISOString();

      // Fetch orders for calculations
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startOfMonth);

      if (error) {
        console.error("Error fetching orders:", error);
        // Demo data
        setStats({
          dailyRevenue: 1250.5,
          monthlyRevenue: 18750.0,
          dailyOrders: 24,
          monthlyOrders: 187,
          topProducts: [
            { name: "Marmita de Picanha", quantity: 15, revenue: 283.5 },
            { name: "Marmita de Costela", quantity: 12, revenue: 238.8 },
            { name: "Marmita de Maminha", quantity: 10, revenue: 169.0 },
            { name: "Marmita de Alcatra", quantity: 8, revenue: 143.2 },
            { name: "Marmita de Fraldinha", quantity: 6, revenue: 95.4 },
          ],
        });
      } else {
        // Calculate real stats from orders
        const deliveredOrders =
          orders?.filter((order) => order.status === "entregue") || [];
        const todayOrders = deliveredOrders.filter(
          (order) => new Date(order.created_at) >= new Date(startOfDay)
        );

        const dailyRevenue = todayOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const monthlyRevenue = deliveredOrders.reduce(
          (sum, order) => sum + order.total,
          0
        );

        // Calculate top products
        const productStats: {
          [key: string]: { quantity: number; revenue: number };
        } = {};

        deliveredOrders.forEach((order) => {
          order.items.forEach(
            (item: {
              product: { name: string; price: number };
              quantity: number;
            }) => {
              const productName = item.product.name;
              if (!productStats[productName]) {
                productStats[productName] = { quantity: 0, revenue: 0 };
              }
              productStats[productName].quantity += item.quantity;
              productStats[productName].revenue +=
                item.product.price * item.quantity;
            }
          );
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
          topProducts,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="text-center">
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
              <p className="text-2xl font-bold text-orange-600">
                {stats.dailyOrders}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pedidos Mês</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.monthlyOrders}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Produtos Mais Vendidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Produto
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Quantidade
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {product.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      R$ {product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
