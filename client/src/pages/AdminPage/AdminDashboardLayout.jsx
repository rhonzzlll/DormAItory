import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin-view/Sidebar/Sidebar';
import Header from '../../components/layouts/Header/Header';
import DashboardContent from './DashboardContent';
import AdminContentTemplate from './AdminContentTemplate';

const AdminDashboardLayout = () => {
  const location = useLocation();
  const isDashboardHome = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {isDashboardHome ? <DashboardContent /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;