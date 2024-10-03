import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/layouts/ui/alert';

const AdminUtilities = () => {
  const [utilities, setUtilities] = useState([]);
  const [formData, setFormData] = useState({
    utilityType: '',
    amount: '',
    billingCycle: '',
    dueDate: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Simulating fetching utilities from an API
    const fetchUtilities = () => {
      const mockUtilities = [
        { id: 1, type: 'Electricity', amount: 500, billingCycle: 'Monthly', dueDate: '2024-11-01' },
        { id: 2, type: 'Water', amount: 100, billingCycle: 'Monthly', dueDate: '2024-11-05' },
      ];
      setUtilities(mockUtilities);
    };
    fetchUtilities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddUtility = (e) => {
    e.preventDefault();
    const newUtility = { 
      id: utilities.length + 1, 
      ...formData 
    };
    setUtilities([...utilities, newUtility]);
    setFormData({ utilityType: '', amount: '', billingCycle: '', dueDate: '' });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDeleteUtility = (id) => {
    setUtilities(utilities.filter(utility => utility.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-teal-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-semibold mb-2">Admin Utilities Management</h1>
        <p className="text-sm">Manage utility information and billing details for the property.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <form onSubmit={handleAddUtility} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Utility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Utility Type</label>
              <input
                type="text"
                name="utilityType"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleInputChange}
                value={formData.utilityType}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₱)</label>
              <input
                type="number"
                name="amount"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleInputChange}
                value={formData.amount}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Billing Cycle</label>
              <select
                name="billingCycle"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleInputChange}
                value={formData.billingCycle}
                required
              >
                <option value="">Select Cycle</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleInputChange}
                value={formData.dueDate}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition-colors flex items-center"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Utility
          </button>
        </form>

        {showAlert && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>New utility has been added successfully.</AlertDescription>
          </Alert>
        )}

        <h2 className="text-xl font-semibold mb-4">Utilities List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Amount (₱)</th>
                <th className="py-2 px-4 border-b">Billing Cycle</th>
                <th className="py-2 px-4 border-b">Due Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilities.map((utility) => (
                <tr key={utility.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{utility.utilityType}</td>
                  <td className="py-2 px-4 border-b">₱{utility.amount}</td> {/* Changed from $ to ₱ */}
                  <td className="py-2 px-4 border-b">{utility.billingCycle}</td>
                  <td className="py-2 px-4 border-b">{utility.dueDate}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteUtility(utility.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUtilities;
