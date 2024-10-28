import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

const DataTable = ({ rows: initialRows, onUpdate }) => {
  const [rows, setRows] = useState(initialRows);
  const [editRow, setEditRow] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const columns = [
    {
      field: 'profileImage',
      headerName: 'Profile',
      width: 100,
      renderCell: (params) => (
        <div className="relative h-10 w-10">
          {params.value?.url ? (
            <img
              src={params.value.url}
              alt={`${params.row.firstName}'s profile`}
              className="rounded-full object-cover h-full w-full"
            />
          ) : (
            <div className="bg-gray-200 rounded-full h-full w-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {params.row.firstName?.[0]}
                {params.row.lastName?.[0]}
              </span>
            </div>
          )}
        </div>
      )
    },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'tenantId', headerName: 'Tenant ID', width: 150 },
    { field: 'roomNo', headerName: 'Room No.', width: 100 },
    { field: 'birthdate', headerName: 'Birthdate', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton onClick={() => handleEdit(params.row)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      )
    }
  ];

  const handleEdit = (row) => {
    setEditRow(row);
    setIsEditOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setIsDeleteOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedRow = {
      ...editRow,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      tenantId: formData.get('tenantId'),
      roomNo: formData.get('roomNo'),
      birthdate: formData.get('birthdate'),
      email: formData.get('email'),
    };

    const newRows = rows.map(row => 
      row._id === updatedRow._id ? updatedRow : row
    );

    setRows(newRows);
    onUpdate?.(newRows);
    setIsEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    const newRows = rows.filter(row => row._id !== selectedRow._id);
    setRows(newRows);
    onUpdate?.(newRows);
    setIsDeleteOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditRow(prev => ({
          ...prev,
          profileImage: { url: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper style={{ height: 600, width: '100%' }}>
      <Button variant="contained" color="primary" onClick={() => setIsEditOpen(true)} style={{ margin: 16 }}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Tenant
      </Button>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        pageSize={pageSize} 
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} 
        pagination 
        getRowId={(row) => row._id} // Specify custom id for each row
      />
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative h-24 w-24">
                  <img
                    src={editRow?.profileImage?.url}
                    alt="Profile"
                    className="rounded-full object-cover h-full w-full"
                  />
                  <TextField
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0 }}
                  />
                </div>
              </div>
              <TextField
                name="firstName"
                label="First Name"
                value={editRow?.firstName || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, firstName: e.target.value }))}
                fullWidth
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={editRow?.lastName || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, lastName: e.target.value }))}
                fullWidth
              />
              <TextField
                name="tenantId"
                label="Tenant ID"
                value={editRow?.tenantId || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, tenantId: e.target.value }))}
                fullWidth
              />
              <TextField
                name="roomNo"
                label="Room No."
                value={editRow?.roomNo || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, roomNo: e.target.value }))}
                fullWidth
              />
              <TextField
                name="birthdate"
                label="Birthdate"
                type="date"
                value={editRow?.birthdate || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, birthdate: e.target.value }))}
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={editRow?.email || ''}
                onChange={(e) => setEditRow(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
              />
            </div>
            <DialogActions>
              <Button onClick={() => setIsEditOpen(false)} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save changes
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogContent>
          <p>This action cannot be undone. This will permanently delete the tenant's data.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DataTable;