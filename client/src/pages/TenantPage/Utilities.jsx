import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Bell, CreditCard, History, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/layouts/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/layouts/ui/Card';

const TenantUtilities = () => {
  const [currentBills, setCurrentBills] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    // Simulating API calls
    const fetchData = () => {
      const mockCurrentBills = [
        { id: 1, type: 'Electricity', amount: 2500, billingCycle: 'Monthly', dueDate: '2024-11-01', status: 'Unpaid' },
        { id: 2, type: 'Water', amount: 800, billingCycle: 'Monthly', dueDate: '2024-11-05', status: 'Unpaid' },
      ];

      const mockBillingHistory = [
        { id: 3, type: 'Electricity', amount: 2300, billingCycle: 'Monthly', dueDate: '2024-10-01', status: 'Paid', paidDate: '2024-09-28' },
        { id: 4, type: 'Water', amount: 750, billingCycle: 'Monthly', dueDate: '2024-10-05', status: 'Paid', paidDate: '2024-09-30' },
      ];

      const mockUsageData = [
        { month: 'Jun', electricity: 2200, water: 700 },
        { month: 'Jul', electricity: 2400, water: 750 },
        { month: 'Aug', electricity: 2100, water: 720 },
        { month: 'Sep', electricity: 2300, water: 750 },
        { month: 'Oct', electricity: 2500, water: 800 },
      ];

      setCurrentBills(mockCurrentBills);
      setBillingHistory(mockBillingHistory);
      setUsageData(mockUsageData);
    };

    fetchData();
  }, []);

  const handlePayment = (billId) => {
    setCurrentBills(currentBills.map(bill => 
      bill.id === billId ? { ...bill, status: 'Processing' } : bill
    ));
    
    setTimeout(() => {
      setCurrentBills(currentBills.filter(bill => bill.id !== billId));
      setBillingHistory([
        { ...currentBills.find(b => b.id === billId), status: 'Paid', paidDate: new Date().toISOString().split('T')[0] },
        ...billingHistory
      ]);
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }, 1500);
  };

  const customTooltipFormatter = (value, name) => {
    return [`₱${value}`, name];
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
<div className="bg-white text-black p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-semibold mb-2">My Utilities Dashboard</h1>
        <p className="text-sm">View and manage your utility bills and payments </p>
      </div>

      {showPaymentSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>Your payment has been processed successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2" /> Current Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBills.map(bill => (
              <div key={bill.id} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{bill.type}</h3>
                    <p className="text-sm text-gray-600">Due: {bill.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₱{bill.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{bill.billingCycle}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => handlePayment(bill.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Pay Now
                  </button>
                  {new Date(bill.dueDate) <= new Date() && (
                    <span className="flex items-center text-red-600">
                      <AlertTriangle size={16} className="mr-1" /> Overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2" /> Usage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₱${value}`} />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Line type="monotone" dataKey="electricity" stroke="#3b82f6" name="Electricity (₱)" />
                <Line type="monotone" dataKey="water" stroke="#06b6d4" name="Water (₱)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2" /> Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount (₱)</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map(bill => (
                  <tr key={bill.id} className="border-t">
                    <td className="px-4 py-2">{bill.type}</td>
                    <td className="px-4 py-2">₱{bill.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">{bill.dueDate}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{bill.paidDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantUtilities;