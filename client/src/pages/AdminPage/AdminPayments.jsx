import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  DollarSign, Upload, AlertCircle, CheckCircle, X, 
  Search, Filter, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/layouts/ui/alert';

const AdminPaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [landlordQR, setLandlordQR] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [paymentMethodDetails, setPaymentMethodDetails] = useState('');
  const [editingMethodId, setEditingMethodId] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchPaymentMethods();
  }, []);

  const fetchPayments = () => {
    const mockPayments = [
      { id: 1, tenantName: 'John Doe', amount: 1000, date: '2024-10-01', method: 'Bank Transfer', status: 'Confirmed' },
      { id: 2, tenantName: 'Jane Smith', amount: 1200, date: '2024-10-05', method: 'Online Payment', status: 'Pending' },
    ];
    setPayments(mockPayments);
    setLoading(false);
  };

  const fetchPaymentMethods = () => {
    const mockPaymentMethods = [
      { id: 1, name: 'Bank Transfer', details: 'Bank: XYZ, Account: 1234567890' },
      { id: 2, name: 'Online Payment', details: 'Visit www.example.com/pay' },
    ];
    setPaymentMethods(mockPaymentMethods);
  };

  const handleAddPaymentMethod = () => {
    if (editingMethodId) {
      setPaymentMethods(paymentMethods.map(method =>
        method.id === editingMethodId
          ? { ...method, name: paymentMethodName, details: paymentMethodDetails }
          : method
      ));
      setEditingMethodId(null);
      setAlertMessage('Payment method updated successfully!');
    } else {
      const newMethod = {
        id: paymentMethods.length + 1,
        name: paymentMethodName,
        details: paymentMethodDetails,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setAlertMessage('Payment method added successfully!');
    }
    setShowAlert(true);
    setPaymentMethodName('');
    setPaymentMethodDetails('');
  };

  const handleEditPaymentMethod = (id) => {
    const method = paymentMethods.find(method => method.id === id);
    setPaymentMethodName(method.name);
    setPaymentMethodDetails(method.details);
    setEditingMethodId(id);
  };

  const handleDeletePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    setAlertMessage('Payment method deleted successfully!');
    setShowAlert(true);
  };

  const handleGenerateQR = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setQrCode(JSON.stringify(paymentMethod));
  };

  const handleLandlordQRUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLandlordQR(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentConfirmation = (id, status) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, status } : payment
    ));
    setAlertMessage(`Payment ${status.toLowerCase()}`);
    setShowAlert(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPayments = [...payments].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredPayments = sortedPayments.filter(payment =>
    payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(payment => payment.status === 'Pending').length;

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-teal-600">Payment Management Dashboard</h1>
      
      {showAlert && (
        <Alert className="mb-4">
          <AlertTitle>Notification</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Payments</h2>
          <p className="text-2xl font-bold text-teal-600">₱{totalPayments.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Pending Confirmations</h2>
          <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Transactions</h2>
          <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{method.name}</h3>
              <p className="text-sm text-gray-600">{method.details}</p>
              <div className="mt-2">
                <button 
                  onClick={() => handleGenerateQR(method)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Generate QR
                </button>
                <button 
                  onClick={() => handleEditPaymentMethod(method.id)}
                  className="text-green-600 hover:text-green-800 mr-2"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <input 
            type="text" 
            placeholder="Payment Method Name" 
            value={paymentMethodName}
            onChange={(e) => setPaymentMethodName(e.target.value)}
            className="mr-2 p-2 border rounded"
          />
          <input 
            type="text" 
            placeholder="Payment Method Details" 
            value={paymentMethodDetails}
            onChange={(e) => setPaymentMethodDetails(e.target.value)}
            className="mr-2 p-2 border rounded"
          />
          <button 
            onClick={handleAddPaymentMethod} 
            className="bg-teal-600 text-white p-2 rounded"
          >
            {editingMethodId ? 'Update' : 'Add'} Payment Method
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Payments</h2>
        <div className="mb-4 flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded"
          />
          <div className="flex items-center">
            <span className="mr-2">Sort by:</span>
            <button onClick={() => handleSort('amount')} className="text-teal-600">Amount</button>
            <button onClick={() => handleSort('date')} className="text-teal-600 ml-2">Date</button>
          </div>
        </div>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Tenant Name</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id}>
                <td className="border px-4 py-2">{payment.tenantName}</td>
                <td className="border px-4 py-2">₱{payment.amount.toFixed(2)}</td>
                <td className="border px-4 py-2">{payment.date}</td>
                <td className="border px-4 py-2">{payment.method}</td>
                <td className="border px-4 py-2">{payment.status}</td>
                <td className="border px-4 py-2">
                  <button 
                    onClick={() => handlePaymentConfirmation(payment.id, 'Confirmed')}
                    className="text-green-600 hover:text-green-800 mr-2"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handlePaymentConfirmation(payment.id, 'Rejected')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPaymentMethod && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">QR Code for {selectedPaymentMethod.name}</h2>
          <QRCodeSVG value={qrCode} />
          <button onClick={() => setSelectedPaymentMethod(null)} className="mt-2 text-red-600 hover:underline">
            Close
          </button>
        </div>
      )}

      {landlordQR && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Landlord QR Code</h2>
          <img src={landlordQR} alt="Landlord QR Code" className="border rounded" />
        </div>
      )}

      <input type="file" onChange={handleLandlordQRUpload} className="mt-4" />
    </div>
  );
};

export default AdminPaymentDashboard;
