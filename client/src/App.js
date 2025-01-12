import { MaintenanceProvider } from './redux/MaintenanceContext';  // Correct import path
import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Tenant Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainPage from './pages/TenantPage/MainPage';
import Header from './components/layouts/Header/Header';
import Footer from './components/layouts/Footer/Footer';
import RoomList from './pages/TenantPage/RoomList';
import RoomView from './pages/TenantPage/RoomView';  // Import RoomView component
import VisitorManagement from './pages/TenantPage/VisitorManagement';
import VisitorLogs from './pages/TenantPage/VisitorLogs'; // Import VisitorLogs component
import MaintenanceLogs from './pages/TenantPage/MaintenanceLogs'; // Import MaintenanceLogs component
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

// Tenant Sidebar
import TenantSidebar from './components/layouts/TenantSidebar';

const clientId = "949553693113-0ge0ak1tr940too033kavmkfb1iedbfh.apps.googleusercontent.com"; // Replace with your actual Google client ID

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminDashboard = location.pathname.startsWith('/admin');
  const isTenantPageWithSidebar = location.pathname.startsWith('/tenant') && location.pathname !== '/tenant';

  // Assume tenantId is obtained from authentication context or similar
  const tenantId = "exampleTenantId"; // Replace with actual tenant ID retrieval logic

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MaintenanceProvider>
        {!isAuthPage && !isAdminDashboard && <Header />}
        <div className="flex">
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

              {/* Default Redirect */}
              <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
          </div>
        </div>
        {!isAuthPage && !isAdminDashboard && <Footer />}
      </MaintenanceProvider>
    </GoogleOAuthProvider>
  );
}

export default App;