import React, { useState } from 'react';

export default function MaintenanceRequestForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    tenantId: '',
    floorNo: '',
    roomNo: '',
    roomLetter: '',
    concernType: '',
    otherConcern: '',
    specificationOfConcern: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
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
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tenant ID No.</label>
              <input
                type="text"
                name="tenantId"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                onChange={handleInputChange}
                value={formData.tenantId}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Floor No.</label>
              <input
                type="text"
                name="floorNo"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                onChange={handleInputChange}
                value={formData.floorNo}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room No.</label>
              <input
                type="text"
                name="roomNo"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                onChange={handleInputChange}
                value={formData.roomNo}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Letter (A or B)</label>
              <input
                type="text"
                name="roomLetter"
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                onChange={handleInputChange}
                value={formData.roomLetter}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Type of Concern</h2>
          <p className="text-sm text-gray-600 mb-4">Fill out all the required fields.</p>
          
          <div className="space-y-2">
            {[
              { value: 'electrical', label: 'Electrical (Involves Sockets, Wirings, etc.)' },
              { value: 'aircon', label: 'Aircon Maintenance (Involves Issue/Damages, Cleaning Request, etc.)' },
              { value: 'room', label: 'Room Maintenance (Involves Mattress Request, Bunk Maintenance, etc.)' },
              { value: 'other', label: 'Others (Please specify)' }
            ].map(option => (
              <label key={option.value} className="block">
                <input
                  type="radio"
                  name="concernType"
                  value={option.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                  {option.label}
                </div>
              </label>
            ))}
          </div>
        </div>

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