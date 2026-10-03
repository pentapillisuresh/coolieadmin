import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';

const DEFAULT_METADATA = {
  formFields: [],
  priceCalculation: {
    type: 'fixed',
  },
  maxBookingsPerSlot: 3,
};

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    duration: '',
    categoryId: '',
    image: '',
    isActive: true,
    metadata: DEFAULT_METADATA,
  });

  useEffect(() => {
    fetchCategories();

    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');

      setCategories(response.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchService = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/services/${id}`);

      const service = response.data?.data;

      if (!service) {
        throw new Error('Service not found');
      }

      setFormData({
        name: service.name || '',
        slug: service.slug || '',
        description: service.description || '',
        basePrice: service.basePrice ?? '',
        duration: service.duration ?? '',
        categoryId: service.categoryId || '',
        image: service.image || '',
        isActive:
          service.isActive !== undefined
            ? service.isActive
            : true,

        metadata: {
          formFields:
            service.metadata?.formFields || [],

          priceCalculation:
            service.metadata?.priceCalculation || {
              type: 'fixed',
            },

          maxBookingsPerSlot:
            service.metadata?.maxBookingsPerSlot || 3,
        },
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.error ||
          'Failed to fetch service'
      );

      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

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

  // ----------------------------------------
  // METADATA
  // ----------------------------------------

  const addFormField = () => {
    setFormData((prev) => ({
      ...prev,

      metadata: {
        ...prev.metadata,

        formFields: [
          ...prev.metadata.formFields,

          {
            name: '',
            label: '',
            type: 'text',
            required: false,
          },
        ],
      },
    }));
  };

  const updateFormField = (
    index,
    field,
    value
  ) => {
    setFormData((prev) => {
      const fields = [
        ...prev.metadata.formFields,
      ];

      fields[index] = {
        ...fields[index],
        [field]:
          field === 'required'
            ? value
            : value,
      };

      return {
        ...prev,

        metadata: {
          ...prev.metadata,
          formFields: fields,
        },
      };
    });
  };

  const removeFormField = (index) => {
    setFormData((prev) => ({
      ...prev,

      metadata: {
        ...prev.metadata,

        formFields:
          prev.metadata.formFields.filter(
            (_, i) => i !== index
          ),
      },
    }));
  };

  const handlePriceCalculationChange = (
    e
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      metadata: {
        ...prev.metadata,

        priceCalculation: {
          ...prev.metadata.priceCalculation,
          [name]: value,
        },
      },
    }));
  };

  const handleMaxBookingsChange = (e) => {
    setFormData((prev) => ({
      ...prev,

      metadata: {
        ...prev.metadata,

        maxBookingsPerSlot:
          parseInt(e.target.value, 10) || 1,
      },
    }));
  };

  // ----------------------------------------
  // SUBMIT
  // ----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Service slug is required');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),

        slug: formData.slug.trim(),

        description:
          formData.description.trim(),

        categoryId:
          Number(formData.categoryId),

        basePrice:
          parseFloat(formData.basePrice) || 0,

        duration:
          formData.duration
            ? parseInt(
                formData.duration,
                10
              )
            : null,

        image:
          formData.image.trim() || null,

        isActive:
          Boolean(formData.isActive),

        metadata: {
          formFields:
            formData.metadata.formFields,

          priceCalculation:
            formData.metadata.priceCalculation,

          maxBookingsPerSlot:
            Number(
              formData.metadata
                .maxBookingsPerSlot
            ) || 3,
        },
      };

      console.log(
        'Service Payload:',
        payload
      );

      if (id) {
        await api.put(
          `/services/${id}`,
          payload
        );

        toast.success(
          'Service updated successfully'
        );
      } else {
        await api.post(
          '/services',
          payload
        );

        toast.success(
          'Service created successfully'
        );
      }

      navigate('/services');
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.error ||
          'Failed to save service'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-4">

        <Link
          to="/services"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {id
              ? 'Edit Service'
              : 'Add New Service'}
          </h2>

          <p className="text-gray-500">
            {id
              ? 'Update service details'
              : 'Create a new service'}
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* BASIC INFORMATION */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SERVICE NAME */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. House Shifting"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* SLUG */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. house-shifting"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">
                  Select a category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* IMAGE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (₹) *
              </label>

              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* DURATION */}

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
                placeholder="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe this service..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

          </div>

          {/* ACTIVE */}

          <div className="mt-6 flex items-center">

            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />

            <label className="ml-2 text-sm text-gray-700">
              Active Service
            </label>

          </div>

        </div>

        {/* SERVICE METADATA */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Service Configuration
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Configure service-specific booking fields and pricing.
              </p>
            </div>

          </div>

          {/* PRICE CALCULATION */}

          <div className="border border-gray-200 rounded-lg p-4">

            <h4 className="font-medium text-gray-800 mb-4">
              Price Calculation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculation Type
                </label>

                <select
                  name="type"
                  value={
                    formData.metadata
                      .priceCalculation
                      .type
                  }
                  onChange={
                    handlePriceCalculationChange
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="fixed">
                    Fixed Price
                  </option>

                  <option value="quantity">
                    Quantity Based
                  </option>

                  <option value="distance">
                    Distance Based
                  </option>

                  <option value="custom">
                    Custom
                  </option>
                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Bookings Per Slot
                </label>

                <input
                  type="number"
                  min="1"
                  name="maxBookingsPerSlot"
                  value={
                    formData.metadata
                      .maxBookingsPerSlot
                  }
                  onChange={
                    handleMaxBookingsChange
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

              </div>

            </div>

          </div>

          {/* FORM FIELDS */}

          <div className="mt-6">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h4 className="font-medium text-gray-800">
                  Customer Booking Fields
                </h4>

                <p className="text-sm text-gray-500">
                  Add information customers must provide when booking.
                </p>
              </div>

              <button
                type="button"
                onClick={addFormField}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
              >
                <FiPlus />
                Add Field
              </button>

            </div>

            {formData.metadata.formFields.length ===
            0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                No custom booking fields added.
              </div>
            ) : (
              <div className="space-y-4">

                {formData.metadata.formFields.map(
                  (field, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* FIELD NAME */}

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Field Name
                          </label>

                          <input
                            type="text"
                            value={
                              field.name
                            }
                            onChange={(e) =>
                              updateFormField(
                                index,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder="weight"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        {/* LABEL */}

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Label
                          </label>

                          <input
                            type="text"
                            value={
                              field.label
                            }
                            onChange={(e) =>
                              updateFormField(
                                index,
                                'label',
                                e.target.value
                              )
                            }
                            placeholder="Weight"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        {/* TYPE */}

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Field Type
                          </label>

                          <select
                            value={
                              field.type ||
                              'text'
                            }
                            onChange={(e) =>
                              updateFormField(
                                index,
                                'type',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="text">
                              Text
                            </option>

                            <option value="number">
                              Number
                            </option>

                            <option value="date">
                              Date
                            </option>

                            <option value="time">
                              Time
                            </option>

                            <option value="select">
                              Select
                            </option>

                            <option value="textarea">
                              Textarea
                            </option>
                          </select>
                        </div>

                        {/* REQUIRED */}

                        <div className="flex items-end">

                          <label className="flex items-center gap-2 text-sm text-gray-700">

                            <input
                              type="checkbox"
                              checked={
                                Boolean(
                                  field.required
                                )
                              }
                              onChange={(e) =>
                                updateFormField(
                                  index,
                                  'required',
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-primary-500"
                            />

                            Required

                          </label>

                        </div>

                      </div>

                      <div className="mt-4 flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            removeFormField(
                              index
                            )
                          }
                          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
                        >
                          <FiTrash2 />
                          Remove
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>

        {/* ACTIONS */}

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-3">

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave />

            {saving
              ? 'Saving...'
              : id
              ? 'Update Service'
              : 'Save Service'}
          </button>

          <Link
            to="/services"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <FiX />
            Cancel
          </Link>

        </div>

      </form>
    </div>
  );
};

export default ServiceForm;