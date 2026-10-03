import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiStar,
  FiEye,
  FiCheck,
  FiBriefcase,
  FiFileText,
  FiShield,
  FiClock,
  FiActivity,
  FiXCircle,
  FiExternalLink,
  FiTrash2,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../../api';
import Loader from '../../components/Common/Loader';
import Pagination from '../../components/Common/Pagination';

const TABS = [
  {
    key: 'all',
    label: 'All Workers',
    icon: FiUser,
  },
  {
    key: 'pending',
    label: 'Pending Verification',
    icon: FiClock,
  },
  {
    key: 'verified',
    label: 'Verified',
    icon: FiShield,
  },
  {
    key: 'available',
    label: 'Available',
    icon: FiActivity,
  },
  {
    key: 'working',
    label: 'Working',
    icon: FiBriefcase,
  },
  {
    key: 'inactive',
    label: 'Inactive',
    icon: FiXCircle,
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: FiFileText,
  },
];

const WorkersList = () => {
  const [activeTab, setActiveTab] = useState('all');

  const [workers, setWorkers] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState('');

  const [profession, setProfession] =
    useState('');

  const [documentType, setDocumentType] =
    useState('');

  const [documentStatus, setDocumentStatus] =
    useState('');

  const [professions, setProfessions] =
    useState([]);

  const [workerPagination, setWorkerPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    });

  const [documentPagination, setDocumentPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    });

  // ============================================================
  // Load workers when worker-related tab/filter changes
  // ============================================================

  useEffect(() => {
    if (activeTab !== 'documents') {
      fetchWorkers();
    }
  }, [
    activeTab,
    search,
    profession,
    workerPagination.currentPage,
  ]);

  // ============================================================
  // Load documents when Documents tab is opened
  // ============================================================

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [
    activeTab,
    search,
    documentType,
    documentStatus,
    documentPagination.currentPage,
  ]);

  // ============================================================
  // Professions
  // ============================================================

  useEffect(() => {
    fetchProfessions();
  }, []);

  // ============================================================
  // Worker Tab Query
  // ============================================================

  const getWorkerFilters = () => {
    const params = {
      page: workerPagination.currentPage,
      limit: workerPagination.itemsPerPage,
      search: search || undefined,
      profession: profession || undefined,
    };

    switch (activeTab) {
      case 'pending':
        params.isVerified = 'false';
        break;

      case 'verified':
        params.isVerified = 'true';
        break;

      case 'available':
        params.isAvailable = 'true';
        break;

      case 'inactive':
        params.isAvailable = 'false';
        break;

      case 'working':
        params.status = 'working';
        break;

      default:
        break;
    }

    return params;
  };

  // ============================================================
  // Fetch Workers
  // ============================================================

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        '/workers',
        {
          params: getWorkerFilters(),
        }
      );

      const data =
        response?.data?.data || {};

      const items = Array.isArray(
        data.items
      )
        ? data.items
        : Array.isArray(data.rows)
        ? data.rows
        : [];

      setWorkers(items);

      setWorkerPagination(
        (previous) => ({
          ...previous,
          currentPage:
            Number(
              data.currentPage
            ) || 1,
          totalPages:
            Number(
              data.totalPages
            ) || 1,
          totalItems:
            Number(
              data.totalItems
            ) || 0,
          itemsPerPage:
            Number(
              data.itemsPerPage
            ) || previous.itemsPerPage,
        })
      );
    } catch (error) {
      console.error(
        'Workers error:',
        error
      );

      toast.error(
        error?.response?.data?.error ||
          'Failed to fetch workers'
      );

      setWorkers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Fetch Professions
  // ============================================================

  const fetchProfessions = async () => {
    try {
      const response =
        await api.get(
          '/workers/professions'
        );

      setProfessions(
        Array.isArray(
          response?.data?.data
        )
          ? response.data.data
          : []
      );
    } catch (error) {
      console.error(
        'Professions error:',
        error
      );
    }
  };

  // ============================================================
  // Fetch Documents
  // ============================================================

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);

      const params = {
        page:
          documentPagination.currentPage,
        limit:
          documentPagination.itemsPerPage,
        documentType:
          documentType || undefined,
      };

      if (documentStatus !== '') {
        params.isVerified =
          documentStatus;
      }

      const response =
        await api.get(
          '/documents',
          {
            params,
          }
        );

      const data =
        response?.data?.data || {};

      const items =
        Array.isArray(
          data.items
        )
          ? data.items
          : Array.isArray(
              data.rows
            )
          ? data.rows
          : [];

      // Client-side search because
      // backend document endpoint
      // does not expose a search parameter.
      const filteredItems =
        search.trim()
          ? items.filter(
              (document) => {
                const workerName =
                  document?.Worker
                    ?.User?.name ||
                  '';

                const mobile =
                  document?.Worker
                    ?.User?.mobile ||
                  '';

                const fileName =
                  document?.fileName ||
                  '';

                const query =
                  search
                    .toLowerCase()
                    .trim();

                return (
                  workerName
                    .toLowerCase()
                    .includes(query) ||
                  mobile
                    .toLowerCase()
                    .includes(query) ||
                  fileName
                    .toLowerCase()
                    .includes(query)
                );
              }
            )
          : items;

      setDocuments(
        filteredItems
      );

      setDocumentPagination(
        (previous) => ({
          ...previous,
          currentPage:
            Number(
              data.currentPage
            ) || 1,
          totalPages:
            Number(
              data.totalPages
            ) || 1,
          totalItems:
            Number(
              data.totalItems
            ) || 0,
          itemsPerPage:
            Number(
              data.itemsPerPage
            ) || previous.itemsPerPage,
        })
      );
    } catch (error) {
      console.error(
        'Documents error:',
        error
      );

      toast.error(
        error?.response?.data?.error ||
          'Failed to fetch documents'
      );

      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Verify Worker
  // ============================================================

  const handleVerifyWorker = async (
    id
  ) => {
    try {
      await api.put(
        `/workers/${id}/verify`
      );

      toast.success(
        'Worker verified successfully'
      );

      fetchWorkers();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          'Failed to verify worker'
      );
    }
  };

  // ============================================================
  // Verify Document
  // ============================================================

  const handleVerifyDocument = async (
    id
  ) => {
    try {
      await api.put(
        `/documents/${id}/verify`
      );

      toast.success(
        'Document verified successfully'
      );

      fetchDocuments();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          'Failed to verify document'
      );
    }
  };

  // ============================================================
  // Delete Document
  // ============================================================

  const handleDeleteDocument = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this document?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/documents/${id}`
      );

      toast.success(
        'Document deleted successfully'
      );

      fetchDocuments();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          'Failed to delete document'
      );
    }
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = () => {
    setRefreshing(true);

    if (
      activeTab === 'documents'
    ) {
      fetchDocuments();
    } else {
      fetchWorkers();
    }
  };

  // ============================================================
  // Tab Change
  // ============================================================

  const handleTabChange = (
    tab
  ) => {
    setActiveTab(tab);

    setSearch('');

    setProfession('');

    setDocumentType('');

    setDocumentStatus('');

    setWorkerPagination(
      (previous) => ({
        ...previous,
        currentPage: 1,
      })
    );

    setDocumentPagination(
      (previous) => ({
        ...previous,
        currentPage: 1,
      })
    );
  };

  // ============================================================
  // Worker Status
  // ============================================================

  const getWorkerStatus = (
    worker
  ) => {
    if (
      worker?.status ===
      'working'
    ) {
      return {
        label: 'Working',
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
        dot:
          'bg-amber-500',
      };
    }

    if (
      worker?.status ===
      'active'
    ) {
      return {
        label: 'Available',
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot:
          'bg-emerald-500',
      };
    }

    return {
      label: 'Inactive',
      className:
        'bg-gray-100 text-gray-600 border-gray-200',
      dot:
        'bg-gray-400',
    };
  };

  // ============================================================
  // Document Type Label
  // ============================================================

  const getDocumentTypeLabel = (
    type
  ) => {
    if (!type) {
      return '—';
    }

    return String(type)
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // ============================================================
  // Date Format
  // ============================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return '—';
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );
    } catch {
      return '—';
    }
  };

  // ============================================================
  // File URL
  // ============================================================

  const getFileUrl = (
    document
  ) => {
    return (
      document?.filePath ||
      document?.fullUrl ||
      document?.url ||
      '#'
    );
  };

  // ============================================================
  // Loading
  // ============================================================

  if (
    loading &&
    activeTab !== 'documents' &&
    workers.length === 0
  ) {
    return <Loader />;
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-6 w-1.5 rounded-full bg-primary-500" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
              Workforce Management
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Workers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage workers, verification,
            availability and documents from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing
          }
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary-200 hover:text-primary-600 disabled:opacity-50"
        >
          <FiRefreshCw
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex min-w-max">

          {TABS.map(
            (tab) => {
              const Icon =
                tab.icon;

              const active =
                activeTab ===
                tab.key;

              return (
                <button
                  key={
                    tab.key
                  }
                  type="button"
                  onClick={() =>
                    handleTabChange(
                      tab.key
                    )
                  }
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${
                    active
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    size={17}
                  />

                  {tab.label}

                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ======================================================
          WORKERS
      ====================================================== */}

      {activeTab !==
        'documents' && (
        <>
          {/* Filters */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

              {/* Search */}

              <div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search name, mobile or profession..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* Profession */}

              <select
                value={
                  profession
                }
                onChange={(
                  e
                ) => {
                  setProfession(
                    e.target
                      .value
                  );

                  setWorkerPagination(
                    (
                      previous
                    ) => ({
                      ...previous,
                      currentPage: 1,
                    })
                  );
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              >
                <option value="">
                  All Professions
                </option>

                {professions.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {/* Count */}

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-500">
                  Total Workers
                </span>

                <span className="text-lg font-bold text-gray-900">
                  {
                    workerPagination.totalItems
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Worker
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Profession
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Rating
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Jobs
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Verification
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {workers.map(
                    (
                      worker
                    ) => {
                      const status =
                        getWorkerStatus(
                          worker
                        );

                      return (
                        <tr
                          key={
                            worker.id
                          }
                          className="transition hover:bg-gray-50"
                        >

                          {/* Worker */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <FiUser className="text-lg text-gray-500" />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {worker
                                    .User
                                    ?.name ||
                                    'Unnamed Worker'}
                                </p>

                                <p className="text-xs text-gray-400">
                                  ID #
                                  {
                                    worker.id
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiPhone className="text-gray-400" />

                              {worker
                                .User
                                ?.mobile ||
                                '—'}
                            </div>
                          </td>

                          {/* Profession */}

                          <td className="px-5 py-4">

                            <span className="font-medium text-gray-700">
                              {worker.profession ||
                                '—'}
                            </span>

                            {worker.experience !==
                              undefined && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                {
                                  worker.experience
                                }{' '}
                                years experience
                              </p>
                            )}
                          </td>

                          {/* Rating */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-1">
                              <FiStar className="fill-amber-400 text-amber-400" />

                              <span className="font-semibold text-gray-800">
                                {Number(
                                  worker.rating ||
                                    0
                                ).toFixed(
                                  1
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Jobs */}

                          <td className="px-5 py-4">

                            <span className="font-semibold text-gray-800">
                              {worker.totalJobs ||
                                0}
                            </span>
                          </td>

                          {/* Verification */}

                          <td className="px-5 py-4">

                            {worker.isVerified ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <FiCheck size={12} />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                <FiClock size={12} />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />

                              {
                                status.label
                              }
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <Link
                                to={`/workers/${worker.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                              >
                                <FiEye />

                                View
                              </Link>

                              {!worker.isVerified && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerifyWorker(
                                      worker.id
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-600"
                                >
                                  <FiCheck />

                                  Verify
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>

              {workers.length ===
                0 && (
                <div className="py-16 text-center">

                  <FiUser className="mx-auto text-4xl text-gray-300" />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    No workers found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}

          {workerPagination.totalPages >
            1 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
              <Pagination
                currentPage={
                  workerPagination.currentPage
                }
                totalPages={
                  workerPagination.totalPages
                }
                onPageChange={(
                  page
                ) =>
                  setWorkerPagination(
                    (
                      previous
                    ) => ({
                      ...previous,
                      currentPage:
                        page,
                    })
                  )
                }
              />
            </div>
          )}
        </>
      )}

      {/* ======================================================
          DOCUMENTS TAB
      ====================================================== */}

      {activeTab ===
        'documents' && (
        <>
          {/* Document filters */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

              {/* Search */}

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target
                        .value
                    )
                  }
                  placeholder="Search worker or file..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* Document type */}

              <select
                value={
                  documentType
                }
                onChange={(
                  e
                ) => {
                  setDocumentType(
                    e.target
                      .value
                  );

                  setDocumentPagination(
                    (
                      previous
                    ) => ({
                      ...previous,
                      currentPage: 1,
                    })
                  );
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              >
                <option value="">
                  All Document Types
                </option>

                <option value="aadhaar">
                  Aadhaar
                </option>

                <option value="pan">
                  PAN
                </option>

                <option value="driving_license">
                  Driving License
                </option>

                <option value="address_proof">
                  Address Proof
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              {/* Verification */}

              <select
                value={
                  documentStatus
                }
                onChange={(
                  e
                ) => {
                  setDocumentStatus(
                    e.target
                      .value
                  );

                  setDocumentPagination(
                    (
                      previous
                    ) => ({
                      ...previous,
                      currentPage: 1,
                    })
                  );
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              >
                <option value="">
                  All Document Status
                </option>

                <option value="false">
                  Pending
                </option>

                <option value="true">
                  Verified
                </option>
              </select>
            </div>
          </div>

          {/* Document table */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="font-bold text-gray-900">
                  Worker Documents
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Verify worker documents from the same Workers section.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                {
                  documentPagination.totalItems
                } Documents
              </div>
            </div>

            {documentsLoading ? (
              <div className="py-16">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Worker
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Document
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        File
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Uploaded
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {documents.map(
                      (
                        document
                      ) => {

                        const worker =
                          document
                            ?.Worker;

                        const user =
                          worker
                            ?.User;

                        const fileUrl =
                          getFileUrl(
                            document
                          );

                        return (
                          <tr
                            key={
                              document.id
                            }
                            className="transition hover:bg-gray-50"
                          >

                            {/* Worker */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                  <FiUser className="text-gray-500" />
                                </div>

                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {user?.name ||
                                      'Unknown Worker'}
                                  </p>

                                  <p className="text-xs text-gray-400">
                                    {user?.mobile ||
                                      '—'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Document */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                                  <FiFileText className="text-primary-600" />
                                </div>

                                <span className="font-semibold text-gray-700">
                                  {getDocumentTypeLabel(
                                    document.documentType
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* File */}

                            <td className="px-5 py-4">

                              <div className="max-w-[250px]">

                                <p className="truncate text-sm font-medium text-gray-700">
                                  {document.fileName ||
                                    'Document'}
                                </p>

                                {fileUrl !==
                                  '#' && (
                                  <a
                                    href={
                                      fileUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                                  >
                                    <FiExternalLink />

                                    Open document
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Status */}

                            <td className="px-5 py-4">

                              {document.isVerified ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  <FiCheck size={12} />

                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  <FiClock size={12} />

                                  Pending
                                </span>
                              )}
                            </td>

                            {/* Uploaded */}

                            <td className="px-5 py-4 text-sm text-gray-500">
                              {formatDate(
                                document.uploadedAt ||
                                  document.createdAt
                              )}
                            </td>

                            {/* Actions */}

                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                {fileUrl !==
                                  '#' && (
                                  <a
                                    href={
                                      fileUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                                  >
                                    <FiEye />

                                    View
                                  </a>
                                )}

                                {!document.isVerified && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVerifyDocument(
                                        document.id
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <FiCheck />

                                    Verify
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteDocument(
                                      document.id
                                    )
                                  }
                                  className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                                  title="Delete document"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

                {documents.length ===
                  0 && (
                  <div className="py-16 text-center">

                    <FiFileText className="mx-auto text-4xl text-gray-300" />

                    <h3 className="mt-3 font-semibold text-gray-800">
                      No documents found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      No worker documents match the selected filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Document Pagination */}

            {!documentsLoading &&
              documentPagination.totalPages >
                1 && (
                <div className="border-t border-gray-100 px-5 py-4">

                  <Pagination
                    currentPage={
                      documentPagination.currentPage
                    }
                    totalPages={
                      documentPagination.totalPages
                    }
                    onPageChange={(
                      page
                    ) =>
                      setDocumentPagination(
                        (
                          previous
                        ) => ({
                          ...previous,
                          currentPage:
                            page,
                        })
                      )
                    }
                  />
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkersList;