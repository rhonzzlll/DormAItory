import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const columns = [
  { field: '_id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
  },
  {
    field: 'phoneNumber',
    headerName: 'Phone Number',
    width: 150,
  },
  {
    field: 'role',
    headerName: 'Role',
    width: 100,
  },
  {
    field: 'transactions',
    headerName: 'Transactions',
    width: 300,
    renderCell: (params) => (
      <ul>
        {(params.value || []).map((transaction, index) => (
          <li key={index}>
            {transaction.date}: {transaction.amount} - {transaction.description}
          </li>
        ))}
      </ul>
    ),
  },
];

export default function DataTable({ rows }) {
  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id} // Use _id as the unique identifier
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}