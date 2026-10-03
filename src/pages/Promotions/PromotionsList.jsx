import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiCalendar,
  FiPercent,
  FiDollarSign,
  FiEye,
  FiX,
  FiCode,
  FiCheckCircle,
  FiXCircle,
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

  const [selectedPromotion, setSelectedPromotion] =
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
  // FETCH PROMOTIONS
  // ============================================================

  useEffect(() => {
    fetchPromotions();
  }, [filters]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);

      console.log(
        'GET PROMOTIONS REQUEST:',
        filters
      );

      const response = await api.get(
        '/promotions/admin/all',
        {
          params: filters,
        }
      );

      console.log(
        'GET PROMOTIONS FULL RESPONSE:',
        response.data
      );

      const responseData =
        response.data;

      const data =
        responseData?.data;

      console.log(
        'PROMOTIONS DATA:',
        data
      );

      // ========================================================
      // HANDLE DIFFERENT RESPONSE STRUCTURES
      // ========================================================

      let promotionItems = [];

      if (
        Array.isArray(
          data?.rows
        )
      ) {
        promotionItems =
          data.rows;
      } else if (
        Array.isArray(
          data?.items
        )
      ) {
        promotionItems =
          data.items;
      } else if (
        Array.isArray(data)
      ) {
        promotionItems =
          data;
      } else if (
        Array.isArray(
          responseData?.rows
        )
      ) {
        promotionItems =
          responseData.rows;
      } else if (
        Array.isArray(
          responseData?.items
        )
      ) {
        promotionItems =
          responseData.items;
      }

      // ========================================================
      // LATEST FIRST
      // ========================================================

      promotionItems =
        [...promotionItems].sort(
          (a, b) => {
            const dateA = new Date(
              a.createdAt || 0
            ).getTime();

            const dateB = new Date(
              b.createdAt || 0
            ).getTime();

            return dateB - dateA;
          }
        );

      console.log(
        'FINAL PROMOTIONS:',
        promotionItems
      );

      setPromotions(
        promotionItems
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
          promotionItems.length,

        itemsPerPage:
          Number(
            data?.itemsPerPage
          ) || 10,
      });

    } catch (error) {
      console.error(
        'GET PROMOTIONS ERROR:',
        error
      );

      console.error(
        'ERROR RESPONSE:',
        error.response?.data
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to fetch promotions'
      );

      setPromotions([]);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW PROMOTION
  // ============================================================

  const handleView = async (
    promotion
  ) => {
    try {
      // Show current row immediately
      setSelectedPromotion(
        promotion
      );

      setShowViewModal(true);

      // Fetch complete promotion
      const response =
        await api.get(
          `/promotions/${promotion.id}`
        );

      console.log(
        'PROMOTION DETAILS:',
        response.data
      );

      if (
        response.data?.data
      ) {
        setSelectedPromotion(
          response.data.data
        );
      }

    } catch (error) {
      console.error(
        'GET PROMOTION DETAILS ERROR:',
        error.response?.data ||
          error
      );

      // If active-only endpoint rejects an expired
      // promotion, keep the row data.
    }
  };

  // ============================================================
  // CLOSE VIEW
  // ============================================================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedPromotion(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    id
  ) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this promotion?'
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/promotions/${id}`
      );

      toast.success(
        'Promotion deleted successfully'
      );

      closeViewModal();

      fetchPromotions();

    } catch (error) {
      console.error(
        'DELETE PROMOTION ERROR:',
        error.response?.data ||
          error
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to delete promotion'
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
  // ACTIVE STATUS
  // ============================================================

  const isActive = (
    promotion
  ) => {
    if (
      !promotion ||
      !promotion.isActive
    ) {
      return false;
    }

    const now =
      new Date();

    const start =
      new Date(
        promotion.startDate
      );

    const end =
      new Date(
        promotion.endDate
      );

    return (
      !Number.isNaN(
        start.getTime()
      ) &&
      !Number.isNaN(
        end.getTime()
      ) &&
      start <= now &&
      end >= now
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'N/A';
    }

    return format(
      parsedDate,
      'dd MMM yyyy'
    );
  };

  // ============================================================
  // FORMAT DATETIME
  // ============================================================

  const formatDateTime = (
    date
  ) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'N/A';
    }

    return format(
      parsedDate,
      'dd MMM yyyy, hh:mm a'
    );
  };

  // ============================================================
  // FORMAT APPLICABLE TO
  // ============================================================

  const formatApplicableTo = (
    value
  ) => {
    if (!value) {
      return 'All Users';
    }

    const map = {
      all: 'All Users',
      user: 'Users Only',
      worker: 'Workers Only',
    };

    return (
      map[
        String(value).toLowerCase()
      ] ||
      String(value)
    );
  };

  // ============================================================
  // FORMAT SERVICE IDS
  // ============================================================

  const getServiceIds = (
    promotion
  ) => {
    if (
      !Array.isArray(
        promotion?.applicableServiceIds
      )
    ) {
      return [];
    }

    return promotion.applicableServiceIds;
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
            Promotions
          </h2>

          <p className="text-gray-500">
            Manage discounts and promotional offers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          <SearchBar
            onSearch={
              handleSearch
            }
            placeholder="Search promotions..."
          />

          <Link
            to="/promotions/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
          >
            <FiPlus />
            Add Promotion
          </Link>

        </div>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            {/* HEADER */}

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Promotion
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Code
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Discount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Validity
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Applicable To
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Services
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>

              </tr>

            </thead>

            {/* BODY */}

            <tbody className="divide-y divide-gray-100">

              {promotions.map(
                (promotion) => {

                  const active =
                    isActive(
                      promotion
                    );

                  const serviceIds =
                    getServiceIds(
                      promotion
                    );

                  return (
                    <tr
                      key={
                        promotion.id
                      }
                      className="hover:bg-gray-50 transition"
                    >

                      {/* PROMOTION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {promotion.image ? (

                            <img
                              src={
                                promotion.image
                              }
                              alt={
                                promotion.title ||
                                'Promotion'
                              }
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />

                          ) : (

                            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">

                              <FiTag className="w-5 h-5 text-primary-500" />

                            </div>

                          )}

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-800 truncate max-w-[220px]">
                              {promotion.title ||
                                'Untitled Promotion'}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              ID: #
                              {
                                promotion.id
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CODE */}

                      <td className="px-5 py-4">

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">

                          <FiCode className="text-gray-500" />

                          <span className="font-semibold text-gray-700">
                            {promotion.code ||
                              'N/A'}
                          </span>

                        </div>

                      </td>

                      {/* DISCOUNT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          {promotion.discountType ===
                          'percentage' ? (

                            <FiPercent className="text-primary-500" />

                          ) : (

                            <FiDollarSign className="text-primary-500" />

                          )}

                          <span className="font-semibold text-gray-800">

                            {promotion.discountValue}

                            {promotion.discountType ===
                            'percentage'
                              ? '%'
                              : ' ₹'}

                          </span>

                        </div>

                      </td>

                      {/* VALIDITY */}

                      <td className="px-5 py-4">

                        <div className="flex items-start gap-2">

                          <FiCalendar className="text-gray-400 mt-0.5" />

                          <div>

                            <p className="text-sm text-gray-700">
                              {formatDate(
                                promotion.startDate
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              to{' '}
                              {formatDate(
                                promotion.endDate
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* APPLICABLE */}

                      <td className="px-5 py-4">

                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {formatApplicableTo(
                            promotion.applicableTo
                          )}
                        </span>

                      </td>

                      {/* SERVICES */}

                      <td className="px-5 py-4">

                        {serviceIds.length >
                        0 ? (

                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                            {
                              serviceIds.length
                            }{' '}
                            service
                            {serviceIds.length !==
                            1
                              ? 's'
                              : ''}
                          </span>

                        ) : (

                          <span className="text-xs text-gray-400">
                            All Services
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {active ? (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">

                            <FiCheckCircle />

                            Active

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">

                            <FiXCircle />

                            Inactive

                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                promotion
                              )
                            }
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="View promotion"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {/* EDIT */}

                          <Link
                            to={`/promotions/${promotion.id}/edit`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit promotion"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                promotion.id
                              )
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete promotion"
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
            NO DATA
        ==================================================== */}

        {promotions.length === 0 && (

          <div className="py-16 text-center">

            <FiTag className="w-10 h-10 mx-auto text-gray-300 mb-3" />

            <h3 className="text-lg font-semibold text-gray-700">
              No promotions found
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Create your first promotion to get started.
            </p>

            <Link
              to="/promotions/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <FiPlus />
              Add Promotion
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
        selectedPromotion && (

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

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {selectedPromotion.image ? (

                    <img
                      src={
                        selectedPromotion.image
                      }
                      alt={
                        selectedPromotion.title
                      }
                      className="w-12 h-12 rounded-xl object-cover"
                    />

                  ) : (

                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">

                      <FiTag className="w-6 h-6 text-primary-500" />

                    </div>

                  )}

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">
                      {
                        selectedPromotion.title
                      }
                    </h2>

                    <p className="text-sm text-gray-500">
                      Promotion ID: #
                      {
                        selectedPromotion.id
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

              {/* =================================================
                  MODAL CONTENT
              ================================================= */}

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">

                {/* BASIC DETAILS */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Promotion Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* ID */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Promotion ID
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        #
                        {
                          selectedPromotion.id
                        }
                      </p>

                    </div>

                    {/* CODE */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Promotion Code
                      </p>

                      <p className="font-semibold text-primary-600 mt-1">
                        {
                          selectedPromotion.code ||
                          'N/A'
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
                          selectedPromotion.title ||
                          'N/A'
                        }
                      </p>

                    </div>

                    {/* DISCOUNT TYPE */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Discount Type
                      </p>

                      <p className="font-semibold text-gray-800 mt-1 capitalize">
                        {
                          selectedPromotion.discountType ||
                          'N/A'
                        }
                      </p>

                    </div>

                    {/* DISCOUNT */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Discount Value
                      </p>

                      <p className="font-semibold text-primary-600 text-lg mt-1">

                        {
                          selectedPromotion.discountValue
                        }

                        {selectedPromotion.discountType ===
                        'percentage'
                          ? '%'
                          : ' ₹'}

                      </p>

                    </div>

                    {/* APPLICABLE */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Applicable To
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatApplicableTo(
                          selectedPromotion.applicableTo
                        )}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      {isActive(
                        selectedPromotion
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

                    {/* START */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Start Date
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          selectedPromotion.startDate
                        )}
                      </p>

                    </div>

                    {/* END */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        End Date
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          selectedPromotion.endDate
                        )}
                      </p>

                    </div>

                    {/* CREATED */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Created At
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDateTime(
                          selectedPromotion.createdAt
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
                          selectedPromotion.updatedAt
                        )}
                      </p>

                    </div>

                    {/* USED COUNT */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Used Count
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {
                          selectedPromotion.usedCount ??
                          0
                        }
                      </p>

                    </div>

                    {/* MAX USES */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        Maximum Uses
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {
                          selectedPromotion.maxUses ??
                          'Unlimited'
                        }
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
                        selectedPromotion.description ||
                        'No description available.'
                      }
                    </p>

                  </div>

                </div>

                {/* SERVICES */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Applicable Services
                  </h3>

                  {getServiceIds(
                    selectedPromotion
                  ).length > 0 ? (

                    <div className="flex flex-wrap gap-2">

                      {getServiceIds(
                        selectedPromotion
                      ).map(
                        (serviceId) => (

                          <span
                            key={
                              serviceId
                            }
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                          >
                            Service #
                            {
                              serviceId
                            }
                          </span>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-gray-500">
                        This promotion applies to all services.
                      </p>

                    </div>

                  )}

                </div>

                {/* IMAGE */}

                {selectedPromotion.image && (

                  <div className="mb-6">

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Promotion Image
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">

                      <img
                        src={
                          selectedPromotion.image
                        }
                        alt={
                          selectedPromotion.title
                        }
                        className="max-h-64 rounded-lg object-contain"
                      />

                    </div>

                  </div>

                )}

                {/* RAW DATA */}

                <details className="border border-gray-200 rounded-lg">

                  <summary className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                    View Complete JSON Data
                  </summary>

                  <div className="p-4 bg-gray-900 rounded-b-lg overflow-auto">

                    <pre className="text-xs text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(
                        selectedPromotion,
                        null,
                        2
                      )}
                    </pre>

                  </div>

                </details>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedPromotion.id
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
                    to={`/promotions/${selectedPromotion.id}/edit`}
                    onClick={
                      closeViewModal
                    }
                    className="px-5 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition flex items-center gap-2"
                  >
                    <FiEdit2 />
                    Edit Promotion
                  </Link>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default PromotionsList;