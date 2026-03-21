import React from 'react';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import App from '../App';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminRoute from '../components/ui/AdminRoute';
import ProtectedRoute from '../components/ui/ProtectedRoute';
import Cancel from '../pages/Cancel';
import Home from '../pages/Home';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Pricing from '../pages/Pricing';
import Register from '../pages/Register';
import Success from '../pages/Success';
import AdminCharities from '../pages/admin/AdminCharities';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDraws from '../pages/admin/AdminDraws';
import AdminSubscriptions from '../pages/admin/AdminSubscriptions';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminWinnings from '../pages/admin/AdminWinnings';
import DashboardCharity from '../pages/dashboard/Charity';
import DashboardDraw from '../pages/dashboard/Draw';
import DashboardOverview from '../pages/dashboard/Overview';
import DashboardScores from '../pages/dashboard/Scores';
import DashboardSubscription from '../pages/dashboard/Subscription';
import DashboardWinnings from '../pages/dashboard/Winnings';

const rootRoute = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
  notFoundComponent: NotFound,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: () => (
    <ProtectedRoute>
      <Pricing />
    </ProtectedRoute>
  ),
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  component: () => (
    <ProtectedRoute>
      <Success />
    </ProtectedRoute>
  ),
});

const cancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cancel',
  component: () => (
    <ProtectedRoute>
      <Cancel />
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardOverview,
});

const dashboardSubscriptionRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'subscription',
  component: DashboardSubscription,
});

const dashboardScoresRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'scores',
  component: DashboardScores,
});

const dashboardDrawRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'draw',
  component: DashboardDraw,
});

const dashboardCharityRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'charity',
  component: DashboardCharity,
});

const dashboardWinningsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'winnings',
  component: DashboardWinnings,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  ),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: () => <Navigate to="/admin/analytics" />,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'dashboard',
  component: AdminDashboard,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'analytics',
  component: AdminDashboard,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
  component: AdminUsers,
});

const adminSubscriptionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'subscriptions',
  component: AdminSubscriptions,
});

const adminDrawsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'draws',
  component: AdminDraws,
});

const adminCharitiesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'charity',
  component: AdminCharities,
});

const adminWinningsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'winnings',
  component: AdminWinnings,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: () => <Navigate to="/dashboard" />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  pricingRoute,
  successRoute,
  cancelRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    dashboardSubscriptionRoute,
    dashboardScoresRoute,
    dashboardDrawRoute,
    dashboardCharityRoute,
    dashboardWinningsRoute,
  ]),
  adminRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminAnalyticsRoute,
    adminUsersRoute,
    adminSubscriptionsRoute,
    adminDrawsRoute,
    adminCharitiesRoute,
    adminWinningsRoute,
  ]),
  accountRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
});

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export { router };

