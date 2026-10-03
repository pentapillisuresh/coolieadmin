import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiCalendar,
  FiPercent,
  FiDollarSign,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import SearchBar from '../../components/Common/SearchBar';
import Pagination from '../../components/Common/Pagination';

const PromotionsList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchPromotions();
  }, [filters]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions/admin/all', { params: filters });
      const data = response.data.data;
      setPromotions(data.rows || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
        itemsPerPage: data.itemsPerPage || 10,
      });
    } catch (error) {
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Promotion deleted successfully');
      fetchPromotions();
    } catch (error) {
      toast.error('Failed to delete promotion');
    }
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, page: 1, search: query });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const isActive = (promotion) => {
    const now = new Date();
    return (
      promotion.isActive &&
      new Date(promotion.startDate) <= now &&
      new Date(promotion.endDate) >= now
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Promotions</h2>
          <p className="text-gray-500">Manage discounts and promotional offers</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar onSearch={handleSearch} placeholder="Search promotions..." />
          <Link
            to="/promotions/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
          >
            <FiPlus /> Add Promotion
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promotion) => {
          const active = isActive(promotion);
          return (
            <div key={promotion.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {promotion.image && (
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">{promotion.title}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {promotion.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {promotion.discountType === 'percentage' ? (
                    <FiPercent className="text-primary-500" />
                  ) : (
                    <FiDollarSign className="text-primary-500" />
                  )}
                  <span className="font-medium">
                    {promotion.discountValue}
                    {promotion.discountType === 'percentage' ? '%' : ' ₹'}
                  </span>
                  <span className="text-gray-500">off</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiCalendar className="text-gray-400" />
                  <span>
                    {format(new Date(promotion.startDate), 'dd MMM')} -{' '}
                    {format(new Date(promotion.endDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiTag className="text-gray-400" />
                  <span>Applies to: {promotion.applicableTo}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <Link
                  to={`/promotions/${promotion.id}/edit`}
                  className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition text-center"
                >
                  <FiEdit2 className="inline mr-1" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(promotion.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <FiTrash2 className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-12 text-gray-400">No promotions found</div>
      )}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PromotionsList;