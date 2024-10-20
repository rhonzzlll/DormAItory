import React, { useEffect, useState } from 'react';
import AdminContentTemplate from './AdminContentTemplate';
import DataTable from './DataTable'; // Ensure the path is correct
import axios from 'axios';

const AdminUsers = () => {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tenants'); // Adjust the endpoint as needed
        setTenants(response.data);
      } catch (error) {
        setError(error.response ? error.response.data : error.message);
        console.error('Error fetching tenants:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false); // Set loading to false after request completes
      }
    };

    fetchTenants();
  }, []);

  return (
    <AdminContentTemplate title="Admin Users">
      {loading && <div className="loading">Loading tenants...</div>} {/* Loading message */}
      {error && <div className="error">{error}</div>}
      {!loading && tenants.length === 0 && <div>No tenants found.</div>} {/* Fallback for empty data */}
      {!loading && tenants.length > 0 && <DataTable rows={tenants} />} {/* Render DataTable only if there are tenants */}
    </AdminContentTemplate>
  );
};

export default AdminUsers;
