import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiImage,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiCode,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../../api';
import Loader from '../../components/Common/Loader';

const DEFAULT_FORM = {
  code: '',
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
};

const PromotionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    ...DEFAULT_FORM,
  });

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchServices();

    if (id) {
      fetchPromotion();
    }
  }, [id]);

  // ============================================================
  // FETCH SERVICES
  // ============================================================

  const fetchServices = async () => {
    try {
      const response = await api.get('/services', {
        params: {
          page: 1,
          limit: 100,
        },
      });

      console.log(
        'PROMOTION SERVICES RESPONSE:',
        response.data
      );

      const data = response.data?.data;

      let serviceItems = [];

      // Your services API uses data.items
      if (Array.isArray(data?.items)) {
        serviceItems = data.items;
      }

      // Fallback if API returns rows
      else if (Array.isArray(data?.rows)) {
        serviceItems = data.rows;
      }

      // Fallback if API directly returns array
      else if (Array.isArray(data)) {
        serviceItems = data;
      }

      setServices(serviceItems);

      console.log(
        'PROMOTION SERVICES:',
        serviceItems
      );
    } catch (error) {
      console.error(
        'FAILED TO FETCH SERVICES:',
        error.response?.data || error
      );

      setServices([]);

      toast.error(
        'Failed to fetch services'
      );
    }
  };

  // ============================================================
  // FETCH PROMOTION FOR EDIT
  // ============================================================

  const fetchPromotion = async () => {
    try {
      setLoading(true);

      console.log(
        'GET PROMOTION:',
        `/promotions/${id}`
      );

      const response = await api.get(
        `/promotions/${id}`
      );

      console.log(
        'PROMOTION RESPONSE:',
        response.data
      );

      const promotion =
        response.data?.data;

      if (!promotion) {
        throw new Error(
          'Promotion data not found'
        );
      }

      // ----------------------------------------------------------
      // SERVICE IDS
      // ----------------------------------------------------------

      let serviceIds = [];

      if (
        Array.isArray(
          promotion.applicableServiceIds
        )
      ) {
        serviceIds =
          promotion.applicableServiceIds
            .map((serviceId) =>
              Number(serviceId)
            )
            .filter(
              (serviceId) =>
                !Number.isNaN(serviceId)
            );
      }

      // ----------------------------------------------------------
      // APPLICABLE TO
      // ----------------------------------------------------------

      let applicableTo =
        promotion.applicableTo;

      if (
        typeof applicableTo !== 'string' ||
        !applicableTo.trim()
      ) {
        applicableTo = 'all';
      }

      applicableTo =
        applicableTo
          .trim()
          .toLowerCase();

      // ----------------------------------------------------------
      // DISCOUNT TYPE
      // ----------------------------------------------------------

      let discountType =
        promotion.discountType;

      if (
        typeof discountType !== 'string' ||
        !discountType.trim()
      ) {
        discountType = 'percentage';
      }

      discountType =
        discountType
          .trim()
          .toLowerCase();

      // ----------------------------------------------------------
      // SET FORM DATA
      // ----------------------------------------------------------

      setFormData({
        code:
          promotion.code || '',

        title:
          promotion.title || '',

        description:
          promotion.description || '',

        image:
          promotion.image || '',

        discountType,

        discountValue:
          promotion.discountValue ?? '',

        startDate:
          promotion.startDate
            ? String(
                promotion.startDate
              ).split('T')[0]
            : '',

        endDate:
          promotion.endDate
            ? String(
                promotion.endDate
              ).split('T')[0]
            : '',

        applicableTo,

        applicableServiceIds:
          serviceIds,

        isActive:
          promotion.isActive !== undefined
            ? Boolean(
                promotion.isActive
              )
            : true,
      });
    } catch (error) {
      console.error(
        'GET PROMOTION ERROR:',
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.error ||
          error.message ||
          'Failed to fetch promotion'
      );

      navigate('/promotions');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NORMAL INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  // ============================================================
  // PROMOTION CODE CHANGE
  // ============================================================

  const handleCodeChange = (e) => {
    const value = e.target.value;

    const code = value
      .toUpperCase()
      .replace(/\s+/g, '');

    setFormData((prev) => ({
      ...prev,
      code,
    }));
  };

  // ============================================================
  // SERVICE TOGGLE
  // ============================================================

  const handleServiceToggle = (
    serviceId
  ) => {
    const numericId =
      Number(serviceId);

    if (Number.isNaN(numericId)) {
      return;
    }

    setFormData((prev) => {
      const current =
        Array.isArray(
          prev.applicableServiceIds
        )
          ? prev.applicableServiceIds
          : [];

      const exists =
        current.includes(numericId);

      if (exists) {
        return {
          ...prev,

          applicableServiceIds:
            current.filter(
              (currentId) =>
                currentId !== numericId
            ),
        };
      }

      return {
        ...prev,

        applicableServiceIds: [
          ...current,
          numericId,
        ],
      };
    });
  };

  // ============================================================
  // SELECT ALL SERVICES
  // ============================================================

  const handleSelectAllServices = () => {
    const allIds = services
      .map((service) =>
        Number(service.id)
      )
      .filter(
        (serviceId) =>
          !Number.isNaN(serviceId)
      );

    setFormData((prev) => ({
      ...prev,
      applicableServiceIds:
        allIds,
    }));
  };

  // ============================================================
  // CLEAR SERVICES
  // ============================================================

  const handleClearServices = () => {
    setFormData((prev) => ({
      ...prev,
      applicableServiceIds: [],
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================================
    // CODE VALIDATION
    // ==========================================================

    const promotionCode =
      typeof formData.code === 'string'
        ? formData.code
            .trim()
            .toUpperCase()
        : '';

    if (!promotionCode) {
      toast.error(
        'Promotion code is required'
      );
      return;
    }

    if (
      !/^[A-Z0-9_-]+$/.test(
        promotionCode
      )
    ) {
      toast.error(
        'Promotion code can contain only letters, numbers, - and _'
      );
      return;
    }

    // ==========================================================
    // TITLE VALIDATION
    // ==========================================================

    if (
      !formData.title ||
      !formData.title.trim()
    ) {
      toast.error(
        'Promotion title is required'
      );
      return;
    }

    // ==========================================================
    // DISCOUNT VALIDATION
    // ==========================================================

    if (
      formData.discountValue === '' ||
      formData.discountValue === null ||
      formData.discountValue === undefined
    ) {
      toast.error(
        'Discount value is required'
      );
      return;
    }

    const discountValue =
      Number(formData.discountValue);

    if (
      Number.isNaN(discountValue) ||
      discountValue < 0
    ) {
      toast.error(
        'Enter a valid discount value'
      );
      return;
    }

    if (
      formData.discountType ===
        'percentage' &&
      discountValue > 100
    ) {
      toast.error(
        'Percentage discount cannot exceed 100%'
      );
      return;
    }

    // ==========================================================
    // DATE VALIDATION
    // ==========================================================

    if (!formData.startDate) {
      toast.error(
        'Start date is required'
      );
      return;
    }

    if (!formData.endDate) {
      toast.error(
        'End date is required'
      );
      return;
    }

    const startDate = new Date(
      `${formData.startDate}T00:00:00`
    );

    const endDate = new Date(
      `${formData.endDate}T23:59:59`
    );

    if (
      Number.isNaN(
        startDate.getTime()
      ) ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      toast.error(
        'Please select valid dates'
      );
      return;
    }

    if (endDate < startDate) {
      toast.error(
        'End date cannot be before start date'
      );
      return;
    }

    // ==========================================================
    // DISCOUNT TYPE
    // ==========================================================

    const discountType =
      typeof formData.discountType ===
        'string' &&
      formData.discountType.trim()
        ? formData.discountType
            .trim()
            .toLowerCase()
        : 'percentage';

    if (
      ![
        'percentage',
        'fixed',
      ].includes(discountType)
    ) {
      toast.error(
        'Invalid discount type'
      );
      return;
    }

    // ==========================================================
    // APPLICABLE TO
    // ==========================================================

    const applicableTo =
      typeof formData.applicableTo ===
        'string' &&
      formData.applicableTo.trim()
        ? formData.applicableTo
            .trim()
            .toLowerCase()
        : 'all';

    if (
      ![
        'all',
        'user',
        'worker',
      ].includes(applicableTo)
    ) {
      toast.error(
        'Invalid Applicable To value'
      );
      return;
    }

    // ==========================================================
    // SERVICE IDS
    // ==========================================================

    const applicableServiceIds =
      Array.isArray(
        formData.applicableServiceIds
      )
        ? formData.applicableServiceIds
            .map((serviceId) =>
              Number(serviceId)
            )
            .filter(
              (serviceId) =>
                !Number.isNaN(
                  serviceId
                )
            )
        : [];

    // ==========================================================
    // PAYLOAD
    // ==========================================================

    const payload = {
      code: promotionCode,

      title:
        formData.title.trim(),

      description:
        formData.description?.trim() ||
        null,

      image:
        formData.image?.trim() ||
        null,

      discountType,

      discountValue,

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      applicableTo,

      applicableServiceIds,

      isActive:
        Boolean(formData.isActive),
    };

    console.log(
      'PROMOTION SAVE PAYLOAD:',
      payload
    );

    // ==========================================================
    // API
    // ==========================================================

    try {
      setSaving(true);

      let response;

      if (isEdit) {
        response =
          await api.put(
            `/promotions/${id}`,
            payload
          );

        console.log(
          'UPDATE PROMOTION RESPONSE:',
          response.data
        );

        toast.success(
          'Promotion updated successfully'
        );
      } else {
        response =
          await api.post(
            '/promotions',
            payload
          );

        console.log(
          'CREATE PROMOTION RESPONSE:',
          response.data
        );

        toast.success(
          'Promotion created successfully'
        );
      }

      navigate('/promotions');
    } catch (error) {
      console.error(
        'SAVE PROMOTION ERROR:',
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to save promotion'
      );
    } finally {
      setSaving(false);
    }
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

      <div className="flex items-center gap-4">

        <Link
          to="/promotions"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit
              ? 'Edit Promotion'
              : 'Add New Promotion'}
          </h2>

          <p className="text-gray-500">
            {isEdit
              ? 'Update promotion details'
              : 'Create a new promotion'}
          </p>
        </div>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6"
      >

        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PROMOTION CODE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promotion Code *
            </label>

            <div className="relative">
              <FiCode className="absolute left-3 top-3 text-gray-400" />

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleCodeChange}
                placeholder="e.g. SUMMER10"
                maxLength={50}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Example: SUMMER10, NEWUSER20
            </p>
          </div>

          {/* TITLE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Summer Special Offer"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* IMAGE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>

            <div className="relative">
              <FiImage className="absolute left-3 top-3 text-gray-400" />

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/promo.jpg"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* DISCOUNT TYPE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>

            <select
              name="discountType"
              value={
                formData.discountType
              }
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="percentage">
                Percentage (%)
              </option>

              <option value="fixed">
                Fixed (₹)
              </option>
            </select>
          </div>

          {/* DISCOUNT VALUE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value *
            </label>

            <div className="relative">

              {formData.discountType ===
              'percentage' ? (
                <FiPercent className="absolute left-3 top-3 text-gray-400" />
              ) : (
                <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
              )}

              <input
                type="number"
                name="discountValue"
                value={
                  formData.discountValue
                }
                onChange={handleChange}
                min="0"
                max={
                  formData.discountType ===
                  'percentage'
                    ? '100'
                    : undefined
                }
                step="0.01"
                placeholder="10"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* START DATE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>

            <div className="relative">

              <FiCalendar className="absolute left-3 top-3 text-gray-400" />

              <input
                type="date"
                name="startDate"
                value={
                  formData.startDate
                }
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* END DATE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>

            <div className="relative">

              <FiCalendar className="absolute left-3 top-3 text-gray-400" />

              <input
                type="date"
                name="endDate"
                value={
                  formData.endDate
                }
                onChange={handleChange}
                min={
                  formData.startDate ||
                  undefined
                }
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* APPLICABLE TO */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable To
            </label>

            <select
              name="applicableTo"
              value={
                formData.applicableTo ||
                'all'
              }
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">
                All Users
              </option>

              <option value="user">
                Users Only
              </option>

              <option value="worker">
                Workers Only
              </option>
            </select>
          </div>

        </div>

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <div className="mt-6">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>

          <textarea
            name="description"
            value={
              formData.description
            }
            onChange={handleChange}
            rows="4"
            placeholder="Enter promotion description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

        </div>

        {/* ====================================================
            SERVICES
        ==================================================== */}

        <div className="mt-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Applicable Services
              </label>

              <p className="text-xs text-gray-400 mt-1">
                Select the services where this promotion
                can be applied.
              </p>
            </div>

            {services.length > 0 && (
              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={
                    handleSelectAllServices
                  }
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    handleClearServices
                  }
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear
                </button>

              </div>
            )}

          </div>

          <div className="border border-gray-200 rounded-lg">

            {services.length === 0 ? (

              <div className="p-6 text-center">

                <FiTag className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                <p className="text-sm text-gray-400">
                  No services available
                </p>

                <button
                  type="button"
                  onClick={fetchServices}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                >
                  Retry
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3">

                {services.map(
                  (service) => {

                    const serviceId =
                      Number(
                        service.id
                      );

                    const selected =
                      (
                        formData.applicableServiceIds ||
                        []
                      ).includes(
                        serviceId
                      );

                    return (
                      <label
                        key={
                          service.id
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          selected
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            handleServiceToggle(
                              service.id
                            )
                          }
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />

                        <div className="min-w-0">

                          <p className="text-sm font-medium text-gray-800 truncate">
                            {service.name ||
                              'Unnamed Service'}
                          </p>

                          <p className="text-xs text-gray-400">
                            ₹
                            {Number(
                              service.basePrice ||
                                0
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>

                        </div>

                      </label>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* SELECTED COUNT */}

          {formData
            .applicableServiceIds
            ?.length > 0 && (

            <div className="mt-2 flex items-center gap-2 text-sm text-primary-600">

              <FiCheckCircle />

              {
                formData
                  .applicableServiceIds
                  .length
              } service
              {formData
                .applicableServiceIds
                .length !== 1
                ? 's'
                : ''}{' '}
              selected

            </div>

          )}

        </div>

        {/* ====================================================
            ACTIVE
        ==================================================== */}

        <div className="mt-6 flex items-center">

          <input
            type="checkbox"
            name="isActive"
            checked={
              formData.isActive
            }
            onChange={handleChange}
            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
          />

          <label className="ml-2 text-sm text-gray-700">
            Active
          </label>

        </div>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >

            <FiSave />

            {saving
              ? 'Saving...'
              : isEdit
              ? 'Update Promotion'
              : 'Save Promotion'}

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