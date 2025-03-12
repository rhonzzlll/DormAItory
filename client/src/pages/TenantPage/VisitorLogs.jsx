import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { Search, User } from 'lucide-react';
import axios from 'axios';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import moment from 'moment';

const STATUS_COLORS = {
  pending: '#ED8936',  // Orange
  approved: '#48BB78', // Green
  rejected: '#F56565'  // Red
};

const API_BASE_URL = 'http://dormaitory.online:8080/api';

const VisitorLogs = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [tenantId, setTenantId] = useState('');
  const [tenantInfo, setTenantInfo] = useState({
    firstName: '',
    lastName: '',
    roomNo: ''
  });

  useEffect(() => {
    fetchTenantData();
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchVisitors();
    }
  }, [tenantId]);

  const fetchTenantData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/get/${localStorage.getItem("_id")}`);
      const { tenant } = response.data.data;

      setTenantInfo({
        firstName: tenant[0].user[0].info[0].firstName,
        lastName: tenant[0].user[0].info[0].lastName,
        roomNo: tenant[0].user[0].roomNumber
      });
      setTenantId(tenant[0]["_id"]);
      console.log('Tenant ID:', tenant[0]["_id"]);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  };

  const fetchVisitors = async () => {
    if (!tenantId) {
      console.error('Tenant ID is not set');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/visitors`, {
        params: { tenantId }
      });
      console.log('Full API Response:', response.data);

      if (Array.isArray(response.data)) {
        const flattenedData = response.data.map(form => ({
          id: form._id,
          fullName: form.visitors?.[0]?.fullName || '',
          phoneNumber: form.visitors?.[0]?.phoneNumber || '',
          email: form.visitors?.[0]?.email || '',
          relationship: form.visitors?.[0]?.relationship || '',
          visitDate: moment(form.visitDate).format('YYYY-MM-DD'),
          arrivalTime: form.arrivalTime || '',
          departureTime: form.departureTime || '',
          purpose: form.purpose || '',
          items: form.items || '',
          specialInstructions: form.specialInstructions || '',
          status: form.status || 'pending'
        }));

        setVisitors(flattenedData);
        console.log('Processed Visitors:', flattenedData);
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.arrivalTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.departureTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (visitor.items && visitor.items.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (visitor.specialInstructions && visitor.specialInstructions.toLowerCase().includes(searchTerm.toLowerCase())) ||
    visitor.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'relationship',
      headerName: 'Relation',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'visitDate',
      headerName: 'Visit Date',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'arrivalTime',
      headerName: 'Arrival',
      flex: 0.8,
      minWidth: 90,
    },
    {
      field: 'departureTime',
      headerName: 'Departure',
      flex: 0.8,
      minWidth: 90,
    },
    {
      field: 'purpose',
      headerName: 'Purpose',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <div
          style={{
            color: STATUS_COLORS[params.value],
            fontWeight: 500,
            textTransform: 'capitalize'
          }}
        >
          {params.value}
        </div>
      )
    }
  ];

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 1500,
        margin: 'auto',
        borderRadius: 3,
        height: 'calc(100vh - 200px)',
        width: '100%'
      }}
    >
      <Box sx={{ padding: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Visitor Logs
          </Typography>
          <IconButton color="primary">
            <User size={24} />
          </IconButton>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: '8px' }}>
          This page provides a detailed overview of all visitor logs for tenants. You can search, filter, and view the status of each visitor.
        </Typography>
      </Box>
      <Box sx={{ padding: '16px' }}>
        <TextField
          placeholder="Search visitors..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <DataGrid
        rows={filteredVisitors}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 20, 50]}
        getRowId={(row) => row.id}
        density="compact"
        autoHeight
        disableExtendRowFullWidth
        disableColumnMenu
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '8px',
            backgroundColor: '#f5f5f5',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }}
      />
    </Paper>
  );
};

export default VisitorLogs;