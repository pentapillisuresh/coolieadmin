import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiSend,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiMessageSquare,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api';
import Loader from '../../components/Common/Loader';
import StatusBadge from '../../components/Common/StatusBadge';

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data.data);
      setNewStatus(response.data.data.status);
    } catch (error) {
      toast.error('Failed to fetch ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    try {
      setSending(true);
      await api.post(`/tickets/${id}/reply`, { message: reply });
      toast.success('Reply sent successfully');
      setReply('');
      fetchTicket();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchTicket();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loader />;
  if (!ticket) return <div className="text-center py-12 text-gray-400">Ticket not found</div>;

  const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/tickets"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Ticket #{ticket.id}</h2>
          <p className="text-gray-500">{ticket.subject}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace('-', ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={ticket.status} />
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className="text-sm text-gray-500">
                {ticket.createdAt && format(new Date(ticket.createdAt), 'dd MMM yyyy, hh:mm a')}
              </span>
            </div>
            <p className="text-gray-700">{ticket.message}</p>

            {/* Replies */}
            {ticket.TicketReplies && ticket.TicketReplies.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-4">Replies</h4>
                <div className="space-y-4">
                  {ticket.TicketReplies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {reply.User?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {reply.createdAt && format(new Date(reply.createdAt), 'dd MMM yyyy, hh:mm a')}
                          </span>
                          {reply.isInternal && (
                            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                              Internal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reply.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="font-medium text-gray-700 mb-4">Reply to Ticket</h4>
            <div className="space-y-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend /> {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="font-medium text-gray-700 mb-4">Ticket Information</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{ticket.category || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  <span>{ticket.User?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiPhone className="text-gray-400" />
                  <span>{ticket.User?.mobile}</span>
                </div>
                {ticket.User?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiMail className="text-gray-400" />
                    <span>{ticket.User.email}</span>
                  </div>
                )}
              </div>
              {ticket.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">Admin #{ticket.assignedTo}</p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Resolved At</p>
                  <p className="font-medium">
                    {format(new Date(ticket.resolvedAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;