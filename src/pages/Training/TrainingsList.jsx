import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiVideo,
  FiClock,
  FiUsers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import SearchBar from '../../components/Common/SearchBar';
import Pagination from '../../components/Common/Pagination';

const TrainingsList = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchTrainings();
  }, [filters]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/training', { params: filters });
      const data = response.data.data;
      setTrainings(data.rows || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
        itemsPerPage: data.itemsPerPage || 10,
      });
    } catch (error) {
      toast.error('Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training?')) return;
    try {
      await api.delete(`/training/${id}`);
      toast.success('Training deleted successfully');
      fetchTrainings();
    } catch (error) {
      toast.error('Failed to delete training');
    }
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, page: 1, search: query });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Training</h2>
          <p className="text-gray-500">Manage worker training modules</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar onSearch={handleSearch} placeholder="Search trainings..." />
          <Link
            to="/training/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
          >
            <FiPlus /> Add Training
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainings.map((training) => (
          <div key={training.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            {training.thumbnail && (
              <img
                src={training.thumbnail}
                alt={training.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{training.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{training.description}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  training.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {training.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiBookOpen className="text-gray-400" />
                <span>Level: {training.level || 'Beginner'}</span>
              </div>
              {training.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiClock className="text-gray-400" />
                  <span>{training.duration} min</span>
                </div>
              )}
              {training.applicableProfessions && training.applicableProfessions.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <FiUsers className="text-gray-400 mt-0.5" />
                  <span className="flex flex-wrap gap-1">
                    {training.applicableProfessions.slice(0, 3).map((prof) => (
                      <span key={prof} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {prof}
                      </span>
                    ))}
                    {training.applicableProfessions.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{training.applicableProfessions.length - 3}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {training.TrainingVideos && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiVideo className="text-gray-400" />
                  <span>{training.TrainingVideos.length} videos</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
              <Link
                to={`/training/${training.id}/edit`}
                className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition text-center"
              >
                <FiEdit2 className="inline mr-1" /> Edit
              </Link>
              <button
                onClick={() => handleDelete(training.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                <FiTrash2 className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {trainings.length === 0 && (
        <div className="text-center py-12 text-gray-400">No trainings found</div>
      )}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TrainingsList;