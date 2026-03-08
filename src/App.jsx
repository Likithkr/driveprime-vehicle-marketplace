import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { ToastProvider } from './components/ToastProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CarDetailPage from './pages/CarDetailPage';
import DealerSubmitPage from './pages/DealerSubmitPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminAddEditCarPage from './pages/admin/AdminAddEditCarPage';
import AdminReviewPage from './pages/admin/AdminReviewPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminDealershipsPage from './pages/admin/AdminDealershipsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';

// Admin layout wrapper (no nav/footer)
function AdminLayout({ children }) {
  return <>{children}</>;
}

// Public layout with navbar and footer
function PublicLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
            <Route path="/car/:id" element={<PublicLayout><CarDetailPage /></PublicLayout>} />
            <Route path="/dealer-submit" element={<PublicLayout><DealerSubmitPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
            <Route path="/profile" element={<PublicLayout><CustomerProfilePage /></PublicLayout>} />

            {/* Admin routes — full page without nav */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/listings" element={<AdminListingsPage />} />
            <Route path="/admin/add-car" element={<AdminAddEditCarPage />} />
            <Route path="/admin/edit-car/:id" element={<AdminAddEditCarPage />} />
            <Route path="/admin/review" element={<AdminReviewPage />} />
            <Route path="/admin/brands" element={<AdminBrandsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/dealerships" element={<AdminDealershipsPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
