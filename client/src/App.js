import { MaintenanceProvider } from './redux/MaintenanceContext'; // Correct import path
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Footer from './components/layouts/Footer/Footer'; // Adjust path if Footer is in a subdirectory
import Header from './components/layouts/Header/Header'; // Adjust path if Header is in a subdirectory

// Tenant Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainPage from './pages/TenantPage/MainPage';
import RoomList from './pages/TenantPage/RoomList';
import RoomView from './pages/TenantPage/RoomView';
import VisitorManagement from './pages/TenantPage/VisitorManagement';
import VisitorLogs from './pages/TenantPage/VisitorLogs';
import MaintenanceLogs from './pages/TenantPage/MaintenanceLogs';
import Records from './pages/TenantPage/Records';
import Utilities from './pages/TenantPage/Utilities';
import ContactAdmin from './pages/TenantPage/ContactAdmin';
import MaintenanceRequest from './pages/TenantPage/MaintenanceRequest';
import PaymentOptions from './pages/TenantPage/PaymentOptions';
import Profile from './pages/TenantPage/Profile';
import ChatBot from './pages/TenantPage/ChatBot';

// Admin Pages
import AdminDashboardLayout from './pages/AdminPage/AdminDashboardLayout';
import DashboardContent from './pages/AdminPage/DashboardContent';
import AdminRooms from './pages/AdminPage/AdminRooms';
import AdminVisitors from './pages/AdminPage/AdminVisitors';
import AdminUtilities from './pages/AdminPage/AdminUtilities';
import AdminContacts from './pages/AdminPage/AdminContacts';
import AdminMaintenance from './pages/AdminPage/AdminMaintenance';
import AdminPayments from './pages/AdminPage/AdminPayments';
import AdminRecords from './pages/AdminPage/AdminRecords';
import AdminAnnouncements from './pages/AdminPage/AdminAnnouncements';
import AdminChatbot from './pages/AdminPage/AdminChatbot';
import AdminChatbotPrompts from './pages/AdminPage/AdminChatbotPrompts';
import AdminUsers from './pages/AdminPage/AdminUsers';
import AdminManageRooms from './pages/AdminPage/AdminManageRooms';
import ProfileHistory from './pages/TenantPage/ProfileHistory'; // Adjust path if needed
// Tenant Sidebar
import TenantSidebar from './components/layouts/TenantSidebar';

const clientId = "949553693113-0ge0ak1tr940too033kavmkfb1iedbfh.apps.googleusercontent.com"; // Replace with your actual Google client ID

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminDashboard = location.pathname.startsWith('/admin');
  // Show sidebar for /tenant/* and /profile/*
  const isTenantPageWithSidebar =
    (location.pathname.startsWith('/tenant') && location.pathname !== '/tenant') ||
    location.pathname.startsWith('/profile');

  // Assume tenantId is obtained from authentication context or similar
  const tenantId = "exampleTenantId"; // Replace with actual tenant ID retrieval logic
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MaintenanceProvider>
        {/* Render Header only for non-auth and non-admin pages */}
        {!isAuthPage && !isAdminDashboard && <Header />}
        <div className="flex">
          {/* Render Tenant Sidebar for tenant and profile pages */}
          {isTenantPageWithSidebar && <TenantSidebar />}
          <div className="flex-1">
            <Routes>
              {/* Authentication Pages */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<DashboardContent />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="visitors" element={<AdminVisitors />} />
                <Route path="utilities" element={<AdminUtilities />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="maintenance" element={<AdminMaintenance />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="records" element={<AdminRecords />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="managerooms" element={<AdminManageRooms />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="chatbot" element={<AdminChatbot />} />
                <Route path="prompts" element={<AdminChatbotPrompts />} />
              </Route>

              {/* Tenant Pages */}
              <Route path="/tenant" element={<MainPage />} />
              <Route path="/tenant/room-list" element={<RoomList />} />
              <Route path="/tenant/room-view/:id" element={<RoomView />} />
              <Route path="/tenant/records" element={<Records />} />
              <Route path="/tenant/visitor-management" element={<VisitorManagement tenantId={tenantId} />} />
              <Route path="/tenant/visitor-management/visitor-logs" element={<VisitorLogs tenantId={tenantId} />} />
              <Route path="/tenant/maintenance-request/maintenance-logs" element={<MaintenanceLogs tenantId={tenantId} />} />
              <Route path="/tenant/utilities" element={<Utilities />} />
              <Route path="/tenant/contact-admin" element={<ContactAdmin />} />
              <Route path="/tenant/maintenance-request" element={<MaintenanceRequest tenantId={tenantId} />} />
              <Route path="/tenant/payment-options" element={<PaymentOptions />} />
              <Route path="/tenant/chatbot" element={<ChatBot />} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/history" element={<ProfileHistory />} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
          </div>
        </div>
        {/* Render Footer only for non-auth and non-admin pages */}
        {!isAuthPage && !isAdminDashboard && <Footer />}
      </MaintenanceProvider>
    </GoogleOAuthProvider>
  );
}

export default App;