import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Users, Search } from 'lucide-react';
import axios from 'axios';

export default function AdminUsers() {
  const [mergedData, setMergedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch all users and dorm data when component mounts
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all users data
        const usersResponse = await axios.get('http://localhost:8080/api/users');
        console.log('Users Response:', usersResponse.data); // Debugging log
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [usersResponse.data];

        // Fetch all dorms data
        const dormsResponse = await axios.get('http://localhost:8080/api/dorms');
        console.log('Dorms Response:', dormsResponse.data); // Debugging log
        const dorms = Array.isArray(dormsResponse.data) ? dormsResponse.data : [dormsResponse.data];

        // Merge user and dorm data
        const mergedUsers = users.map((user, index) => {
          const dormData = dorms.find(dorm => dorm.userId === user._id) || {};
          console.log('Dorm Data for User:', user._id, dormData); // Debugging log
          return {
            id: index + 1, // Incrementing ID starting from 1
            _id: user._id,
            fullName: `${user.firstName} ${user.lastName}`,
            roomNo: user.roomNo || 'N/A',
            gender: user.gender || 'N/A',
            email: user.email,
            phoneNumber: user.phoneNumber || 'N/A',
            // Add any other fields you want to display
          };
        });

        console.log('Merged Users:', mergedUsers); // Debugging log
        setMergedData(mergedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch user data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once when component mounts

  const filteredUsers = mergedData.filter(user =>
    Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 50 },
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'roomNo', headerName: 'Room No.', flex: 1, minWidth: 100 },
    { field: 'gender', headerName: 'Gender', flex: 1, minWidth: 100 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 150 },
    { field: 'phoneNumber', headerName: 'Phone Number', flex: 1, minWidth: 150 },
  ];

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <Paper style={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
        <Users size={32} />
        <div>
          <h1>List of Tenants</h1>
          <p>Below is a list of all tenants currently residing in the dorms.</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', gap: '16px' }}>
        <TextField
          placeholder="Search tenants..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search style={{ marginRight: '8px' }} />
          }}
        />
      </div>

      <DataGrid
        rows={filteredUsers}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 20, 50]}
        loading={loading}
        density="compact"
        autoHeight
        disableColumnMenu
        getRowId={(row) => row._id}
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
}