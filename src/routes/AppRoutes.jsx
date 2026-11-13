import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import { FullPageLoader } from "../components/ui/primitives";

import Login from "../pages/Login";
import ProductSelection from "../pages/ProductSelection";

// Admin tree — lazy so recharts/admin code stay out of the main bundle.
const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminUserDetails = lazy(() => import("../pages/admin/AdminUserDetails"));
const AdminActivity = lazy(() => import("../pages/admin/AdminActivity"));
const AdminProductUsage = lazy(() => import("../pages/admin/AdminProductUsage"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));

// Comparison workspace — lazy (pulls in recharts + the engine).
const ComparisonWorkspace = lazy(() => import("../pages/compare/ComparisonWorkspace"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<ProductSelection />} />
        <Route
          path="/compare/:productId"
          element={
            <Suspense fallback={<FullPageLoader />}>
              <ComparisonWorkspace />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>

      {/* Admin — frontend gate + server-side role checks on every endpoint */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<Suspense fallback={<FullPageLoader />}><AdminLayout /></Suspense>}>
          <Route index element={<Suspended el={<AdminDashboard />} />} />
          <Route path="users" element={<Suspended el={<AdminUsers />} />} />
          <Route path="users/:id" element={<Suspended el={<AdminUserDetails />} />} />
          <Route path="activity" element={<Suspended el={<AdminActivity />} />} />
          <Route path="usage" element={<Suspended el={<AdminProductUsage />} />} />
          <Route path="analytics" element={<Suspended el={<AdminAnalytics />} />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function Suspended({ el }) {
  return <Suspense fallback={<div className="py-16 text-center text-admin-muted">Loading…</div>}>{el}</Suspense>;
}
