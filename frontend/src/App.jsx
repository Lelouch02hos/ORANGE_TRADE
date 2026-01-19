import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Leaderboard from './pages/Leaderboard';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MacroSentiment from './pages/MacroSentiment';
import Community from './pages/Community';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import FinancialOverview from './pages/admin/FinancialOverview';
import PlatformSettings from './pages/admin/PlatformSettings';
import AuditLogs from './pages/admin/AuditLogs';
import BVCStocks from './pages/admin/BVCStocks';
import Sidebar from './components/Sidebar';

// Dashboard Wrapper Component
const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Nécessitent une authentification */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/macro"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MacroSentiment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Community />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Leaderboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <TransactionManagement />
                </DashboardLayout>
              </AdminRoute>
            }
          />
            <Route
              path="/admin/financials"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <FinancialOverview />
                  </DashboardLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <PlatformSettings />
                  </DashboardLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AuditLogs />
                  </DashboardLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bvc-stocks"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <BVCStocks />
                  </DashboardLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </Router>
    );
  }

export default App;
