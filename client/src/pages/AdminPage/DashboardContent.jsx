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
import { FaUsers, FaUserClock, FaBuilding, FaMoneyBillWave } from 'react-icons/fa';

const DashboardCharts = () => {
  const [dashboardData, setDashboardData] = useState({
    tenantStats: { total: 0, monthlyGrowth: [] },
    visitorStats: { total: 0, monthlyTrends: [] },
    paymentStats: { total: 0, distribution: [] },
    occupied: { total: 0, details: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const tenantsResponse = await fetch('http://dormaitory.online/api/users');
        const visitorsResponse = await fetch('http://dormaitory.online/api/visitors');
        const paymentsResponse = await fetch('http://dormaitory.online/api/payments/records');
        const roomsResponse = await fetch('http://dormaitory.online/api/dorms');

        if (!tenantsResponse.ok || !visitorsResponse.ok || !paymentsResponse.ok || !roomsResponse.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const tenantStats = await tenantsResponse.json();
        const visitorStats = await visitorsResponse.json();
        const paymentStats = await paymentsResponse.json();
        const occupied = await roomsResponse.json();

        // Process tenant stats
        const tenantGrowth = Array(12).fill(0);
        tenantStats.forEach((tenant) => {
          if (tenant.createdAt) {
            const month = new Date(tenant.createdAt).getMonth();
            tenantGrowth[month] += 1;
          }
        });

        // Process visitor stats
        const visitorTrends = Array(12).fill(0);
        visitorStats.forEach((visitor) => {
          if (visitor.visitDate) {
            const month = new Date(visitor.visitDate).getMonth();
            visitorTrends[month] += 1;
          }
        });

        // Process payment stats
        const paymentDistribution = Object.entries(
          paymentStats.reduce((acc, payment) => {
            acc[payment.type] = (acc[payment.type] || 0) + payment.amount;
            return acc;
          }, {})
        ).map(([type, value]) => ({ type, value }));

        const totalPayments = paymentStats.reduce((acc, payment) => acc + payment.amount, 0);

        // Process room occupancy
        const roomDetails = occupied.dorms
          ? Object.entries(
            occupied.dorms.reduce((acc, room) => {
              acc[room.type] = (acc[room.type] || 0) + (room.occupied ? room.occupied.length : 0);
              return acc;
            }, {})
          ).map(([type, total]) => ({ type, total }))
          : [];

        setDashboardData({
          tenantStats: { total: tenantStats.length, monthlyGrowth: tenantGrowth },
          visitorStats: { total: visitorStats.length, monthlyTrends: visitorTrends },
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const DashboardCard = ({ title, icon: Icon, value, colorClass }) => (
    <div className={`flex justify-between items-center ${colorClass} text-white p-4 rounded-lg shadow-md`}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <Icon className="text-3xl opacity-70" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Total Tenants" icon={FaUsers} value={dashboardData.tenantStats.total || 0} colorClass="bg-blue-500" />
        <DashboardCard title="Total Visitors" icon={FaUserClock} value={dashboardData.visitorStats.total || 0} colorClass="bg-green-500" />
        <DashboardCard title="Total Rooms" icon={FaBuilding} value={dashboardData.occupied.total || 0} colorClass="bg-yellow-500" />
        <DashboardCard title="Total Payments" icon={FaMoneyBillWave} value={`₱${dashboardData.paymentStats.total || 0}`} colorClass="bg-red-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Growth Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tenant Growth</h2>
          <LineChart width={500} height={300} data={dashboardData.tenantStats.monthlyGrowth.map((value, index) => ({ month: index + 1, value }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </div>

        {/* Payment Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Distribution</h2>
          <PieChart width={500} height={300}>
            <Pie data={dashboardData.paymentStats.distribution} cx={250} cy={150} labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {dashboardData.paymentStats.distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Room Occupancy Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Room Occupancy</h2>
          <BarChart width={500} height={300} data={dashboardData.occupied.details}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Visitor Trends Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Visitor Trends</h2>
          <BarChart width={500} height={300} data={dashboardData.visitorStats.monthlyTrends.map((value, index) => ({ month: index + 1, value }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;