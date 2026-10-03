import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import SearchBar from '../../components/Common/SearchBar';
import Pagination from '../../components/Common/Pagination';

const FAQList = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, [filters]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faq', { params: filters });
      const data = response.data.data;
      setFaqs(data.rows || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
        itemsPerPage: data.itemsPerPage || 10,
      });
    } catch (error) {
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faq/${id}`);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, page: 1, search: query });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">FAQs</h2>
          <p className="text-gray-500">Manage frequently asked questions</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar onSearch={handleSearch} placeholder="Search FAQs..." />
          <Link
            to="/faq/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
          >
            <FiPlus /> Add FAQ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(faq.id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {expandedId === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                    <h4 className="font-medium text-gray-800">{faq.question}</h4>
                  </div>
                  {faq.category && (
                    <span className="ml-7 text-xs text-gray-400">Category: {faq.category}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      faq.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {faq.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    to={`/faq/${faq.id}/edit`}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === faq.id && (
                <div className="mt-3 ml-7 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {faqs.length === 0 && (
          <div className="text-center py-12 text-gray-400">No FAQs found</div>
        )}
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FAQList;