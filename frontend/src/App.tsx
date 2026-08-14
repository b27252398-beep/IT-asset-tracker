import React, { Component, ErrorInfo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import PortalLanding from "./pages/PortalLanding";
import LoginAdmin from "./pages/LoginAdmin";
import LoginStaff from "./pages/LoginStaff";
import LoginTech from "./pages/LoginTech";
import AssetsPage from "./pages/Assets";
import EmployeesPage from "./pages/Employees";
import SettingsPage from "./pages/Settings";
import SoftwarePage from "./pages/Software";
import VendorsPage from "./pages/Vendors";
import ConsumablesPage from "./pages/Consumables";
import PurchaseOrdersPage from "./pages/PurchaseOrders";
import LocationsPage from "./pages/Locations";
import MaintenanceSchedulesPage from "./pages/MaintenanceSchedules";
import ApprovalsPage from "./pages/Approvals";
import AuditLogsPage from "./pages/AuditLogs";
import IssuesPage from "./pages/Issues";
import ScannerPage from "./pages/Scanner";
import { useAuthStore } from "./store/authStore";

// ─── Role-Based Route Access Map ─────────────────────────────────────────────
const ROUTE_ROLES: Record<string, string[]> = {
  "/":                ["ADMIN", "EMPLOYEE", "TECH_TEAM"],
  "/assets":          ["ADMIN", "TECH_TEAM"],
  "/software":        ["ADMIN"],
  "/vendors":         ["ADMIN"],
  "/consumables":     ["ADMIN"],
  "/purchase-orders": ["ADMIN"],
  "/locations":       ["ADMIN"],
  "/schedules":       ["ADMIN"],
  "/approvals":       ["ADMIN"],
  "/issues":          ["ADMIN", "EMPLOYEE", "TECH_TEAM"],
  "/scanner":         ["ADMIN", "EMPLOYEE", "TECH_TEAM"],
  "/audit-logs":      ["ADMIN"],
  "/employees":       ["ADMIN"],
  "/settings":        ["ADMIN", "EMPLOYEE", "TECH_TEAM"],
};

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, path }: { children: React.ReactNode; path: string }) => {
  const token    = useAuthStore(state => state.token);
  const userRole = useAuthStore(state => state.userRole);

  if (!token) return <Navigate to="/portal" replace />;

  const allowedRoles = ROUTE_ROLES[path] ?? ["ADMIN"];
  if (!allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

// ─── Error Boundary ───────────────────────────────────────────────────────────
class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Global Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong.</h1>
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#991b1b', color: 'white', borderRadius: '4px' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/portal"       element={<PortalLanding />} />
        <Route path="/login/admin"  element={<LoginAdmin />} />
        <Route path="/login/staff"  element={<LoginStaff />} />
        <Route path="/login/tech"   element={<LoginTech />} />
        {/* Legacy login route — kept for backward compatibility */}
        <Route path="/login"        element={<Login />} />

        {/* ── Protected Routes ── */}
        <Route path="/"                element={<ProtectedRoute path="/">               <Dashboard />               </ProtectedRoute>} />
        <Route path="/assets"          element={<ProtectedRoute path="/assets">         <AssetsPage />              </ProtectedRoute>} />
        <Route path="/software"        element={<ProtectedRoute path="/software">       <SoftwarePage />            </ProtectedRoute>} />
        <Route path="/vendors"         element={<ProtectedRoute path="/vendors">        <VendorsPage />             </ProtectedRoute>} />
        <Route path="/consumables"     element={<ProtectedRoute path="/consumables">    <ConsumablesPage />         </ProtectedRoute>} />
        <Route path="/purchase-orders" element={<ProtectedRoute path="/purchase-orders"><PurchaseOrdersPage />      </ProtectedRoute>} />
        <Route path="/locations"       element={<ProtectedRoute path="/locations">      <LocationsPage />           </ProtectedRoute>} />
        <Route path="/schedules"       element={<ProtectedRoute path="/schedules">      <MaintenanceSchedulesPage /></ProtectedRoute>} />
        <Route path="/approvals"       element={<ProtectedRoute path="/approvals">      <ApprovalsPage />           </ProtectedRoute>} />
        <Route path="/issues"          element={<ProtectedRoute path="/issues">         <IssuesPage />              </ProtectedRoute>} />
        <Route path="/scanner"         element={<ProtectedRoute path="/scanner">        <ScannerPage />             </ProtectedRoute>} />
        <Route path="/audit-logs"      element={<ProtectedRoute path="/audit-logs">     <AuditLogsPage />           </ProtectedRoute>} />
        <Route path="/employees"       element={<ProtectedRoute path="/employees">      <EmployeesPage />           </ProtectedRoute>} />
        <Route path="/settings"        element={<ProtectedRoute path="/settings">       <SettingsPage />            </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
}
