import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiSettings,
  FiEye,
  FiX,
  FiCalendar,
  FiClock,
  FiTag,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiList,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../../api';
import Loader from '../../components/Common/Loader';
import SearchBar from '../../components/Common/SearchBar';
import Pagination from '../../components/Common/Pagination';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] =
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

  useEffect(() => {
    fetchServices();
  }, [filters]);

  // ==========================================
  // FETCH SERVICES
  // ==========================================

  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await api.get('/services', {
        params: filters,
      });

      console.log(
        'SERVICES API RESPONSE:',
        response.data
      );

      const data = response.data?.data;

      if (!data) {
        setServices([]);
        return;
      }

      // Backend returns:
      // data.items

      let items = Array.isArray(data.items)
        ? data.items
        : [];

      // ========================================
      // LATEST FIRST
      // ========================================

      items = [...items].sort((a, b) => {
        const dateA = new Date(
          a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });

      setServices(items);

      setPagination({
        currentPage:
          Number(data.currentPage) || 1,

        totalPages:
          Number(data.totalPages) || 1,

        totalItems:
          Number(data.totalItems) || 0,

        itemsPerPage:
          Number(data.itemsPerPage) || 10,
      });

    } catch (error) {
      console.error(
        'GET SERVICES ERROR:',
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to fetch services'
      );

      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN VIEW MODAL
  // ==========================================

  const handleView = async (service) => {
    try {
      // First show existing row data immediately
      setSelectedService(service);
      setShowViewModal(true);

      // Then fetch complete service details
      const response = await api.get(
        `/services/${service.id}`
      );

      const fullService =
        response.data?.data;

      if (fullService) {
        setSelectedService(fullService);
      }

    } catch (error) {
      console.error(
        'GET SERVICE DETAILS ERROR:',
        error.response?.data || error
      );

      // Keep the already loaded service data
    }
  };

  // ==========================================
  // CLOSE VIEW MODAL
  // ==========================================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedService(null);
  };

  // ==========================================
  // TOGGLE STATUS
  // ==========================================

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(
        `/services/${id}/toggle`
      );

      toast.success(
        'Service status updated'
      );

      // Update current modal data too
      if (
        selectedService &&
        selectedService.id === id
      ) {
        setSelectedService((prev) => ({
          ...prev,
          isActive: !prev.isActive,
        }));
      }

      fetchServices();

    } catch (error) {
      console.error(
        'TOGGLE SERVICE ERROR:',
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to update service status'
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this service?'
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/services/${id}`
      );

      toast.success(
        'Service deleted successfully'
      );

      if (
        selectedService &&
        selectedService.id === id
      ) {
        closeViewModal();
      }

      fetchServices();

    } catch (error) {
      console.error(
        'DELETE SERVICE ERROR:',
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.error ||
          'Failed to delete service'
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (query) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: query || '',
    }));
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getFormFields = (service) => {
    return Array.isArray(
      service?.metadata?.formFields
    )
      ? service.metadata.formFields
      : [];
  };

  const getPriceType = (service) => {
    return (
      service?.metadata?.priceCalculation
        ?.type || 'fixed'
    );
  };

  const getMaxBookings = (service) => {
    return (
      service?.metadata?.maxBookingsPerSlot ||
      3
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loader />;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Services
          </h2>

          <p className="text-gray-500">
            Manage all services
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search services..."
          />

          <Link
            to="/services/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
          >
            <FiPlus />
            Add Service
          </Link>

        </div>

      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            {/* TABLE HEADER */}

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Booking Fields
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody className="divide-y divide-gray-100">

              {services.map((service) => {

                const fields =
                  getFormFields(service);

                const priceType =
                  getPriceType(service);

                return (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50 transition"
                  >

                    {/* SERVICE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        {service.image ? (

                          <img
                            src={service.image}
                            alt={
                              service.name ||
                              'Service'
                            }
                            className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                          />

                        ) : (

                          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FiSettings className="text-gray-400" />
                          </div>

                        )}

                        <div>

                          <p className="font-semibold text-gray-800">
                            {service.name}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            ID: {service.id}
                          </p>

                          <p className="text-xs text-gray-400">
                            {service.slug}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4">

                      <span className="text-sm text-gray-700">
                        {service.Category?.name ||
                          'N/A'}
                      </span>

                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4">

                      <span className="font-semibold text-gray-800">
                        ₹
                        {formatPrice(
                          service.basePrice
                        )}
                      </span>

                    </td>

                    {/* DURATION */}

                    <td className="px-5 py-4">

                      <span className="text-sm text-gray-600">
                        {service.duration
                          ? `${service.duration} min`
                          : 'N/A'}
                      </span>

                    </td>

                    {/* BOOKING FIELDS */}

                    <td className="px-5 py-4">

                      {fields.length > 0 ? (

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {fields.length}{' '}
                          {fields.length === 1
                            ? 'Field'
                            : 'Fields'}
                        </span>

                      ) : (

                        <span className="text-sm text-gray-400">
                          None
                        </span>

                      )}

                    </td>

                    {/* PRICE TYPE */}

                    <td className="px-5 py-4">

                      <span className="inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium capitalize">
                        {priceType}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            service.id
                          )
                        }
                        className="flex items-center gap-2"
                      >

                        {service.isActive ? (

                          <>
                            <FiToggleRight className="w-6 h-6 text-green-500" />

                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          </>

                        ) : (

                          <>
                            <FiToggleLeft className="w-6 h-6 text-gray-400" />

                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          </>

                        )}

                      </button>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-2">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            handleView(service)
                          }
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View service"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* EDIT */}

                        <Link
                          to={`/services/${service.id}/edit`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit service"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              service.id
                            )
                          }
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete service"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* NO DATA */}

        {services.length === 0 && (

          <div className="py-16 text-center">

            <FiSettings className="w-10 h-10 text-gray-300 mx-auto mb-3" />

            <h3 className="text-lg font-semibold text-gray-700">
              No services found
            </h3>

            <p className="text-gray-400 mt-1">
              Try changing your search or add a new service.
            </p>

          </div>

        )}

      </div>

      {/* ====================================== */}
      {/* PAGINATION */}
      {/* ====================================== */}

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

      {/* ====================================== */}
      {/* SERVICE VIEW MODAL */}
      {/* ====================================== */}

      {showViewModal &&
        selectedService && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeViewModal}
          >

            <div
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* ================================= */}
              {/* MODAL HEADER */}
              {/* ================================= */}

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {selectedService.image ? (

                    <img
                      src={
                        selectedService.image
                      }
                      alt={
                        selectedService.name
                      }
                      className="w-12 h-12 rounded-xl object-cover"
                    />

                  ) : (

                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FiSettings className="w-6 h-6 text-gray-400" />
                    </div>

                  )}

                  <div>

                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedService.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Service ID: #
                      {selectedService.id}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeViewModal}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-6 h-6" />
                </button>

              </div>

              {/* ================================= */}
              {/* MODAL CONTENT */}
              {/* ================================= */}

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">

                {/* ================================= */}
                {/* BASIC INFORMATION */}
                {/* ================================= */}

                <div className="mb-6">

                  <div className="flex items-center gap-2 mb-4">

                    <FiInfo className="text-primary-500" />

                    <h3 className="text-lg font-semibold text-gray-800">
                      Basic Information
                    </h3>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* ID */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1">
                        Service ID
                      </p>

                      <p className="font-semibold text-gray-800">
                        #{selectedService.id}
                      </p>

                    </div>

                    {/* NAME */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1">
                        Service Name
                      </p>

                      <p className="font-semibold text-gray-800">
                        {selectedService.name ||
                          'N/A'}
                      </p>

                    </div>

                    {/* SLUG */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1">
                        Slug
                      </p>

                      <p className="font-semibold text-gray-800 break-all">
                        {selectedService.slug ||
                          'N/A'}
                      </p>

                    </div>

                    {/* CATEGORY */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiTag />
                        Category
                      </p>

                      <p className="font-semibold text-gray-800">
                        {selectedService.Category
                          ?.name ||
                          'N/A'}
                      </p>

                    </div>

                    {/* PRICE */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiDollarSign />
                        Base Price
                      </p>

                      <p className="font-semibold text-primary-600 text-lg">
                        ₹
                        {formatPrice(
                          selectedService.basePrice
                        )}
                      </p>

                    </div>

                    {/* DURATION */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiClock />
                        Duration
                      </p>

                      <p className="font-semibold text-gray-800">
                        {selectedService.duration
                          ? `${selectedService.duration} minutes`
                          : 'N/A'}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1">
                        Status
                      </p>

                      {selectedService.isActive ? (

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <FiCheckCircle />
                          Active
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          <FiXCircle />
                          Inactive
                        </span>

                      )}

                    </div>

                    {/* CREATED */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiCalendar />
                        Created At
                      </p>

                      <p className="font-semibold text-gray-800 text-sm">
                        {formatDate(
                          selectedService.createdAt
                        )}
                      </p>

                    </div>

                    {/* UPDATED */}

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiCalendar />
                        Updated At
                      </p>

                      <p className="font-semibold text-gray-800 text-sm">
                        {formatDate(
                          selectedService.updatedAt
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ================================= */}
                {/* DESCRIPTION */}
                {/* ================================= */}

                <div className="mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Description
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">

                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedService.description ||
                        'No description available.'}
                    </p>

                  </div>

                </div>

                {/* ================================= */}
                {/* IMAGE */}
                {/* ================================= */}

                {selectedService.image && (

                  <div className="mb-6">

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Service Image
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">

                      <img
                        src={
                          selectedService.image
                        }
                        alt={
                          selectedService.name
                        }
                        className="max-h-64 rounded-lg object-contain"
                      />

                      <p className="text-xs text-gray-400 mt-3 break-all">
                        {selectedService.image}
                      </p>

                    </div>

                  </div>

                )}

                {/* ================================= */}
                {/* METADATA */}
                {/* ================================= */}

                <div className="mb-6">

                  <div className="flex items-center gap-2 mb-4">

                    <FiSettings className="text-primary-500" />

                    <h3 className="text-lg font-semibold text-gray-800">
                      Service Configuration
                    </h3>

                  </div>

                  {/* PRICE CALCULATION */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                    <div className="bg-purple-50 rounded-lg p-4">

                      <p className="text-xs text-purple-600 mb-1">
                        Price Calculation
                      </p>

                      <p className="font-semibold text-purple-800 capitalize">
                        {getPriceType(
                          selectedService
                        )}
                      </p>

                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">

                      <p className="text-xs text-blue-600 mb-1">
                        Maximum Bookings Per Slot
                      </p>

                      <p className="font-semibold text-blue-800">
                        {getMaxBookings(
                          selectedService
                        )}
                      </p>

                    </div>

                  </div>

                  {/* BOOKING FIELDS */}

                  <div>

                    <div className="flex items-center gap-2 mb-3">

                      <FiList className="text-gray-500" />

                      <h4 className="font-semibold text-gray-800">
                        Customer Booking Fields
                      </h4>

                    </div>

                    {getFormFields(
                      selectedService
                    ).length === 0 ? (

                      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">

                        <p className="text-gray-400">
                          No custom booking fields configured.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {getFormFields(
                          selectedService
                        ).map(
                          (field, index) => (

                            <div
                              key={
                                field.key ||
                                field.name ||
                                index
                              }
                              className="border border-gray-200 rounded-lg p-4"
                            >

                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                <div className="flex-1">

                                  <div className="flex items-center gap-2 flex-wrap">

                                    <h5 className="font-semibold text-gray-800">
                                      {field.label ||
                                        field.name ||
                                        field.key ||
                                        `Field ${index + 1}`}
                                    </h5>

                                    {field.required && (

                                      <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs">
                                        Required
                                      </span>

                                    )}

                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-2">

                                    {field.key && (

                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        Key: {field.key}
                                      </span>

                                    )}

                                    {field.name && (

                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        Name: {field.name}
                                      </span>

                                    )}

                                    {field.type && (

                                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs capitalize">
                                        Type: {field.type}
                                      </span>

                                    )}

                                  </div>

                                  {field.placeholder && (

                                    <p className="text-sm text-gray-500 mt-2">
                                      Placeholder:{' '}
                                      {field.placeholder}
                                    </p>

                                  )}

                                  {Array.isArray(
                                    field.options
                                  ) &&
                                    field.options
                                      .length >
                                      0 && (

                                      <div className="mt-3">

                                        <p className="text-xs font-medium text-gray-500 mb-2">
                                          Options
                                        </p>

                                        <div className="flex flex-wrap gap-2">

                                          {field.options.map(
                                            (
                                              option,
                                              optionIndex
                                            ) => (

                                              <span
                                                key={
                                                  optionIndex
                                                }
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                              >
                                                {String(
                                                  option
                                                )}
                                              </span>

                                            )
                                          )}

                                        </div>

                                      </div>

                                    )}

                                </div>

                                <div className="text-sm text-gray-400">
                                  #{index + 1}
                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

                {/* ================================= */}
                {/* CATEGORY DETAILS */}
                {/* ================================= */}

                {selectedService.Category && (

                  <div className="mb-6">

                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Category Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-xs text-gray-500">
                          Category ID
                        </p>

                        <p className="font-semibold text-gray-800">
                          #
                          {
                            selectedService
                              .Category.id
                          }
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-xs text-gray-500">
                          Category Name
                        </p>

                        <p className="font-semibold text-gray-800">
                          {
                            selectedService
                              .Category.name
                          }
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-xs text-gray-500">
                          Category Slug
                        </p>

                        <p className="font-semibold text-gray-800">
                          {
                            selectedService
                              .Category.slug ||
                            'N/A'
                          }
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-xs text-gray-500">
                          Category Status
                        </p>

                        {selectedService
                          .Category
                          .isActive ? (

                          <span className="text-green-600 font-medium">
                            Active
                          </span>

                        ) : (

                          <span className="text-gray-500 font-medium">
                            Inactive
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                )}

                {/* ================================= */}
                {/* RAW METADATA */}
                {/* ================================= */}

                <div className="mb-2">

                  <details className="border border-gray-200 rounded-lg">

                    <summary className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                      View Raw Metadata JSON
                    </summary>

                    <div className="p-4 bg-gray-900 rounded-b-lg overflow-auto">

                      <pre className="text-xs text-green-300 whitespace-pre-wrap">
                        {JSON.stringify(
                          selectedService.metadata ||
                            {},
                          null,
                          2
                        )}
                      </pre>

                    </div>

                  </details>

                </div>

              </div>

              {/* ================================= */}
              {/* MODAL FOOTER */}
              {/* ================================= */}

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedService.id
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
                    onClick={closeViewModal}
                    className="px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition"
                  >
                    Close
                  </button>

                  <Link
                    to={`/services/${selectedService.id}/edit`}
                    onClick={closeViewModal}
                    className="px-5 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition flex items-center gap-2"
                  >
                    <FiEdit2 />
                    Edit Service
                  </Link>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default ServicesList;