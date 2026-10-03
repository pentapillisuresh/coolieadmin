import React, { useState } from 'react';
import {
  Bell,
  Send,
  UsersRound,
  UserRound,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import notificationAPI from '../../api/notifications';

export default function Notifications() {
  const [f, setF] = useState({
    userId: '',
    title: '',
    body: '',
    type: 'system',
    data: '{}',
    broadcast: false,
  });

  const [busy, setBusy] = useState(false);

  const updateField = (field, value) => {
    setF((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const send = async (e) => {
    e.preventDefault();

    try {
      setBusy(true);

      let data = {};

      try {
        data = JSON.parse(f.data || '{}');
      } catch {
        toast.error('Notification data must be valid JSON');
        setBusy(false);
        return;
      }

      if (!f.broadcast && !f.userId.trim()) {
        toast.error('Please enter User ID');
        setBusy(false);
        return;
      }

      if (!f.title.trim()) {
        toast.error('Please enter notification title');
        setBusy(false);
        return;
      }

      if (!f.body.trim()) {
        toast.error('Please enter notification message');
        setBusy(false);
        return;
      }

      await notificationAPI.send({
        ...f,
        data,
        userId: f.broadcast ? undefined : f.userId,
      });

      toast.success(
        f.broadcast
          ? 'Broadcast sent successfully'
          : 'Notification sent successfully'
      );

      setF((prev) => ({
        ...prev,
        title: '',
        body: '',
        data: '{}',
      }));
    } catch (e) {
      toast.error(
        e.response?.data?.error || 'Failed to send notification'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">

      {/* PAGE HEADER */}
      <div>
        <p className="eyebrow">ENGAGEMENT</p>

        <h1 className="page-title">
          Notifications
        </h1>

        <p className="page-subtitle">
          Send targeted or broadcast notifications through the backend FCM workflow.
        </p>
      </div>

      {/* MAIN FORM */}
      <form
        onSubmit={send}
        className="card space-y-7"
      >

        {/* DELIVERY */}
        <div>
          <label className="label mb-3 block">
            Delivery Method
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* SPECIFIC USER */}
            <button
              type="button"
              onClick={() =>
                updateField('broadcast', false)
              }
              className={`w-full flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition ${
                !f.broadcast
                  ? 'border-[#FD9A00] bg-[#FFF7EA] text-[#111827]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  !f.broadcast
                    ? 'bg-[#FD9A00] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <UserRound size={19} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  Specific User
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  Send to one user
                </p>
              </div>

              {!f.broadcast && (
                <CheckCircle2
                  size={19}
                  className="text-[#FD9A00]"
                />
              )}
            </button>

            {/* BROADCAST */}
            <button
              type="button"
              onClick={() =>
                updateField('broadcast', true)
              }
              className={`w-full flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition ${
                f.broadcast
                  ? 'border-[#FD9A00] bg-[#FFF7EA] text-[#111827]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  f.broadcast
                    ? 'bg-[#FD9A00] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <UsersRound size={19} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  Broadcast
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  Send to multiple users
                </p>
              </div>

              {f.broadcast && (
                <CheckCircle2
                  size={19}
                  className="text-[#FD9A00]"
                />
              )}
            </button>

          </div>
        </div>

        {/* USER ID */}
        {!f.broadcast && (
          <div>
            <label className="label">
              User ID
            </label>

            <input
              required
              type="text"
              className="input w-full"
              value={f.userId}
              onChange={(e) =>
                updateField('userId', e.target.value)
              }
              placeholder="Enter user ID"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Enter the ID of the user who should receive this notification.
            </p>
          </div>
        )}

        {/* TITLE + TYPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="label">
              Notification Title
            </label>

            <input
              required
              type="text"
              className="input w-full"
              value={f.title}
              onChange={(e) =>
                updateField('title', e.target.value)
              }
              placeholder="Enter notification title"
            />
          </div>

          <div>
            <label className="label">
              Notification Type
            </label>

            <select
              className="input w-full"
              value={f.type}
              onChange={(e) =>
                updateField('type', e.target.value)
              }
            >
              <option value="system">System</option>
              <option value="booking">Booking</option>
              <option value="job">Job</option>
              <option value="training">Training</option>
              <option value="payment">Payment</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>

        </div>

        {/* MESSAGE */}
        <div>
          <label className="label">
            Message
          </label>

          <textarea
            required
            rows={6}
            className="input w-full resize-none"
            value={f.body}
            onChange={(e) =>
              updateField('body', e.target.value)
            }
            placeholder="Write your notification message..."
          />

          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-slate-400">
              Keep your message clear and concise.
            </p>

            <p className="text-xs text-slate-400">
              {f.body.length} characters
            </p>
          </div>
        </div>

        {/* EXTRA DATA */}
        <div>
          <label className="label">
            Extra Data
            <span className="ml-2 text-xs font-normal text-slate-400">
              JSON
            </span>
          </label>

          <textarea
            rows={5}
            className="input w-full resize-none font-mono text-sm"
            value={f.data}
            onChange={(e) =>
              updateField('data', e.target.value)
            }
            placeholder='{"bookingId": 123}'
          />

          <p className="mt-1.5 text-xs text-slate-400">
            Optional data that can be received by the mobile application.
          </p>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-100 pt-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Bell size={16} />

              <span>
                {f.broadcast
                  ? 'This notification will be sent to all users.'
                  : 'This notification will be sent to the selected user.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary inline-flex items-center justify-center gap-2 min-w-[190px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={17} />

              {busy
                ? 'Sending...'
                : 'Send Notification'}
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}