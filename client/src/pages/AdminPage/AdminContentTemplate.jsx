import React from 'react';

const AdminContentTemplate = ({ title, children }) => {
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="bg-white shadow rounded-lg p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminContentTemplate;