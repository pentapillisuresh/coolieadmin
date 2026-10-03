import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';

const TrainingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [professions, setProfessions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    applicableProfessions: [],
    level: 'beginner',
    duration: '',
    isRequired: true,
    isActive: true,
    scheduledDate: '',
    meetingLink: '',
  });

  useEffect(() => {
    fetchProfessions();
    if (id) fetchTraining();
  }, [id]);

  const fetchProfessions = async () => {
    try {
      const response = await api.get('/workers/professions');
      setProfessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch professions');
    }
  };

  const fetchTraining = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training/${id}`);
      const training = response.data.data;
      setFormData({
        title: training.title || '',
        slug: training.slug || '',
        description: training.description || '',
        thumbnail: training.thumbnail || '',
        applicableProfessions: training.applicableProfessions || [],
        level: training.level || 'beginner',
        duration: training.duration || '',
        isRequired: training.isRequired !== undefined ? training.isRequired : true,
        isActive: training.isActive !== undefined ? training.isActive : true,
        scheduledDate: training.scheduledDate ? training.scheduledDate.split('T')[0] : '',
        meetingLink: training.meetingLink || '',
      });
    } catch (error) {
      toast.error('Failed to fetch training');
      navigate('/training');
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

  const handleProfessionToggle = (profession) => {
    setFormData((prev) => {
      const current = prev.applicableProfessions || [];
      if (current.includes(profession)) {
        return { ...prev, applicableProfessions: current.filter((p) => p !== profession) };
      } else {
        return { ...prev, applicableProfessions: [...current, profession] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration) || null,
      };
      if (id) {
        await api.put(`/training/${id}`, payload);
        toast.success('Training updated successfully');
      } else {
        await api.post('/training', payload);
        toast.success('Training created successfully');
      }
      navigate('/training');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save training');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/training"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {id ? 'Edit Training' : 'Add New Training'}
          </h2>
          <p className="text-gray-500">{id ? 'Update training details' : 'Create a new training module'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Title *
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
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., plumbing-basics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL
            </label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date
            </label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Professions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {professions.map((prof) => (
              <label key={prof} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(formData.applicableProfessions || []).includes(prof)}
                  onChange={() => handleProfessionToggle(prof)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                {prof}
              </label>
            ))}
            {professions.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full">No professions available</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Required Training</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Training'}
          </button>
          <Link
            to="/training"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TrainingForm;