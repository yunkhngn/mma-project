import { Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardOverviewPage from '@/features/dashboard/pages/DashboardOverviewPage';
import UserManagementPage from '@/features/users/pages/UserManagementPage';
import RouteManagementPage from '@/features/routes/pages/RouteManagementPage';
import TripManagementPage from '@/features/trips/pages/TripManagementPage';
import BookingManagementPage from '@/features/bookings/pages/BookingManagementPage';
import VehiclePage from '@/features/vehicles/pages/VehiclePage';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const routes = [
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <DashboardOverviewPage /> },
          { path: '/users', element: <UserManagementPage /> },
          { path: '/routes', element: <RouteManagementPage /> },
          { path: '/trips', element: <TripManagementPage /> },
          { path: '/bookings', element: <BookingManagementPage /> },
          { path: '/vehicles', element: <VehiclePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
