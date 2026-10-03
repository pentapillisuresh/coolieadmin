import React from 'react';
import { format } from 'date-fns';
import StatusBadge from '../Common/StatusBadge';

const RecentActivity = ({ bookings }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No recent bookings
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-xs font-bold">#{booking.id}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {booking.User?.name || 'Guest'}
              </p>
              <p className="text-xs text-gray-500">
                {booking.Service?.name || 'Service'} • 
                {booking.scheduledDate && format(new Date(booking.scheduledDate), 'dd MMM yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-700">
              ₹{booking.totalAmount}
            </span>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;