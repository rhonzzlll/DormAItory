import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FaUsers, FaUserClock, FaBuilding, FaMoneyBillWave, FaArrowLeft, FaEye, FaFilter } from 'react-icons/fa';

const DashboardCharts = () => {
  const [dashboardData, setDashboardData] = useState({
    tenantStats: { total: 0, monthlyGrowth: [] },
    visitorStats: { total: 0, monthlyTrends: [] },
    paymentStats: { total: 0, distribution: [] },
    occupied: { total: 0, details: [] },
  });
  const [rawData, setRawData] = useState({
    tenants: [],
    visitors: [],
    payments: [],
    rooms: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drillDownState, setDrillDownState] = useState({
    level: 'overview',
    selectedRoom: null,
    selectedData: null,
    breadcrumb: [],
  });
  const [filters, setFilters] = useState({
    roomStatus: 'all', // all, available, occupied, full
    paymentStatus: 'all', // all, completed, pending
    dateRange: 'all', // all, today, week, month
    roomType: 'all', // all, single, double, etc.
    searchTerm: '',
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const tenantsResponse = await fetch('http://localhost:8080/api/users');
        const visitorsResponse = await fetch('http://localhost:8080/api/visitors');
        const paymentsResponse = await fetch('http://localhost:8080/api/payments/records');
        const roomsResponse = await fetch('http://localhost:8080/api/dorms');

        if (!tenantsResponse.ok || !visitorsResponse.ok || !paymentsResponse.ok || !roomsResponse.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const tenantStats = await tenantsResponse.json();
        const visitorForms = await visitorsResponse.json(); // Array of forms
        const paymentStats = await paymentsResponse.json();
        const occupied = await roomsResponse.json();

        // Calculate total visitors and monthly trends
        let totalVisitors = 0;
        const visitorTrends = Array(12).fill(0);
        visitorForms.forEach(form => {
          if (Array.isArray(form.visitors)) {
            totalVisitors += form.visitors.length;
            // For each visitor, count by month
            const month = form.visitDate ? new Date(form.visitDate).getMonth() : null;
            if (month !== null && !isNaN(month)) {
              visitorTrends[month] += form.visitors.length;
            }
          }
        });

        setRawData({
          tenants: tenantStats,
          visitors: visitorForms,
          payments: paymentStats,
          rooms: occupied.dorms || [],
        });

        const tenantGrowth = Array(12).fill(0);
        tenantStats.forEach((tenant) => {
          if (tenant.createdAt) {
            const month = new Date(tenant.createdAt).getMonth();
            tenantGrowth[month] += 1;
          }
        });

        const paymentDistribution = Object.entries(
          paymentStats.reduce((acc, payment) => {
            const type = payment.type || payment.paymentMethod || 'Unknown';
            acc[type] = (acc[type] || 0) + (payment.amount || 0);
            return acc;
          }, {})
        ).map(([type, value]) => ({
          type,
          value,
          count: paymentStats.filter((p) => (p.type || p.paymentMethod) === type).length,
        }));

        const totalPayments = paymentStats.reduce((acc, payment) => acc + (payment.amount || 0), 0);

        // Enhanced room processing with better type detection
        const roomDetails = occupied.dorms
          ? Object.entries(
              occupied.dorms.reduce((acc, room) => {
                let roomType = room.type || room.roomType || room.category;
                if (!roomType) {
                  if (room.capacity) {
                    if (room.capacity === 1) roomType = 'Single';
                    else if (room.capacity === 2) roomType = 'Double';
                    else if (room.capacity <= 4) roomType = 'Shared';
                    else roomType = 'Dormitory';
                  } else {
                    roomType = 'Standard';
                  }
                }
                if (!acc[roomType]) {
                  acc[roomType] = { total: 0, occupied: 0, rooms: [] };
                }
                // Use tenants.length for occupied count
                const occupiedCount = Array.isArray(room.tenants) ? room.tenants.length : 0;
                acc[roomType].total += 1;
                acc[roomType].occupied += occupiedCount;
                acc[roomType].rooms.push({
                  ...room,
                  occupied: occupiedCount, // for table display
                });
                return acc;
              }, {})
            ).map(([type, data]) => ({
              type,
              total: data.total,
              occupied: data.occupied,
              available: data.total * (data.rooms[0]?.capacity || 1) - data.occupied,
              rooms: data.rooms,
            }))
          : [];

        setDashboardData({
          tenantStats: { total: tenantStats.length, monthlyGrowth: tenantGrowth },
          visitorStats: { total: totalVisitors, monthlyTrends: visitorTrends },
          paymentStats: { total: totalPayments, distribution: paymentDistribution },
          occupied: {
            total: occupied.dorms ? occupied.dorms.length : 0,
            details: roomDetails,
          },
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleDrillDown = (type, data) => {
    const newBreadcrumb = [...drillDownState.breadcrumb, drillDownState.level];

    switch (type) {
      case 'room-occupancy':
        setDrillDownState({
          level: 'room-details',
          selectedData: data,
          breadcrumb: newBreadcrumb,
        });
        break;
      case 'tenant-room':
        setDrillDownState({
          level: 'tenant-details',
          selectedRoom: data,
          selectedData: data.rooms,
          breadcrumb: newBreadcrumb,
        });
        break;
      case 'payment-distribution':
        const paymentsByType = rawData.payments.filter((p) => (p.type || p.paymentMethod) === data.type);
        setDrillDownState({
          level: 'payment-details',
          selectedData: { type: data.type, payments: paymentsByType },
          breadcrumb: newBreadcrumb,
        });
        break;
      case 'visitor-trends': {
        const month = data.month - 1;
        // Collect all visitors from forms in the selected month
        const visitorsInMonth = [];
        rawData.visitors.forEach(form => {
          const formMonth = form.visitDate ? new Date(form.visitDate).getMonth() : null;
          if (formMonth === month && Array.isArray(form.visitors)) {
            form.visitors.forEach(visitor => {
              visitorsInMonth.push({
                ...visitor,
                visitDate: form.visitDate,
                purpose: form.purpose,
              });
            });
          }
        });
        setDrillDownState({
          level: 'visitor-details',
          selectedData: { month: data.month, visitors: visitorsInMonth },
          breadcrumb: newBreadcrumb,
        });
        break;
      }
    }
    // Reset filters when drilling down
    setFilters({
      roomStatus: 'all',
      paymentStatus: 'all',
      dateRange: 'all',
      roomType: 'all',
      searchTerm: '',
    });
  };

  const handleBreadcrumbClick = (level) => {
    const index = drillDownState.breadcrumb.indexOf(level);
    if (index === -1) {
      setDrillDownState({ level: 'overview', selectedRoom: null, selectedData: null, breadcrumb: [] });
    } else {
      setDrillDownState({
        level,
        selectedRoom: null,
        selectedData: null,
        breadcrumb: drillDownState.breadcrumb.slice(0, index),
      });
    }
    // Reset filters when navigating
    setFilters({
      roomStatus: 'all',
      paymentStatus: 'all',
      dateRange: 'all',
      roomType: 'all',
      searchTerm: '',
    });
  };

  const applyFilters = (data, filterType) => {
    let filtered = [...data];

    if (filterType === 'rooms') {
      // Filter by room status
      if (filters.roomStatus !== 'all') {
        filtered = filtered.filter(room => {
          const occupiedCount = room.occupied ? room.occupied.length : 0;
          const capacity = room.capacity || 1;
          
          switch (filters.roomStatus) {
            case 'available':
              return occupiedCount === 0;
            case 'occupied':
              return occupiedCount > 0 && occupiedCount < capacity;
            case 'full':
              return occupiedCount >= capacity;
            default:
              return true;
          }
        });
      }

      // Filter by room type
      if (filters.roomType !== 'all') {
        filtered = filtered.filter(room => {
          const roomType = room.type || room.roomType || room.category || 'Standard';
          return roomType.toLowerCase().includes(filters.roomType.toLowerCase());
        });
      }

      // Filter by search term
      if (filters.searchTerm) {
        filtered = filtered.filter(room => {
          const searchTerm = filters.searchTerm.toLowerCase();
          const roomNumber = (room.roomNumber || '').toString().toLowerCase();
          const roomType = (room.type || room.roomType || room.category || '').toLowerCase();
          return roomNumber.includes(searchTerm) || roomType.includes(searchTerm);
        });
      }
    }

    if (filterType === 'payments') {
      // Filter by payment status
      if (filters.paymentStatus !== 'all') {
        filtered = filtered.filter(payment => {
          const status = (payment.status || 'completed').toLowerCase();
          return status === filters.paymentStatus;
        });
      }

      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.paymentDate || payment.createdAt);
          
          switch (filters.dateRange) {
            case 'today':
              return paymentDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return paymentDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return paymentDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      // Filter by search term (reference number or amount)
      if (filters.searchTerm) {
        filtered = filtered.filter(payment => {
          const searchTerm = filters.searchTerm.toLowerCase();
          const reference = (payment.referenceNumber || payment.reference || '').toLowerCase();
          const amount = (payment.amount || 0).toString();
          return reference.includes(searchTerm) || amount.includes(searchTerm);
        });
      }
    }

    if (filterType === 'visitors') {
      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        filtered = filtered.filter(visitor => {
          const visitDate = new Date(visitor.visitDate || visitor.createdAt);
          
          switch (filters.dateRange) {
            case 'today':
              return visitDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return visitDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return visitDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      // Filter by search term
      if (filters.searchTerm) {
        filtered = filtered.filter(visitor => {
          const searchTerm = filters.searchTerm.toLowerCase();
          const name = (visitor.visitorName || visitor.name || '').toLowerCase();
          const relationship = (visitor.relationship || '').toLowerCase();
          const purpose = (visitor.purpose || visitor.reason || '').toLowerCase();
          return name.includes(searchTerm) || relationship.includes(searchTerm) || purpose.includes(searchTerm);
        });
      }
    }

    if (filterType === 'tenants') {
      // Filter by search term
      if (filters.searchTerm) {
        filtered = filtered.filter(tenant => {
          const searchTerm = filters.searchTerm.toLowerCase();
          const firstName = (tenant.firstName || '').toLowerCase();
          const lastName = (tenant.lastName || '').toLowerCase();
          const name = (tenant.name || tenant.username || '').toLowerCase();
          const email = (tenant.email || '').toLowerCase();
          return firstName.includes(searchTerm) || lastName.includes(searchTerm) || 
                 name.includes(searchTerm) || email.includes(searchTerm);
        });
      }
    }

    return filtered;
  };

  const FilterBar = ({ filterType }) => (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex items-center mb-3">
        <FaFilter className="mr-2" />
        <span className="font-semibold">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>

        {/* Room-specific filters */}
        {filterType === 'rooms' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Room Status</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.roomStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, roomStatus: e.target.value }))}
              >
                <option value="all">All Rooms</option>
                <option value="available">Available</option>
                <option value="occupied">Partially Occupied</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.roomType}
                onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="shared">Shared</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </>
        )}

        {/* Payment-specific filters */}
        {filterType === 'payments' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </>
        )}

        {/* Visitor-specific filters */}
        {(filterType === 'visitors') && (
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const DashboardCard = ({ title, icon: Icon, value, colorClass, onClick }) => (
    <div
      className={`flex justify-between items-center ${colorClass} text-white p-4 rounded-lg shadow-md ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      }`}
      onClick={onClick}
    >
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="flex items-center">
        <Icon className="text-3xl opacity-70" />
        {onClick && <FaEye className="text-xl ml-2 opacity-70" />}
      </div>
    </div>
  );

  const Breadcrumb = () => (
    <div className="flex items-center mb-4 text-sm text-gray-600">
      <button
        onClick={() => handleBreadcrumbClick('overview')}
        className="hover:text-blue-600 transition-colors"
      >
        Dashboard
      </button>
      {drillDownState.breadcrumb.map((crumb, index) => (
        <span key={index}>
          <span className="mx-2">{'>'}</span>
          <button
            onClick={() => handleBreadcrumbClick(crumb)}
            className="hover:text-blue-600 transition-colors capitalize"
          >
            {crumb.replace('-', ' ')}
          </button>
        </span>
      ))}
      {drillDownState.level !== 'overview' && (
        <>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-medium capitalize">
            {drillDownState.level.replace('-', ' ')}
          </span>
        </>
      )}
    </div>
  );

  const RoomDetailsView = () => {
    const filteredRooms = applyFilters(drillDownState.selectedData.rooms, 'rooms');
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Room Type: {drillDownState.selectedData.type}</h2>
          <button
            onClick={() => setDrillDownState({ level: 'overview', selectedRoom: null, selectedData: null, breadcrumb: [] })}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Overview
          </button>
        </div>

        <FilterBar filterType="rooms" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Rooms</h3>
            <p className="text-2xl font-bold text-blue-600">{drillDownState.selectedData.total}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Occupied</h3>
            <p className="text-2xl font-bold text-red-600">{drillDownState.selectedData.occupied}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Available</h3>
            <p className="text-2xl font-bold text-green-600">{drillDownState.selectedData.available}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredRooms.length} of {drillDownState.selectedData.rooms.length} rooms
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Room Number</th>
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Current Occupants</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{room.roomNumber || `Room ${index + 1}`}</td>
                  <td className="px-4 py-2">{room.capacity || 'N/A'}</td>
                  <td className="px-4 py-2">{room.occupied ? room.occupied.length : 0}</td>
                  <td className="px-4 py-2">{room.gender || 'Any'}</td>
                  <td className="px-4 py-2">₱{room.price || 0}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (room.occupied?.length || 0) >= (room.capacity || 1) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(room.occupied?.length || 0) >= (room.capacity || 1) ? 'Full' : 'Available'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {room.occupied && room.occupied.length > 0 && (
                      <button 
                        onClick={() => handleDrillDown('tenant-room', room)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Tenants
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TenantDetailsView = () => {
    const tenants = drillDownState.selectedRoom?.occupied || [];
    const filteredTenants = applyFilters(tenants, 'tenants');
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Tenants in Room {drillDownState.selectedRoom?.roomNumber || 'Selected Room'}
          </h2>
          <button 
            onClick={() => setDrillDownState({ level: 'room-details', selectedData: drillDownState.selectedData, breadcrumb: ['overview'] })}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Rooms
          </button>
        </div>

        <FilterBar filterType="tenants" />

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTenants.length} of {tenants.length} tenants
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Move-in Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {tenant.firstName && tenant.lastName 
                        ? `${tenant.firstName} ${tenant.lastName}`
                        : tenant.name || tenant.username || 'N/A'}
                    </td>
                    <td className="px-4 py-2">{tenant.email || 'N/A'}</td>
                    <td className="px-4 py-2">{tenant.phone || tenant.phoneNumber || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {tenant.moveInDate || tenant.createdAt 
                        ? new Date(tenant.moveInDate || tenant.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No tenants found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const PaymentDetailsView = () => {
    const filteredPayments = applyFilters(drillDownState.selectedData.payments, 'payments');
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {drillDownState.selectedData.type} Payments
          </h2>
          <button 
            onClick={() => setDrillDownState({ level: 'overview', selectedRoom: null, selectedData: null, breadcrumb: [] })}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Overview
          </button>
        </div>

        <FilterBar filterType="payments" />

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Amount (Filtered)</h3>
              <p className="text-2xl font-bold text-blue-600">
                ₱{filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Transactions (Filtered)</h3>
                           <p className="text-2xl font-bold text-green-600">
                {filteredPayments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Reference Number</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {payment.referenceNumber || payment.reference || 'N/A'}
                    </td>
                    <td className="px-4 py-2">₱{payment.amount || 0}</td>
                    <td className="px-4 py-2">
                      {payment.paymentMethod || payment.type || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      {payment.paymentDate || payment.createdAt
                        ? new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          (payment.status || 'completed').toLowerCase() === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {(payment.status || 'completed').toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No payments found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const VisitorDetailsView = () => {
    const filteredVisitors = applyFilters(drillDownState.selectedData.visitors, 'visitors');

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Visitors {drillDownState.selectedData.month === 'all' ? 'in All Months' : `in Month ${drillDownState.selectedData.month}`}
          </h2>
          <button
            onClick={() => setDrillDownState({ level: 'overview', selectedRoom: null, selectedData: null, breadcrumb: [] })}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Overview
          </button>
        </div>

        <FilterBar filterType="visitors" />

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredVisitors.length} of {drillDownState.selectedData.visitors.length} visitors
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Relationship</th>
                <th className="px-4 py-2 text-left">Purpose</th>
                <th className="px-4 py-2 text-left">Visit Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {visitor.fullName || visitor.visitorName || visitor.name || 'N/A'}
                    </td>
                    <td className="px-4 py-2">{visitor.relationship || 'N/A'}</td>
                    <td className="px-4 py-2">{visitor.purpose || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {visitor.visitDate
                        ? new Date(visitor.visitDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No visitors found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Breadcrumb />

      {isLoading ? (
        <div className="text-center">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {drillDownState.level === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DashboardCard
                  title="Total Tenants"
                  icon={FaUsers}
                  value={dashboardData.tenantStats.total}
                  colorClass="bg-blue-500"
                />
                <DashboardCard
                  title="Total Visitors"
                  icon={FaUserClock}
                  value={dashboardData.visitorStats.total}
                  colorClass="bg-green-500"
                  onClick={() => handleDrillDown('visitor-trends', { month: 'all' })}
                />
                <DashboardCard
                  title="Total Payments"
                  icon={FaMoneyBillWave}
                  value={`₱${dashboardData.paymentStats.total}`}
                  colorClass="bg-yellow-500"
                  onClick={() => handleDrillDown('payment-distribution', dashboardData.paymentStats.distribution[0])}
                />
                <DashboardCard
                  title="Total Rooms"
                  icon={FaBuilding}
                  value={dashboardData.occupied.total}
                  colorClass="bg-red-500"
                  onClick={() => handleDrillDown('room-occupancy', dashboardData.occupied.details[0])}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                {/* Tenant Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Tenant Growth (Monthly)</h3>
                  <LineChart
                    width={400}
                    height={300}
                    data={dashboardData.tenantStats.monthlyGrowth.map((value, index) => ({
                      month: new Date(2025, index).toLocaleString('default', { month: 'short' }),
                      tenants: value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tenants" stroke="#8884d8" />
                  </LineChart>
                </div>

                {/* Visitor Trends Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Visitor Trends (Monthly)</h3>
                  <BarChart
                    width={400}
                    height={300}
                    data={dashboardData.visitorStats.monthlyTrends.map((value, index) => ({
                      month: new Date(2025, index).toLocaleString('default', { month: 'short' }),
                      visitors: value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#82ca9d" />
                  </BarChart>
                </div>

                {/* Payment Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Payment Distribution</h3>
                  <BarChart
                    width={400}
                    height={300}
                    data={dashboardData.paymentStats.distribution}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" />
                    <Tooltip formatter={(value) => `₱${value}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Amount" />
                    <Bar dataKey="count" fill="#82ca9d" name="Transactions" />
                  </BarChart>
                </div>

                {/* Room Occupancy Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Room Occupancy</h3>
                  <BarChart
                    width={400}
                    height={300}
                    data={dashboardData.occupied.details.map((roomType) => ({
                      type: roomType.type,
                      occupied: roomType.occupied,
                      available: roomType.available,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="occupied" fill="#FF8042" />
                    <Bar dataKey="available" fill="#00C49F" />
                  </BarChart>
                </div>
              </div>
            </div>
          )}

          {drillDownState.level === 'room-details' && <RoomDetailsView />}
          {drillDownState.level === 'tenant-details' && <TenantDetailsView />}
          {drillDownState.level === 'payment-details' && <PaymentDetailsView />}
          {drillDownState.level === 'visitor-details' && <VisitorDetailsView />}
        </>
      )}
    </div>
  );
};

export default DashboardCharts;