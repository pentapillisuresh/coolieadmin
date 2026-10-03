import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  'payment-pending': 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
  postponed: 'bg-gray-100 text-gray-800',
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${color}`}>
      {status?.replace('-', ' ') || 'Unknown'}
    </span>
  );
};

export default StatusBadge;