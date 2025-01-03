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
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import moment from "moment";

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'in-progress', label: 'In Progress', color: '#2196F3' },
  { value: 'completed', label: 'Completed', color: '#4CAF50' },
  { value: 'rejected', label: 'Rejected', color: '#F44336' }
];

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState({
    _id: "",
    userId: "",
    tenantId: "",
    firstName: "",
    lastName: "",
    concernType: "",
    specificationOfConcern: "",
    createdAt: ""
  });
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, requests]);

  const filterRequests = () => {
    const filtered = requests.filter(request => 
      Object.values(request).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    setFilteredRequests(filtered);
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/maintenancerequest/get');
      
      const { requests } = response.data.data;

      setRequests(requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const req = await axios.post("http://localhost:8080/api/maintenancerequest/update/status", {
        _id: requestId,
        status: newStatus
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (req.status === 200) {
        setRequests(prevRequests =>
          prevRequests.map(req =>
              req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRequest(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOpen = (request = {}) => {
    setIsEdit(!!request._id);

    if (request._id) {
      setSelectedRequest({
        _id: request._id,
        userId: request.tenant[0].info[0]._id,
        firstName: request.tenant[0].info[0].firstName,
        lastName: request.tenant[0].info[0].lastName,
        tenantId: request.tenantId,
        roomNo: request.tenant[0].info[0].roomNo,
        concernType: request.concernType,
        specificationOfConcern: request.specificationOfConcern,
        status: request.status,
        createdAt: moment(request.dateSubmitted).format("YYYY-MM-DD"),
      });
    } else {
      setSelectedRequest({
        userId: "",
        firstName: "",
        lastName: "",
        concernType: "",
        specificationOfConcern: "",
        createdAt: Date.now()
      });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest({
      _id: "",
      userId: "",
      firstName: "",
      lastName: "",
      tenantId: "",
      roomNo: "",
      concernType: "",
      specificationOfConcern: "",
      status: "",
      createdAt: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.post('http://localhost:8080/api/maintenancerequest/update', {
          _id: selectedRequest._id,
          firstName: selectedRequest.firstName,
          lastName: selectedRequest.lastName,
          concernType: selectedRequest.concernType,
          specificationOfConcern: selectedRequest.specificationOfConcern,
          status: selectedRequest.status,
          createdAt: selectedRequest.createdAt
        });
      } else {
        await axios.post('http://localhost:8080/api/maintenancerequest/create', {
          firstName: selectedRequest.firstName,
          lastName: selectedRequest.lastName,
          concernType: selectedRequest.concernType,
          specificationOfConcern: selectedRequest.specificationOfConcern,
          status: selectedRequest.status,
          createdAt: selectedRequest.createdAt
        });
      }

      fetchRequests();
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.get(`http://localhost:8080/api/maintenancerequest/delete/${id}`);
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const columns = [
    { field: "fullName",
      headerName: 'Full Name', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => {
        if (!params.row.tenant[0]) {
          return "";
        }

        const { firstName, lastName } = params.row.tenant[0].info[0];

        return `${firstName} ${lastName}`;
      }
    },
    { field: 'tenantId', headerName: 'Tenant ID', flex: 1, minWidth: 120 },
    { 
      field: 'roomNumber', 
      headerName: 'Room No.', 
      flex: 0.7, 
      minWidth: 100,
      renderCell: (params) => {
        if (!params.row.tenant[0]) {
          return "";
        }
        
        const { roomNo } = params.row.tenant[0].info[0];

        return `${roomNo ?? ""}`;
      }
    },
    { field: 'concernType', headerName: 'Concern Type', flex: 1, minWidth: 130 },
    { field: 'specificationOfConcern', headerName: 'Specification', flex: 1.5, minWidth: 200 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row._id, e.target.value)}
          sx={{
            color: STATUS_OPTIONS.find(option => option.value === params.row.status)?.color,
            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
            width: '100%'
          }}
        >
          {STATUS_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value} sx={{ color: option.color }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )
    },
    { field: 'createdAt', headerName: 'Date Submitted', flex: 1, minWidth: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpen(params.row)} size="small" sx={{ mr: 1 }}>
            <Pencil size={20} />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
            <Trash2 size={20} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Paper sx={{ height: 650, width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          startIcon={<UserPlus />}
          sx={{ height: 40 }}
        >
          Add Request
        </Button>
        <TextField
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
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
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        getRowId={(row) => row._id}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: 'none',
          }
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Request' : 'Add Request'}</DialogTitle>
        <DialogContent>
            <TextField
              margin="dense"
              name="userId"
              label="User ID"
              type="text"
              fullWidth
              value={selectedRequest?.userId}
              onChange={handleInputChange}
            />
          <div className="flex gap-x-2">
            <TextField
              margin="dense"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              value={selectedRequest?.firstName}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              value={selectedRequest?.lastName}
              onChange={handleInputChange}
            />
          </div>
          {isEdit && (
            <>
              <TextField
                margin="dense"
                name="tenantId"
                label="Tenant ID"
                type="text"
                fullWidth
                value={selectedRequest?.tenantId || ''}
                onChange={handleInputChange}
                readOnly
              />
              <TextField
                margin="dense"
                name="roomNo"
                label="Room No."
                type="text"
                fullWidth
                value={isEdit ? selectedRequest?.roomNo : ''}
                onChange={handleInputChange}
                readOnly
              />
            </>
          )}
          <TextField
            margin="dense"
            name="concernType"
            label="Concern Type"
            type="text"
            fullWidth
            value={selectedRequest?.concernType || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="specificationOfConcern"
            label="Specification of Concern"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={selectedRequest?.specificationOfConcern || ''}
            onChange={handleInputChange}
          />
          <Select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={selectedRequest?.status || 'pending'}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
          >
            {STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            name="createdAt"
            label="Date Submitted"
            type="date"
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            value={selectedRequest?.createdAt || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}