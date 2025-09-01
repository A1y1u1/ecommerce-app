import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/products'),
          axios.get('http://localhost:5000/orders'),
          axios.get('http://localhost:5000/users'),
        ]);

        // Calculate additional stats
        const pendingOrders = ordersRes.data.filter(
          (order) => order.status.toLowerCase() === 'pending'
        ).length;
        const lowStockProducts = productsRes.data.filter(
          (product) => product.stock < 10
        ).length; // Assuming < 10 is low stock

        setStats({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
          pendingOrders,
          lowStockProducts,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard stats.');
        setLoading(false);
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchStats();
  }, []);

  // Chart data
  const chartData = {
    labels: ['Products', 'Orders', 'Users', 'Pending Orders', 'Low Stock'],
    datasets: [
      {
        label: 'Counts',
        data: [
          stats.products,
          stats.orders,
          stats.users,
          stats.pendingOrders,
          stats.lowStockProducts,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(234, 179, 8, 0.7)',   // Yellow
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(239, 68, 68, 0.7)',   // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'E-Commerce Stats Overview', font: { size: 18 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count' },
      },
    },
  };

  if (loading) return <div className="text-center p-6 text-gray-600 text-xl">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500 text-xl">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="p-6 bg-blue-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-3xl mt-2">{stats.products}</p>
        </div>
        <div className="p-6 bg-green-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-3xl mt-2">{stats.orders}</p>
        </div>
        <div className="p-6 bg-yellow-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-3xl mt-2">{stats.users}</p>
        </div>
        <div className="p-6 bg-orange-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold">Pending Orders</h2>
          <p className="text-3xl mt-2">{stats.pendingOrders}</p>
        </div>
        <div className="p-6 bg-red-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold">Low Stock</h2>
          <p className="text-3xl mt-2">{stats.lowStockProducts}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Optional: Add this to your CSS file (e.g., src/index.css) for animations
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 1s ease-in;
}
*/