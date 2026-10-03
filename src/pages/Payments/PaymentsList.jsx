import React, { useState, useEffect } from 'react';
import { FiSearch, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import Pagination from '../../components/Common/Pagination';
import StatusBadge from '../../components/Common/StatusBadge';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/report', { params: filters });
      const data = response.data.data;
      setPayments(data.payments || []);
      setSummary(data.summary || {});
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        <p className="text-gray-500">Manage all payment transactions</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="dashboard-card">
            <p className="dashboard-label">Total Revenue</p>
            <p className="dashboard-stat text-primary-600">₹{summary.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className="dashboard-card">
            <p className="dashboard-label">Paid</p>
            <p className="dashboard-stat text-green-600">₹{summary.totalPaid?.toLocaleString() || 0}</p>
          </div>
          <div className="dashboard-card">
            <p className="dashboard-label">Pending</p>
            <p className="dashboard-stat text-yellow-600">₹{summary.totalPending?.toLocaleString() || 0}</p>
          </div>
          <div className="dashboard-card">
            <p className="dashboard-label">Refunded</p>
            <p className="dashboard-stat text-red-600">₹{summary.totalRefunded?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900">
                      {payment.transactionId || payment.razorpayPaymentId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    #{payment.Booking?.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.createdAt && format(new Date(payment.createdAt), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No payments found
          </div>
        )}
      </div>

      <Pagination
        currentPage={filters.page}
        totalPages={Math.ceil(payments.length / filters.limit) || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PaymentsList;