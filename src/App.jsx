import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

// ============================================================
// LAYOUT
// ============================================================

import AdminLayout from './components/Layout/AdminLayout';

// ============================================================
// PAGES
// ============================================================

// Authentication
import Login from './pages/Login';

// Dashboard
import Dashboard from './pages/Dashboard';

// Users
import UsersList from './pages/Users/UsersList';

// Workers
import WorkersList from './pages/Workers/WorkersList';
import WorkerDetail from './pages/Workers/WorkerDetail';

// Bookings
import BookingsList from './pages/Bookings/BookingsList';
import BookingDetail from './pages/Bookings/BookingDetail';

// Payments
import PaymentsList from './pages/Payments/PaymentsList';

// Jobs
import JobsList from './pages/Jobs/JobsList';

// Reviews
import ReviewsList from './pages/Reviews/ReviewsList';

// Notifications
import Notifications from './pages/Notifications/Notifications';

// Services
import ServicesList from './pages/Services/ServicesList';
import ServiceForm from './pages/Services/ServiceForm';

// Categories
import CategoriesList from './pages/Categories/CategoriesList';
import CategoryForm from './pages/Categories/CategoryForm';

// Tickets
import TicketsList from './pages/Tickets/TicketsList';
import TicketDetail from './pages/Tickets/TicketDetail';

// Promotions
import PromotionsList from './pages/Promotions/PromotionsList';
import PromotionForm from './pages/Promotions/PromotionForm';

// Training
import TrainingsList from './pages/Training/TrainingsList';
import TrainingForm from './pages/Training/TrainingForm';

// FAQ
import FAQList from './pages/FAQ/FAQList';
import FAQForm from './pages/FAQ/FAQForm';

// Settings
import Settings from './pages/Settings/Settings';

// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Authentication loading
  if (loading) {
    return null;
  }

  // Not logged in or not admin
  if (!user || user.role !== 'admin') {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />

        <Routes>

          {/* ==================================================
              LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ==================================================
              ADMIN LAYOUT
          ================================================== */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            {/* ==================================================
                DEFAULT
            ================================================== */}

            <Route
              index
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            {/* ==================================================
                USERS
            ================================================== */}

            <Route
              path="users"
              element={<UsersList />}
            />

            {/* ==================================================
                WORKERS
            ================================================== */}

            <Route
              path="workers"
              element={<WorkersList />}
            />

            {/* Worker Details */}
            <Route
              path="workers/:id"
              element={<WorkerDetail />}
            />

            {/* ==================================================
                BOOKINGS
            ================================================== */}

            <Route
              path="bookings"
              element={<BookingsList />}
            />

            {/* Booking Details */}
            <Route
              path="bookings/:id"
              element={<BookingDetail />}
            />

            {/* ==================================================
                JOBS & ASSIGNMENTS
            ================================================== */}

            <Route
              path="jobs"
              element={<JobsList />}
            />

            {/* ==================================================
                PAYMENTS
            ================================================== */}

            <Route
              path="payments"
              element={<PaymentsList />}
            />

            {/* ==================================================
                REVIEWS
            ================================================== */}

            <Route
              path="reviews"
              element={<ReviewsList />}
            />

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <Route
              path="notifications"
              element={<Notifications />}
            />

            {/* ==================================================
                SERVICES
            ================================================== */}

            <Route
              path="services"
              element={<ServicesList />}
            />

            {/* Create Service */}
            <Route
              path="services/new"
              element={<ServiceForm />}
            />

            {/* Edit Service */}
            <Route
              path="services/:id/edit"
              element={<ServiceForm />}
            />

            {/* ==================================================
                CATEGORIES
            ================================================== */}

            <Route
              path="categories"
              element={<CategoriesList />}
            />

            {/* Create Category */}
            <Route
              path="categories/new"
              element={<CategoryForm />}
            />

            {/* Edit Category */}
            <Route
              path="categories/:id/edit"
              element={<CategoryForm />}
            />

            {/* ==================================================
                SUPPORT TICKETS
            ================================================== */}

            <Route
              path="tickets"
              element={<TicketsList />}
            />

            {/* Ticket Details */}
            <Route
              path="tickets/:id"
              element={<TicketDetail />}
            />

            {/* ==================================================
                PROMOTIONS
            ================================================== */}

            <Route
              path="promotions"
              element={<PromotionsList />}
            />

            {/* Create Promotion */}
            <Route
              path="promotions/new"
              element={<PromotionForm />}
            />

            {/* Edit Promotion */}
            <Route
              path="promotions/:id/edit"
              element={<PromotionForm />}
            />

            {/* ==================================================
                TRAINING
            ================================================== */}

            <Route
              path="training"
              element={<TrainingsList />}
            />

            {/* Create Training */}
            <Route
              path="training/new"
              element={<TrainingForm />}
            />

            {/* Edit Training */}
            <Route
              path="training/:id/edit"
              element={<TrainingForm />}
            />

            {/* ==================================================
                FAQ
            ================================================== */}

            <Route
              path="faq"
              element={<FAQList />}
            />

            {/* Create FAQ */}
            <Route
              path="faq/new"
              element={<FAQForm />}
            />

            {/* Edit FAQ */}
            <Route
              path="faq/:id/edit"
              element={<FAQForm />}
            />

            {/* ==================================================
                SETTINGS
            ================================================== */}

            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;