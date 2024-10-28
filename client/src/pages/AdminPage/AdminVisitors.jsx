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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import axios from 'axios';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' }
];

export default function AdminVisitor() {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/visitors');
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  };

  const filteredVisitors = visitors.filter(visitor => 
    Object.values(visitor).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleStatusChange = (visitorId, newStatus) => {
    setVisitors(prevVisitors =>
      prevVisitors.map(visitor =>
        visitor.id === visitorId ? { ...visitor, status: newStatus } : visitor
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedVisitor(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOpen = (visitor = {}) => {
    setSelectedVisitor(visitor);
    setIsEdit(!!visitor.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVisitor(null);
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/visitors/${selectedVisitor.id}`, selectedVisitor);
      } else {
        await axios.post('http://localhost:8080/api/visitors', selectedVisitor);
      }
      fetchVisitors();
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/visitors/${id}`);
      fetchVisitors();
    } catch (error) {
      console.error('Error deleting visitor:', error);
    }
  };

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
      field: 'tenantId', 
      headerName: 'Tenant ID', 
      flex: 0.8,
      minWidth: 90,
    },
    { 
      field: 'tenantName', 
      headerName: 'Tenant', 
      flex: 1,
      minWidth: 120,
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
      field: 'items', 
      headerName: 'Items', 
      flex: 1,
      minWidth: 100,
    },
    { 
      field: 'specialInstructions', 
      headerName: 'Instructions', 
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          style={{ 
            color: STATUS_OPTIONS.find(option => option.value === params.row.status)?.color,
            width: '100%'
          }}
          size="small"
        >
          {STATUS_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value} style={{ color: option.color }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <Pencil size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
            <Trash2 size={18} />
          </IconButton>
        </div>
      )
    }
  ];

  return (
    <Paper style={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', gap: '16px' }}>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          <UserPlus style={{ marginRight: '8px' }} /> Add Visitor
        </Button>
        <TextField
          placeholder="Search visitors..."
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
      <Dialog open={open} onClose={handleClose}>
        {/* Dialog content remains the same */}
      </Dialog>
    </Paper>
  );
}