import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import FieldDetail from '../pages/FieldDetail';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import OwnerDashboard from '../pages/OwnerDashboard';
import CustomerBookings from '../pages/CustomerBookings';
import PaymentPage from '../pages/PaymentPage';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from './MainLayout';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/field/:id', element: <FieldDetail /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/customer/bookings',
        element: (
          <ProtectedRoute requiredRole="CUSTOMER">
            <CustomerBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payment/:bookingId',
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/owner/dashboard',
        element: (
          <ProtectedRoute requiredRole="OWNER">
            <OwnerDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
