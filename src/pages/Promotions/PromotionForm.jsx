import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';

const PromotionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    applicableTo: 'all',
    applicableServiceIds: [],
    isActive: true,
  });

  useEffect(() => {
    fetchServices();
    if (id) fetchPromotion();
  }, [id]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services', { params: { limit: 100 } });
      setServices(response.data.data.rows || []);
    } catch (error) {
      console.error('Failed to fetch services');
    }
  };

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/promotions/${id}`);
      const promotion = response.data.data;
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        image: promotion.image || '',
        discountType: promotion.discountType || 'percentage',
        discountValue: promotion.discountValue || '',
        startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
        endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
        applicableTo: promotion.applicableTo || 'all',
        applicableServiceIds: promotion.applicableServiceIds || [],
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
      });
    } catch (error) {
      toast.error('Failed to fetch promotion');
      navigate('/promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const current = prev.applicableServiceIds || [];
      if (current.includes(serviceId)) {
        return { ...prev, applicableServiceIds: current.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, applicableServiceIds: [...current, serviceId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue) || 0,
      };
      if (id) {
        await api.put(`/promotions/${id}`, payload);
        toast.success('Promotion updated successfully');
      } else {
        await api.post('/promotions', payload);
        toast.success('Promotion created successfully');
      }
      navigate('/promotions');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/promotions"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {id ? 'Edit Promotion' : 'Add New Promotion'}
          </h2>
          <p className="text-gray-500">{id ? 'Update promotion details' : 'Create a new promotion'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/promo.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value *
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable To
            </label>
            <select
              name="applicableTo"
              value={formData.applicableTo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              <option value="user">Users Only</option>
              <option value="worker">Workers Only</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Service Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Services (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(formData.applicableServiceIds || []).includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                {service.name}
              </label>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full">No services available</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
          />
          <label className="ml-2 text-sm text-gray-700">Active</label>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Promotion'}
          </button>
          <Link
            to="/promotions"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;