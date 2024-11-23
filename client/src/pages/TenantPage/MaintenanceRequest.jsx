import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MaintenanceRequestForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tenantId: '',
    roomNo: '',
    concernType: '',
    specificationOfConcern: ''
  });
  const [selectedConcern, setSelectedConcern] = useState('');

  useEffect(() => {
    // Fetch tenant data from the API
    const fetchTenantData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/tenants/get/${localStorage.getItem("_id")}`);
        const { tenant: tenant } = response.data.data;

        setFormData(prevState => ({
          ...prevState,
          firstName: tenant[0].user[0].info[0].firstName,
          lastName: tenant[0].user[0].info[0].lastName,
          tenantId: tenant[0]["_id"],
          roomNo: tenant[0].user[0].roomNumber
        }));
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value === "other" ? "" : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const req = await axios.post('http://localhost:8080/api/maintenancerequest/send', formData);
      if (req.status === 201) {
        setFormData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          tenantId: formData.tenantId,
          roomNo: formData.roomNumber,
          concernType: '',
          specificationOfConcern: ''
        });

        setSelectedConcern("");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white text-black p-6 rounded-t-lg">
        <h1 className="text-3xl font-semibold mb-2">Maintenance Request</h1>
        <p className="text-sm">
          Fill out the following fields and submit your request form. Please expect a minimum of 1-2 days for
          the processing of your request.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tenant Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            Fill out all the required fields. Make sure that your Room Number is specified and clear.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                value={formData.firstName + " " + formData.lastName}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tenant ID No.</label>
              <input
                type="text"
                name="tenantId"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                value={formData.tenantId}
                readOnly
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room No.</label>
              <input
                type="text"
                name="roomNo"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                value={formData.roomNo}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className={ selectedConcern === "other" ? "mb-0" : "mb-6" }>
          <h2 className="text-xl font-semibold mb-2">Type of Concern</h2>
          <p className="text-sm text-gray-600 mb-4">Fill out all the required fields.</p>
          
          <div className="space-y-2">
            {[
              { value: 'electrical', label: 'Electrical (Involves Sockets, Wirings, etc.)' },
              { value: 'aircon', label: 'Aircon Maintenance (Involves Issue/Damages, Cleaning Request, etc.)' },
              { value: 'room', label: 'Room Maintenance (Involves Mattress Request, Bunk Maintenance, etc.)' },
              { value: 'other', label: 'Others' }
            ].map(option => (
              <label key={option.value} className="block">
                <input
                  type="radio"
                  name="concernType"
                  value={option.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors" 
                  onClick={() => setSelectedConcern(option.value)}
                  style={{ backgroundColor: selectedConcern === option.value ? "#e5e7eb" : null }}
                  >
                  {option.label}
                </div>
              </label>
            ))}
          </div>
        </div>
          
        {selectedConcern === "other" && (
          <div className="mt-2 mb-6">
            <input
              type="text"
              name="concernType"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              placeholder="Please specify your concern"
              onChange={handleInputChange}
              value={formData.concernType}
            />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Specification of Concern</h2>
          <p className="text-sm text-gray-600 mb-4">Fill out the text field with your specified concern.</p>
          <textarea
            name="specificationOfConcern"
            rows={4}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            onChange={handleInputChange}
            value={formData.specificationOfConcern}
          />
        </div>

        <button
          type="submit"
          className="w-32 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition-colors"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
}