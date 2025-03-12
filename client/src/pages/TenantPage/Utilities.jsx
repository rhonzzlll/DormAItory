import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import axios from 'axios';

const API_BASE_URL = 'http://dormaitory.online:8080/api';

const TenantDetails = () => {
  const [tenantData, setTenantData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenantData();
  }, [startDate, endDate]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, tenantData]);

  const fetchTenantData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dorms`);
      console.log('API Response:', response.data); // Debugging log
      const { dorms } = response.data;

      const tenantDetails = dorms.flatMap(dorm =>
        dorm.tenants.map(t => ({
          tenantId: t.id._id,
          userId: t.id.userId,
          fullName: `${t.firstName} ${t.lastName}`,
          roomNumber: dorm.roomNumber,
          rent: t.rentAmount,
          electricity: dorm.electricity,
          water: dorm.water,
          totalMonthlyDues: t.rentAmount + dorm.electricity + dorm.water,
          startDate: t.startDate,
          endDate: t.endDate,
          status: t.paymentStatus
        }))
      );

      const filteredTenantDetails = tenantDetails.filter(tenant => {
        const tenantStartDate = new Date(tenant.startDate);
        const tenantEndDate = new Date(tenant.endDate);
        return (
          (!startDate || tenantStartDate >= startDate) &&
          (!endDate || tenantEndDate <= endDate)
        );
      });

      console.log('Processed Tenant Data:', filteredTenantDetails); // Debugging log
      setTenantData(filteredTenantDetails);
      setFilteredData(filteredTenantDetails);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  };

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = tenantData.filter(tenant =>
      tenant.fullName.toLowerCase().includes(lowercasedQuery) ||
      tenant.roomNumber.toLowerCase().includes(lowercasedQuery) ||
      tenant.status.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredData(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        maxWidth: 1500,
        margin: 'auto',
        borderRadius: 3
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h5"
            color="primary"
            fontWeight="bold"
          >
            Tenant Details
          </Typography>
        }
        subheader="Detailed breakdown of tenant details"
        sx={{
          backgroundColor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
        action={
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    {/* Replace with a different search icon if needed */}
                    <span role="img" aria-label="search">🔍</span>
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        }
      />
      <CardContent sx={{ p: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </LocalizationProvider>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tenant ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Room Number</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rent</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Electricity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Water</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Monthly Dues</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No tenant data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tenant, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>{tenant.tenantId}</TableCell>
                    <TableCell>{tenant.fullName}</TableCell>
                    <TableCell>{tenant.roomNumber}</TableCell>
                    <TableCell align="right">₱{tenant.rent?.toLocaleString()}</TableCell>
                    <TableCell align="right">₱{tenant.electricity?.toLocaleString()}</TableCell>
                    <TableCell align="right">₱{tenant.water?.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₱{tenant.totalMonthlyDues?.toLocaleString()}</TableCell>
                    <TableCell align="right">{new Date(tenant.startDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{new Date(tenant.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default TenantDetails;