import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import StatCard from '../components/Dashboard/StatCard';
import RevenueChart from '../components/Charts/RevenueChart';
import BookingChart from '../components/Charts/BookingChart';
import RecentActivity from '../components/Dashboard/RecentActivity';
import Loader from '../components/Common/Loader';
import api from '../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    bookingsToday: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, workersRes, bookingsRes, paymentsRes] = await Promise.all([
        api.get('/users', { params: { limit: 1 } }),
        api.get('/workers', { params: { limit: 1 } }),
        api.get('/bookings', { params: { limit: 10 } }),
        api.get('/payments/report'),
      ]);

      const users = usersRes.data.data || { totalItems: 0 };
      const workers = workersRes.data.data || { totalItems: 0 };
      const bookings = bookingsRes.data.data || { totalItems: 0, rows: [] };
      const payments = paymentsRes.data.data || { summary: {} };

      // Calculate today's bookings
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.rows?.filter(b => 
        b.scheduledDate === today
      ) || [];

      const statsData = {
        totalUsers: users.totalItems || 0,
        totalWorkers: workers.totalItems || 0,
        totalBookings: bookings.totalItems || 0,
        totalRevenue: payments.summary?.totalAmount || 0,
        bookingsToday: todayBookings.length,
        pendingBookings: bookings.rows?.filter(b => b.status === 'pending').length || 0,
        completedBookings: bookings.rows?.filter(b => b.status === 'completed').length || 0,
        cancelledBookings: bookings.rows?.filter(b => b.status === 'cancelled').length || 0,
      };

      setStats(statsData);
      setRecentBookings(bookings.rows?.slice(0, 5) || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500',
      link: '/users',
    },
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      icon: FiUserCheck,
      color: 'bg-green-500',
      link: '/workers',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FiCalendar,
      color: 'bg-purple-500',
      link: '/bookings',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      link: '/payments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            onClick={() => navigate(stat.link)}
          />
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card flex items-center justify-between">
          <div>
            <p className="dashboard-label">Today's Bookings</p>
            <p className="dashboard-stat">{stats.bookingsToday}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <FiClock className="text-blue-500 text-xl" />
          </div>
        </div>
        <div className="dashboard-card flex items-center justify-between">
          <div>
            <p className="dashboard-label">Pending</p>
            <p className="dashboard-stat text-yellow-600">{stats.pendingBookings}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl">
            <FiClock className="text-yellow-500 text-xl" />
          </div>
        </div>
        <div className="dashboard-card flex items-center justify-between">
          <div>
            <p className="dashboard-label">Completed</p>
            <p className="dashboard-stat text-green-600">{stats.completedBookings}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl">
            <FiCheckCircle className="text-green-500 text-xl" />
          </div>
        </div>
        <div className="dashboard-card flex items-center justify-between">
          <div>
            <p className="dashboard-label">Cancelled</p>
            <p className="dashboard-stat text-red-600">{stats.cancelledBookings}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <FiXCircle className="text-red-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h3>
          <RevenueChart />
        </div>
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Trends</h3>
          <BookingChart />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
          <button 
            onClick={() => navigate('/bookings')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            View All
          </button>
        </div>
        <RecentActivity bookings={recentBookings} />
      </div>
    </div>
  );
};

export default Dashboard;