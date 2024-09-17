import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainPage from './pages/TenantPage/MainPage';
import Header from './components/layouts/Header/Header';
import Footer from './components/layouts/Footer/Footer';

// Import new tenant page components
import RoomList from './pages/TenantPage/RoomList';
import VisitorManagement from './pages/TenantPage/VisitorManagement';
import Utilities from './pages/TenantPage/Utilities';
import ContactAdmin from './pages/TenantPage/ContactAdmin';
import MaintenanceRequest from './pages/TenantPage/MaintenanceRequest.jsx';
import PaymentOptions from './pages/TenantPage/PaymentOptions';

function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const isTenantPage = location.pathname.startsWith('/tenant');

    return (
        <>
            {!isAuthPage && <Header />}
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/tenant" element={<MainPage />} />
                <Route path="/tenant/room-list" element={<RoomList />} />
                <Route path="/tenant/visitor-management" element={<VisitorManagement />} />
                <Route path="/tenant/utilities" element={<Utilities />} />
                <Route path="/tenant/contact-admin" element={<ContactAdmin />} />
                <Route path="/tenant/maintenance-request" element={<MaintenanceRequest />} />
                <Route path="/tenant/payment-options" element={<PaymentOptions />} />
                
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
            {!isAuthPage && <Footer />}
        </>
    );
}

export default App;