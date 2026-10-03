import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiStar,
  FiCheck,
  FiX,
  FiBriefcase,
  FiMapPin,
  FiFileText,
  FiEye,
  FiExternalLink,
  FiRefreshCw,
  FiShield,
  FiClock,
  FiActivity,
  FiDollarSign,
  FiTrash2,
  FiCalendar,
  FiCreditCard,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../api';
import Loader from '../../components/Common/Loader';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('profile');

  const [verifyingWorker, setVerifyingWorker] = useState(false);
  const [verifyingBank, setVerifyingBank] = useState(false);
  const [deletingWorker, setDeletingWorker] = useState(false);

  // ============================================================
  // FETCH WORKER
  // ============================================================

useEffect(() => {
  if (!id) return;

  fetchWorkerData();
}, [id]);

const fetchWorkerData = async () => {
  if (!id) return;

  setLoading(true);
  setWorker(null);

  try {
    // ============================================
    // 1. LOAD WORKER DETAILS
    // ============================================

    const detailRes = await api.get(
      `/workers/admin/${id}/full`,
      {
        timeout: 15000,
      }
    );

    const workerData = detailRes?.data?.data;

    if (!workerData) {
      throw new Error('Worker details not found');
    }

    setWorker(workerData);

    // ============================================
    // IMPORTANT:
    // Stop main loader NOW.
    // Do not wait for earnings.
    // ============================================

    setLoading(false);

    // ============================================
    // 2. LOAD EARNINGS IN BACKGROUND
    // ============================================

    try {
      const statsRes = await api.get(
        `/earnings/admin/${id}/summary`,
        {
          timeout: 10000,
        }
      );

      setStats(
        statsRes?.data?.data || null
      );
    } catch (statsError) {
      console.error(
        'Worker earnings error:',
        statsError
      );

      setStats(null);
    }

  } catch (error) {
    console.error(
      'Worker details error:',
      error
    );

    setWorker(null);

    toast.error(
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      'Failed to fetch worker details'
    );

    setLoading(false);
  }
};

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchWorkerData();
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // VERIFY WORKER
  // ============================================================

  const handleVerify = async () => {
    if (!id || verifyingWorker) return;

    try {
      setVerifyingWorker(true);

      await api.put(
        `/workers/${id}/verify`
      );

      toast.success(
        'Worker verified successfully'
      );

      await fetchWorkerData();
    } catch (error) {
      console.error(
        'Worker verification error:',
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to verify worker'
      );
    } finally {
      setVerifyingWorker(false);
    }
  };

  // ============================================================
  // VERIFY BANK
  // ============================================================

  const handleVerifyBank = async () => {
    if (!id || verifyingBank) return;

    try {
      setVerifyingBank(true);

      await api.put(
        `/workers/${id}/bank/verify`
      );

      toast.success(
        'Bank details verified successfully'
      );

      await fetchWorkerData();
    } catch (error) {
      console.error(
        'Bank verification error:',
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to verify bank details'
      );
    } finally {
      setVerifyingBank(false);
    }
  };

  // ============================================================
  // DELETE WORKER
  // ============================================================

  const handleDelete = async () => {
    if (!id || deletingWorker) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this worker? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setDeletingWorker(true);

      await api.delete(
        `/workers/${id}`
      );

      toast.success(
        'Worker deleted successfully'
      );

      navigate('/workers', {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Delete worker error:',
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to delete worker'
      );
    } finally {
      setDeletingWorker(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';

    try {
      return format(
        new Date(date),
        'dd MMM yyyy'
      );
    } catch {
      return '—';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '—';

    try {
      return format(
        new Date(date),
        'dd MMM yyyy, hh:mm a'
      );
    } catch {
      return '—';
    }
  };

  const getDocumentTypeLabel = (type) => {
    if (!type) return 'Document';

    return String(type)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getWorkerStatus = () => {
    const status = worker?.status;

    if (status === 'working') {
      return {
        label: 'Working',
        icon: FiBriefcase,
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }

    if (status === 'active') {
      return {
        label: 'Available',
        icon: FiActivity,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }

    return {
      label: 'Inactive',
      icon: FiClock,
      className:
        'bg-gray-100 text-gray-600 border-gray-200',
      dot: 'bg-gray-400',
    };
  };

  const getDocumentUrl = (document) => {
    if (!document) return '#';

    return (
      document.fullUrl ||
      document.url ||
      document.filePath ||
      '#'
    );
  };

  const status = getWorkerStatus();
  const StatusIcon = status.icon;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!worker) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <FiUser className="text-2xl text-gray-400" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Worker not found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The worker details could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/workers')
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            <FiArrowLeft />
            Back to Workers
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // TABS
  // ============================================================

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: FiUser,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: FiBriefcase,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FiFileText,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: FiStar,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 pb-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <Link
            to="/workers"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-primary-200 hover:text-primary-600"
          >
            <FiArrowLeft />
          </Link>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-primary-500" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
                Workforce Management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Worker Details
            </h1>

            <p className="text-sm text-gray-500">
              View and manage worker information
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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
          PROFILE HEADER
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="p-6">

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

            {/* Worker identity */}

            <div className="flex items-start gap-4">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-50">
                <FiUser className="text-3xl text-primary-600" />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-bold text-gray-900">
                    {worker.User?.name ||
                      'Unnamed Worker'}
                  </h2>

                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    ID #{worker.id}
                  </span>

                </div>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  {worker.profession ||
                    'Profession not specified'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4">

                  <div className="flex items-center gap-1.5">
                    <FiStar className="fill-amber-400 text-amber-400" />

                    <span className="font-semibold text-gray-800">
                      {Number(
                        worker.rating || 0
                      ).toFixed(1)}
                    </span>

                    <span className="text-xs text-gray-400">
                      rating
                    </span>
                  </div>

                  <span className="h-4 w-px bg-gray-200" />

                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FiBriefcase />
                    <span>
                      {worker.totalJobs || 0}{' '}
                      jobs
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Actions */}

            <div className="flex flex-wrap items-center gap-2">

              {/* Verification */}

              {worker.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <FiCheck />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifyingWorker}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiCheck />

                  {verifyingWorker
                    ? 'Verifying...'
                    : 'Verify Worker'}
                </button>
              )}

              {/* Status */}

              <span
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${status.className}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                />

                <StatusIcon />

                {status.label}
              </span>

              {/* Delete */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingWorker}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiTrash2 />

                {deletingWorker
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        {stats && (
          <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50 md:grid-cols-4">

            <div className="border-b border-r border-gray-200 p-5 md:border-b-0">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <FiDollarSign className="text-emerald-600" />
              </div>

              <p className="text-xs font-medium text-gray-500">
                Total Earned
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(
                  stats.totalEarned
                )}
              </p>
            </div>

            <div className="border-b border-gray-200 p-5 md:border-b-0 md:border-r">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <FiClock className="text-amber-600" />
              </div>

              <p className="text-xs font-medium text-gray-500">
                Pending Payment
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(
                  stats.pendingPayment
                )}
              </p>
            </div>

            <div className="border-r border-gray-200 p-5">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                <FiCheck className="text-primary-600" />
              </div>

              <p className="text-xs font-medium text-gray-500">
                Completed Jobs
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {stats.completedJobs || 0}
              </p>
            </div>

            <div className="p-5">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <FiBriefcase className="text-gray-600" />
              </div>

              <p className="text-xs font-medium text-gray-500">
                Total Jobs
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {stats.totalJobs ||
                  worker.totalJobs ||
                  0}
              </p>
            </div>

          </div>
        )}

        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="overflow-x-auto border-t border-gray-200">

          <div className="flex min-w-max px-4 md:px-6">

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />

                  {tab.label}

                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            })}

          </div>
        </div>

        {/* ====================================================
            TAB CONTENT
        ==================================================== */}

        <div className="p-6">

          {/* ==================================================
              PROFILE
          ================================================== */}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Personal */}

              <div className="rounded-2xl border border-gray-200 p-5">

                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <FiUser className="text-primary-600" />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Personal Information
                    </h3>

                    <p className="text-xs text-gray-500">
                      Worker contact and profile
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-400">
                        Mobile
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {worker.User?.mobile ||
                          '—'}
                      </p>
                    </div>
                  </div>

                  {worker.User?.email && (
                    <div className="flex items-center gap-3">
                      <FiMail className="text-gray-400" />

                      <div>
                        <p className="text-xs text-gray-400">
                          Email
                        </p>

                        <p className="text-sm font-medium text-gray-800">
                          {worker.User.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <FiBriefcase className="text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-400">
                        Experience
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {worker.experience ||
                          0}{' '}
                        years
                      </p>
                    </div>
                  </div>

                  {(worker.latitude ||
                    worker.longitude) && (
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-gray-400" />

                      <div>
                        <p className="text-xs text-gray-400">
                          Location
                        </p>

                        <p className="text-sm font-medium text-gray-800">
                          {worker.latitude ||
                            '—'}
                          ,{' '}
                          {worker.longitude ||
                            '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {worker.description && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="mb-1 text-xs font-medium text-gray-400">
                        About
                      </p>

                      <p className="text-sm leading-6 text-gray-600">
                        {worker.description}
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Bank */}

              <div className="rounded-2xl border border-gray-200 p-5">

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                      <FiCreditCard className="text-gray-600" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Bank Details
                      </h3>

                      <p className="text-xs text-gray-500">
                        Worker payment information
                      </p>
                    </div>
                  </div>

                  {worker.BankDetail && (
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        worker.BankDetail.isVerified
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {worker.BankDetail.isVerified
                        ? 'Verified'
                        : 'Pending'}
                    </span>
                  )}

                </div>

                {worker.BankDetail ? (
                  <div className="space-y-4">

                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500">
                        Account Holder
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {
                          worker.BankDetail
                            .accountHolderName
                        }
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500">
                        Bank
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {
                          worker.BankDetail
                            .bankName
                        }
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500">
                        Account Number
                      </span>

                      <span className="font-mono text-sm font-semibold text-gray-800">
                        {
                          worker.BankDetail
                            .accountNumber
                        }
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500">
                        IFSC
                      </span>

                      <span className="font-mono text-sm font-semibold text-gray-800">
                        {
                          worker.BankDetail
                            .ifscCode
                        }
                      </span>
                    </div>

                    {worker.BankDetail
                      .upiId && (
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-sm text-gray-500">
                          UPI ID
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {
                            worker.BankDetail
                              .upiId
                          }
                        </span>
                      </div>
                    )}

                    {!worker.BankDetail
                      .isVerified && (
                      <button
                        type="button"
                        onClick={
                          handleVerifyBank
                        }
                        disabled={
                          verifyingBank
                        }
                        className="w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
                      >
                        {verifyingBank
                          ? 'Verifying...'
                          : 'Verify Bank Details'}
                      </button>
                    )}

                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 py-10 text-center">
                    <FiCreditCard className="mx-auto text-3xl text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No bank details added
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================================================
              JOBS
          ================================================== */}

          {activeTab === 'jobs' && (
            <div>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Assigned Jobs
                </h3>

                <p className="text-sm text-gray-500">
                  Jobs assigned to this worker
                </p>
              </div>

              {worker.Jobs &&
              worker.Jobs.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200">

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">

                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Booking
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Date
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Service
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Amount
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

                        {worker.Jobs.map(
                          (job) => (
                            <tr
                              key={job.id}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-5 py-4">
                                <span className="font-semibold text-gray-800">
                                  #
                                  {
                                    job.bookingId
                                  }
                                </span>
                              </td>

                              <td className="px-5 py-4 text-sm text-gray-500">
                                {formatDate(
                                  job.Booking
                                    ?.scheduledDate
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-medium text-gray-700">
                                  {job.Booking
                                    ?.Service
                                    ?.name ||
                                    'Service'}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-semibold text-gray-800">
                                  {formatCurrency(
                                    job.Booking
                                      ?.totalAmount
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                  {job.status ||
                                    '—'}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                {job.bookingId && (
                                  <Link
                                    to={`/bookings/${job.bookingId}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                                  >
                                    <FiEye />
                                    View
                                  </Link>
                                )}
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                  <FiBriefcase className="mx-auto text-4xl text-gray-300" />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    No jobs found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    No jobs are currently assigned to this worker.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ==================================================
              DOCUMENTS
          ================================================== */}

          {activeTab === 'documents' && (
            <div>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Worker Documents
                </h3>

                <p className="text-sm text-gray-500">
                  Review documents uploaded by this worker.
                </p>
              </div>

              {worker.Documents &&
              worker.Documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                  {worker.Documents.map(
                    (document) => {
                      const fileUrl =
                        getDocumentUrl(
                          document
                        );

                      return (
                        <div
                          key={
                            document.id
                          }
                          className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex min-w-0 items-start gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                                <FiFileText className="text-primary-600" />
                              </div>

                              <div className="min-w-0">

                                <h4 className="font-semibold text-gray-900">
                                  {getDocumentTypeLabel(
                                    document.documentType
                                  )}
                                </h4>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {document.fileName ||
                                    'Document'}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Uploaded:{' '}
                                  {formatDateTime(
                                    document.uploadedAt ||
                                      document.createdAt
                                  )}
                                </p>

                              </div>
                            </div>

                            {document.isVerified ? (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <FiCheck size={12} />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                <FiClock size={12} />
                                Pending
                              </span>
                            )}

                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                            <span className="text-xs text-gray-400">
                              Document ID #
                              {
                                document.id
                              }
                            </span>

                            {fileUrl !==
                            '#' ? (
                              <a
                                href={
                                  fileUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                              >
                                <FiEye />
                                View
                                <FiExternalLink
                                  size={
                                    12
                                  }
                                />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">
                                File unavailable
                              </span>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">

                  <FiFileText className="mx-auto text-4xl text-gray-300" />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    No documents uploaded
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    This worker has not uploaded any documents.
                  </p>

                </div>
              )}

            </div>
          )}

          {/* ==================================================
              REVIEWS
          ================================================== */}

          {activeTab === 'reviews' && (
            <div>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Worker Reviews
                </h3>

                <p className="text-sm text-gray-500">
                  Customer feedback and ratings.
                </p>
              </div>

              {worker.Reviews &&
              worker.Reviews.length > 0 ? (
                <div className="space-y-4">

                  {worker.Reviews.map(
                    (review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-gray-200 p-5"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                              <FiUser className="text-primary-600" />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.User
                                  ?.name ||
                                  'Anonymous'}
                              </p>

                              <p className="text-xs text-gray-400">
                                {formatDate(
                                  review.createdAt
                                )}
                              </p>
                            </div>

                          </div>

                          <div className="flex items-center gap-0.5">

                            {[...Array(5)].map(
                              (_, index) => (
                                <FiStar
                                  key={
                                    index
                                  }
                                  className={`h-4 w-4 ${
                                    index <
                                    Number(
                                      review.rating ||
                                        0
                                    )
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              )
                            )}

                          </div>

                        </div>

                        {review.comment && (
                          <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                            {review.comment}
                          </p>
                        )}

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">

                  <FiStar className="mx-auto text-4xl text-gray-300" />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    No reviews yet
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    This worker has not received any reviews.
                  </p>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WorkerDetail;