import React from 'react';
import { FaUsers, FaUserClock, FaBuilding, FaHome, FaInfoCircle } from 'react-icons/fa';

const DashboardItem = ({ title, icon: Icon, colorClass }) => (
  <div className={`${colorClass} text-white p-4 rounded-lg flex flex-col justify-between h-24`}>
    <div className="flex justify-between items-start">
      <span className="text-lg font-semibold">{title}</span>
      <Icon className="text-2xl opacity-50" />
    </div>
    <div className="flex justify-between items-center mt-2">
      <span className="text-sm">More Info</span>
      <FaInfoCircle className="text-sm" />
    </div>
  </div>
);

const DashboardContent = () => {
  const dashboardItems = [
    { title: 'Total Tenants', icon: FaUsers, colorClass: 'bg-blue-500' },
    { title: "Today's Visitors", icon: FaUserClock, colorClass: 'bg-green-500' },
    { title: 'Rooms Occupied', icon: FaBuilding, colorClass: 'bg-yellow-500' },
    { title: 'Available Rooms', icon: FaHome, colorClass: 'bg-red-500' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          <span className="mr-2">🏠 Home  </span>
          <span>Dashboard</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardItems.map((item, index) => (
          <DashboardItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default DashboardContent;