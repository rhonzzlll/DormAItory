import React, { useEffect, useState } from 'react';
import AdminContentTemplate from './AdminContentTemplate';
import DataTable from './DataTable';
import axios from 'axios';

const AdminUsers = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tenants');
        setTenants(response.data);
        setFilteredTenants(response.data);
      } catch (error) {
        setError(error.response ? error.response.data : error.message);
        console.error('Error fetching tenants:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = tenants.filter(tenant => 
      Object.values(tenant).some(value => 
        value && value.toString().toLowerCase().includes(searchValue)
      )
    );
    setFilteredTenants(filtered);
  };

  return (
    <AdminContentTemplate title="Admin Users">
      {/* Container for search input with flex layout */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-md w-64"
        />
      </div>

      {loading && <div className="loading">Loading tenants...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && filteredTenants.length === 0 && <div>No tenants found.</div>}
      {!loading && filteredTenants.length > 0 && <DataTable rows={filteredTenants} />}
    </AdminContentTemplate>
  );
};

export default AdminUsers;