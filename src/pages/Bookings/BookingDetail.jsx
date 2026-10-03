import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiBriefcase,
  FiCheck,
  FiX,
  FiSend,
  FiRefreshCw,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import StatusBadge from '../../components/Common/StatusBadge';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchBookingData();
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const [bookingRes, timelineRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/bookings/${id}/timeline`),
      ]);
      setBooking(bookingRes.data.data);
      setTimeline(timelineRes.data.data || []);
      // Fetch workers for assignment
      const workersRes = await api.get('/workers', { params: { isVerified: 'true', limit: 100 } });
      setWorkers(workersRes.data.data.rows || []);
    } catch (error) {
      toast.error('Failed to fetch booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorker) {
      toast.error('Please select a worker');
      return;
    }
    try {
      setAssignLoading(true);
      await api.post(`/bookings/${id}/assign`, { workerId: selectedWorker });
      toast.success('Worker assigned successfully');
      setShowAssignModal(false);
      fetchBookingData();
    } catch (error) {
      toast.error('Failed to assign worker');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelled by admin' });
      toast.success('Booking cancelled successfully');
      fetchBookingData();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleReassign = async () => {
    if (!selectedWorker) {
      toast.error('Please select a worker');
      return;
    }
    try {
      setAssignLoading(true);
      await api.put(`/bookings/${id}/reassign`, { workerId: selectedWorker });
      toast.success('Worker reassigned successfully');
      setShowAssignModal(false);
      fetchBookingData();
    } catch (error) {
      toast.error('Failed to reassign worker');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!booking) return <div className="text-center py-12 text-gray-400">Booking not found</div>;

  const canAssign = booking.status === 'pending';
  const canReassign = ['accepted', 'in-progress'].includes(booking.status);
  const canCancel = ['pending', 'accepted'].includes(booking.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/bookings"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Booking #{booking.id}</h2>
          <p className="text-gray-500">View and manage booking details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={booking.status} />
                <StatusBadge status={booking.paymentStatus} />
              </div>
              <div className="flex gap-2">
                {canAssign && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition flex items-center gap-2"
                  >
                    <FiSend /> Assign Worker
                  </button>
                )}
                {canReassign && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition flex items-center gap-2"
                  >
                    <FiRefreshCw /> Reassign
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FiX /> Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{booking.Service?.name || 'N/A'}</p>
                {booking.Service?.Category && (
                  <p className="text-sm text-gray-500">{booking.Service.Category.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-800">₹{booking.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  <span>{booking.scheduledDate && format(new Date(booking.scheduledDate), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-400" />
                  <span>{booking.scheduledTime}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  <span>{booking.User?.name || 'Guest'}</span>
                </div>
                <p className="text-sm text-gray-500">{booking.User?.mobile}</p>
              </div>
            </div>

            {booking.address && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Address</p>
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-gray-400 mt-0.5" />
                  <p className="text-sm">{booking.address}</p>
                </div>
              </div>
            )}

            {booking.specialInstructions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Special Instructions</p>
                <p className="text-sm">{booking.specialInstructions}</p>
              </div>
            )}

            {booking.details && Object.keys(booking.details).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Additional Details</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(booking.details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="font-medium text-gray-700 mb-4">Timeline</h4>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5"></div>
                    {index < timeline.length - 1 && (
                      <div className="absolute top-5 left-1.5 w-0.5 h-8 bg-gray-300"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{event.event}</p>
                    <p className="text-sm text-gray-500">
                      {event.timestamp && format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a')}
                    </p>
                    {event.status && (
                      <StatusBadge status={event.status} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Worker Info */}
          {booking.Job && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-medium text-gray-700 mb-4">Assigned Worker</h4>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {booking.Job.Worker?.User?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">{booking.Job.Worker?.profession}</p>
                  <p className="text-sm text-gray-500">{booking.Job.Worker?.User?.mobile}</p>
                  <StatusBadge status={booking.Job.status} />
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {booking.Payment && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-medium text-gray-700 mb-4">Payment Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-semibold">₹{booking.Payment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="text-sm">{booking.Payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <StatusBadge status={booking.Payment.status} />
                </div>
                {booking.Payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transaction</span>
                    <span className="text-sm font-mono">{booking.Payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Worker Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {canReassign ? 'Reassign Worker' : 'Assign Worker'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Worker
                  </label>
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a worker...</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.User?.name} - {worker.profession}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={canReassign ? handleReassign : handleAssignWorker}
                    disabled={assignLoading || !selectedWorker}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                  >
                    {assignLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;