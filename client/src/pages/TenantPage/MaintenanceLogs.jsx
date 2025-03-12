import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { Search, Settings } from 'lucide-react';
import axios from 'axios';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import moment from "moment";
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

const STATUS_COLORS = {
  pending: '#FFA500',  // Orange
  'in-progress': '#2196F3', // Blue
  completed: '#4CAF50', // Green
  rejected: '#F44336'  // Red
};

const API_BASE_URL = 'http://dormaitory.online:8080/api';

export default function MaintenanceLogs() {
  const [requests, setRequests] = useState([]);
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
      fetchRequests();
    }
  }, [tenantId]);

  const fetchTenantData = async () => {
    try {
      const response = await axios.get(`http://dormaitory.online:8080/api/tenants/get/${localStorage.getItem("_id")}`);
      const { tenant } = response.data.data;

      setTenantInfo({
        firstName: tenant[0].user[0].info[0].firstName,
        lastName: tenant[0].user[0].info[0].lastName,
        roomNo: tenant[0].user[0].roomNumber
      });
      setTenantId(tenant[0]["_id"]);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenancerequest/get`, {
        params: { tenantId }
      });
      const flattenedData = response.data.data.requests.map(request => ({
        id: request._id,
        tenantId: request.tenantId,
        firstName: request.tenant[0]?.info[0]?.firstName || '',
        lastName: request.tenant[0]?.info[0]?.lastName || '',
        roomNo: request.tenant[0]?.info[0]?.roomNo || '',
        concernType: request.concernType,
        specificationOfConcern: request.specificationOfConcern,
        status: request.status || 'pending',
        createdAt: moment(request.dateSubmitted).format("YYYY-MM-DD")
      }));
      setRequests(flattenedData);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.tenantId === tenantId && Object.values(request).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    {
      field: "fullName",
      headerName: 'Full Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const { firstName, lastName } = params.row;
        return `${firstName} ${lastName}`;
      }
    },
    {
      field: 'roomNo',
      headerName: 'Room No.',
      flex: 0.7,
      minWidth: 100
    },
    { field: 'concernType', headerName: 'Concern Type', flex: 1, minWidth: 130 },
    { field: 'specificationOfConcern', headerName: 'Specification', flex: 1.5, minWidth: 200 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
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
    },
    { field: 'createdAt', headerName: 'Date Submitted', flex: 1, minWidth: 130 }
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
            Maintenance Logs
          </Typography>
          <IconButton color="primary">
            <Settings size={24} />
          </IconButton>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: '8px' }}>
          This page provides a detailed overview of all maintenance requests submitted by tenants. You can search, filter, and view the status of each request.
        </Typography>
      </Box>
      <Box sx={{ padding: '16px' }}>
        <TextField
          placeholder="Search requests..."
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
        rows={filteredRequests}
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
        components={{
          Pagination: (props) => (
            <Pagination
              {...props}
              count={Math.ceil(filteredRequests.length / pageSize)}
              color="primary"
              renderItem={(item) => <PaginationItem {...item} />}
              sx={{ justifyContent: 'flex-start', padding: '16px' }}
            />
          )
        }}
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
}