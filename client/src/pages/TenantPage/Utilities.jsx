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
  Chip
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const TenantDuesTable = () => {
  const [tenantData, setTenantData] = useState([]);

  useEffect(() => {
    fetchTenantData();

    // Optionally, set up polling or WebSocket to listen for changes
    const interval = setInterval(fetchTenantData, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTenantData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants`);
      const { tenants } = response.data.data;

      const tenantDetails = tenants.map(t => ({
        fullName: `${t.user[0].info[0].firstName} ${t.user[0].info[0].lastName}`,
        roomNumber: t.user[0].roomNumber,
        rent: t.rent,
        electricity: t.electricity,
        water: t.water,
        totalMonthlyDues: t.totalMonthlyDues,
        startDate: t.startDate,
        endDate: t.endDate,
        status: t.status
      }));

      setTenantData(tenantDetails);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        maxWidth: 1000,
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
            Monthly Tenant Dues
          </Typography>
        }
        subheader="Detailed breakdown of tenant payments"
        sx={{
          backgroundColor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      />
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
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
              {tenantData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tenant data available
                  </TableCell>
                </TableRow>
              ) : (
                tenantData.map((tenant, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>{tenant.roomNumber}</TableCell>
                    <TableCell align="right">₱{tenant.rent?.toLocaleString()}</TableCell>
                    <TableCell align="right">₱{tenant.electricity?.toLocaleString()}</TableCell>
                    <TableCell align="right">₱{tenant.water?.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₱{tenant.totalMonthlyDues?.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{tenant.startDate}</TableCell>
                    <TableCell align="right">{tenant.endDate}</TableCell>
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
      </CardContent>
    </Card>
  );
};

export default TenantDuesTable;