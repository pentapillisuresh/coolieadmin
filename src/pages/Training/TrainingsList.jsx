import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiVideo,
  FiClock,
  FiUsers,
  FiEye,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../api';
import Loader from '../../components/Common/Loader';
import SearchBar from '../../components/Common/SearchBar';
import Pagination from '../../components/Common/Pagination';

const TrainingsList = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTraining, setSelectedTraining] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  // ============================================================
  // FETCH TRAININGS
  // ============================================================

  useEffect(() => {
    fetchTrainings();
  }, [filters]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);

      console.log(
        'GET TRAININGS REQUEST:',
        filters
      );

      const response = await api.get(
        '/training',
        {
          params: filters,
        }
      );

      console.log(
        'GET TRAININGS FULL RESPONSE:',
        response.data
      );

      const responseData =
        response.data;

      const data =
        responseData?.data;

      console.log(
        'TRAINING DATA:',
        data
      );

      // ========================================================
      // HANDLE ALL COMMON RESPONSE STRUCTURES
      // ========================================================

      let trainingItems = [];

      if (
        Array.isArray(data?.rows)
      ) {
        trainingItems =
          data.rows;
      } else if (
        Array.isArray(data?.items)
      ) {
        trainingItems =
          data.items;
      } else if (
        Array.isArray(data)
      ) {
        trainingItems =
          data;
      } else if (
        Array.isArray(
          responseData?.rows
        )
      ) {
        trainingItems =
          responseData.rows;
      } else if (
        Array.isArray(
          responseData?.items
        )
      ) {
        trainingItems =
          responseData.items;
      }

      // ========================================================
      // LATEST FIRST
      // ========================================================

      trainingItems =
        [...trainingItems].sort(
          (a, b) => {

            const dateA =
              new Date(
                a.createdAt || 0
              ).getTime();

            const dateB =
              new Date(
                b.createdAt || 0
              ).getTime();

            return dateB - dateA;
          }
        );

      console.log(
        'FINAL TRAININGS:',
        trainingItems
      );

      setTrainings(
        trainingItems
      );

      // ========================================================
      // PAGINATION
      // ========================================================

      setPagination({
        currentPage:
          Number(
            data?.currentPage
          ) || 1,

        totalPages:
          Number(
            data?.totalPages
          ) || 1,

        totalItems:
          Number(
            data?.totalItems
          ) ||
          trainingItems.length,

        itemsPerPage:
          Number(
            data?.itemsPerPage
          ) || 10,
      });

    } catch (error) {

      console.error(
        'GET TRAININGS ERROR:',
        error
      );

      console.error(
        'TRAINING ERROR RESPONSE:',
        error.response?.data
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to fetch trainings'
      );

      setTrainings([]);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW TRAINING
  // ============================================================

  const handleView = async (
    training
  ) => {

    // Show existing row data immediately
    setSelectedTraining(
      training
    );

    setShowViewModal(true);

    // Try to get complete details
    try {

      const response =
        await api.get(
          `/training/${training.id}`
        );

      console.log(
        'TRAINING DETAILS RESPONSE:',
        response.data
      );

      if (
        response.data?.data
      ) {
        setSelectedTraining(
          response.data.data
        );
      }

    } catch (error) {

      console.log(
        'TRAINING DETAIL API ERROR:',
        error.response?.data ||
          error
      );

      // Keep the existing row data
      // if detail endpoint does not exist.
    }
  };

  // ============================================================
  // CLOSE VIEW
  // ============================================================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedTraining(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    id
  ) => {

    if (
      !window.confirm(
        'Are you sure you want to delete this training?'
      )
    ) {
      return;
    }

    try {

      await api.delete(
        `/training/${id}`
      );

      toast.success(
        'Training deleted successfully'
      );

      closeViewModal();

      fetchTrainings();

    } catch (error) {

      console.error(
        'DELETE TRAINING ERROR:',
        error.response?.data ||
          error
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to delete training'
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (
    query
  ) => {

    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: query || '',
    }));
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePageChange = (
    page
  ) => {

    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    value
  ) => {

    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return format(
      date,
      'dd MMM yyyy'
    );
  };

  // ============================================================
  // FORMAT DATETIME
  // ============================================================

  const formatDateTime = (
    value
  ) => {

    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return format(
      date,
      'dd MMM yyyy, hh:mm a'
    );
  };

  // ============================================================
  // GET VIDEOS
  // ============================================================

  const getVideos = (
    training
  ) => {

    if (
      Array.isArray(
        training?.TrainingVideos
      )
    ) {
      return training.TrainingVideos;
    }

    if (
      Array.isArray(
        training?.trainingVideos
      )
    ) {
      return training.trainingVideos;
    }

    if (
      Array.isArray(
        training?.videos
      )
    ) {
      return training.videos;
    }

    return [];
  };

  // ============================================================
  // GET PROFESSIONS
  // ============================================================

  const getProfessions = (
    training
  ) => {

    if (
      Array.isArray(
        training?.applicableProfessions
      )
    ) {
      return training.applicableProfessions;
    }

    if (
      typeof training?.applicableProfessions ===
      'string'
    ) {

      try {

        const parsed =
          JSON.parse(
            training.applicableProfessions
          );

        if (
          Array.isArray(parsed)
        ) {
          return parsed;
        }

      } catch (error) {
        return training.applicableProfessions
          .split(',')
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);
      }
    }

    return [];
  };

  // ============================================================
  // ACTIVE STATUS
  // ============================================================

  const isTrainingActive = (
    training
  ) => {

    return Boolean(
      training?.isActive
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <Loader />;
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Training
          </h2>

          <p className="text-gray-500">
            Manage worker training modules
          </p>

        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          <SearchBar
            onSearch={
              handleSearch
            }
            placeholder="Search trainings..."
          />

          <Link
            to="/training/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
          >
            <FiPlus />
            Add Training
          </Link>

        </div>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Training
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Level
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Duration
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Videos
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Professions
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {trainings.map(
                (training) => {

                  const videos =
                    getVideos(
                      training
                    );

                  const professions =
                    getProfessions(
                      training
                    );

                  const active =
                    isTrainingActive(
                      training
                    );

                  return (

                    <tr
                      key={
                        training.id
                      }
                      className="hover:bg-gray-50 transition"
                    >

                      {/* TRAINING */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {training.thumbnail ? (

                            <img
                              src={
                                training.thumbnail
                              }
                              alt={
                                training.title ||
                                'Training'
                              }
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />

                          ) : (

                            <div className="w-14 h-14 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">

                              <FiBookOpen className="w-6 h-6 text-primary-500" />

                            </div>

                          )}

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-800 truncate max-w-[250px]">
                              {training.title ||
                                'Untitled Training'}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              ID: #
                              {
                                training.id
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* LEVEL */}

                      <td className="px-5 py-4">

                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                          {training.level ||
                            'Beginner'}
                        </span>

                      </td>

                      {/* DURATION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <FiClock className="text-gray-400" />

                          {training.duration
                            ? `${training.duration} min`
                            : 'N/A'}

                        </div>

                      </td>

                      {/* VIDEOS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <FiVideo className="text-primary-500" />

                          <span className="text-sm font-medium text-gray-700">
                            {
                              videos.length
                            }
                          </span>

                        </div>

                      </td>

                      {/* PROFESSIONS */}

                      <td className="px-5 py-4">

                        {professions.length >
                        0 ? (

                          <div className="flex flex-wrap gap-1 max-w-[220px]">

                            {professions
                              .slice(
                                0,
                                2
                              )
                              .map(
                                (
                                  profession
                                ) => (

                                  <span
                                    key={
                                      profession
                                    }
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    {
                                      profession
                                    }
                                  </span>

                                )
                              )}

                            {professions.length >
                              2 && (

                              <span className="text-xs text-gray-400">
                                +
                                {
                                  professions.length -
                                  2
                                }
                              </span>

                            )}

                          </div>

                        ) : (

                          <span className="text-xs text-gray-400">
                            All
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {active ? (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">

                            <FiCheckCircle />

                            Active

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">

                            <FiXCircle />

                            Inactive

                          </span>

                        )}

                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <FiCalendar className="text-gray-400" />

                          {formatDate(
                            training.createdAt
                          )}

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                training
                              )
                            }
                            title="View training"
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          >

                            <FiEye className="w-4 h-4" />

                          </button>

                          {/* EDIT */}

                          <Link
                            to={`/training/${training.id}/edit`}
                            title="Edit training"
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >

                            <FiEdit2 className="w-4 h-4" />

                          </Link>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                training.id
                              )
                            }
                            title="Delete training"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >

                            <FiTrash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {trainings.length === 0 && (

          <div className="py-16 text-center">

            <FiBookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />

            <h3 className="text-lg font-semibold text-gray-700">
              No trainings found
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Create your first training module to get started.
            </p>

            <Link
              to="/training/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >

              <FiPlus />

              Add Training

            </Link>

          </div>

        )}

      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {pagination.totalPages > 1 && (

        <Pagination
          currentPage={
            pagination.currentPage
          }
          totalPages={
            pagination.totalPages
          }
          onPageChange={
            handlePageChange
          }
        />

      )}

      {/* ======================================================
          VIEW MODAL
      ====================================================== */}

      {showViewModal &&
        selectedTraining && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={
              closeViewModal
            }
          >

            <div
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {selectedTraining.thumbnail ? (

                    <img
                      src={
                        selectedTraining.thumbnail
                      }
                      alt={
                        selectedTraining.title
                      }
                      className="w-14 h-14 rounded-xl object-cover"
                    />

                  ) : (

                    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center">

                      <FiBookOpen className="w-7 h-7 text-primary-500" />

                    </div>

                  )}

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">
                      {
                        selectedTraining.title ||
                        'Training Details'
                      }
                    </h2>

                    <p className="text-sm text-gray-500">
                      Training ID: #
                      {
                        selectedTraining.id
                      }
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeViewModal
                  }
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >

                  <FiX className="w-6 h-6" />

                </button>

              </div>

              {/* MODAL CONTENT */}

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-145px)]">

                {/* DETAILS */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Training Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* ID */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Training ID
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        #
                        {
                          selectedTraining.id
                        }
                      </p>

                    </div>

                    {/* TITLE */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Title
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {
                          selectedTraining.title ||
                          'N/A'
                        }
                      </p>

                    </div>

                    {/* LEVEL */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Level
                      </p>

                      <p className="font-semibold text-gray-800 mt-1 capitalize">
                        {
                          selectedTraining.level ||
                          'Beginner'
                        }
                      </p>

                    </div>

                    {/* DURATION */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Duration
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedTraining.duration
                          ? `${selectedTraining.duration} minutes`
                          : 'N/A'}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      {isTrainingActive(
                        selectedTraining
                      ) ? (

                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">

                          <FiCheckCircle />

                          Active

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">

                          <FiXCircle />

                          Inactive

                        </span>

                      )}

                    </div>

                    {/* VIDEOS */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Videos
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {
                          getVideos(
                            selectedTraining
                          ).length
                        }
                      </p>

                    </div>

                    {/* CREATED */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Created At
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          selectedTraining.createdAt
                        )}
                      </p>

                    </div>

                    {/* UPDATED */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Updated At
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          selectedTraining.updatedAt
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Description
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-gray-700 whitespace-pre-wrap">
                      {
                        selectedTraining.description ||
                        'No description available.'
                      }
                    </p>

                  </div>

                </div>

                {/* PROFESSIONS */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Applicable Professions
                  </h3>

                  {getProfessions(
                    selectedTraining
                  ).length > 0 ? (

                    <div className="flex flex-wrap gap-2">

                      {getProfessions(
                        selectedTraining
                      ).map(
                        (
                          profession,
                          index
                        ) => (

                          <span
                            key={`${profession}-${index}`}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                          >
                            {
                              profession
                            }
                          </span>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-gray-500">
                        No specific professions assigned.
                      </p>

                    </div>

                  )}

                </div>

                {/* VIDEOS */}

                <div className="mb-6">

                  <div className="flex items-center justify-between mb-3">

                    <h3 className="text-lg font-semibold text-gray-800">
                      Training Videos
                    </h3>

                    <span className="text-sm text-gray-400">
                      {
                        getVideos(
                          selectedTraining
                        ).length
                      } videos
                    </span>

                  </div>

                  {getVideos(
                    selectedTraining
                  ).length > 0 ? (

                    <div className="space-y-3">

                      {getVideos(
                        selectedTraining
                      ).map(
                        (
                          video,
                          index
                        ) => (

                          <div
                            key={
                              video.id ||
                              index
                            }
                            className="border border-gray-200 rounded-lg p-4"
                          >

                            <div className="flex items-start gap-3">

                              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">

                                <FiVideo className="text-primary-500" />

                              </div>

                              <div className="flex-1 min-w-0">

                                <p className="font-medium text-gray-800">

                                  {video.title ||
                                    video.name ||
                                    `Video ${index + 1}`}

                                </p>

                                {video.description && (

                                  <p className="text-sm text-gray-500 mt-1">
                                    {
                                      video.description
                                    }
                                  </p>

                                )}

                                {(video.videoUrl ||
                                  video.url) && (

                                  <a
                                    href={
                                      video.videoUrl ||
                                      video.url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700"
                                  >
                                    Open Video
                                  </a>

                                )}

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="bg-gray-50 rounded-lg p-6 text-center">

                      <FiVideo className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                      <p className="text-sm text-gray-400">
                        No training videos available.
                      </p>

                    </div>

                  )}

                </div>

                {/* THUMBNAIL */}

                {selectedTraining.thumbnail && (

                  <div className="mb-6">

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Thumbnail
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">

                      <img
                        src={
                          selectedTraining.thumbnail
                        }
                        alt={
                          selectedTraining.title ||
                          'Training'
                        }
                        className="max-h-72 rounded-lg object-contain mx-auto"
                      />

                    </div>

                  </div>

                )}

                {/* COMPLETE JSON */}

                <details className="border border-gray-200 rounded-lg">

                  <summary className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                    View Complete JSON Data
                  </summary>

                  <div className="p-4 bg-gray-900 rounded-b-lg overflow-auto">

                    <pre className="text-xs text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(
                        selectedTraining,
                        null,
                        2
                      )}
                    </pre>

                  </div>

                </details>

              </div>

              {/* MODAL FOOTER */}

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedTraining.id
                    )
                  }
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2"
                >

                  <FiTrash2 />

                  Delete

                </button>

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={
                      closeViewModal
                    }
                    className="px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition"
                  >
                    Close
                  </button>

                  <Link
                    to={`/training/${selectedTraining.id}/edit`}
                    onClick={
                      closeViewModal
                    }
                    className="px-5 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition flex items-center gap-2"
                  >

                    <FiEdit2 />

                    Edit Training

                  </Link>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default TrainingsList;