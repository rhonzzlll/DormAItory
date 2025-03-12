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
import { Pencil, Trash2, UserPlus, Search, User } from 'lucide-react';
import axios from 'axios';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Label } from '../../components/layouts/ui/label';
import moment from 'moment';

const API_BASE_URL = 'http://dormaitory.online/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'approved', label: 'Approved', color: '#4CAF50' },
  { value: 'rejected', label: 'Rejected', color: '#F44336' }
];

const RELATIONSHIP_OPTIONS = [
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' }
];

const initialFormState = {
  visitDate: '',
  arrivalTime: '',
  departureTime: '',
  purpose: '',
  items: '',
  specialInstructions: '',
  agreeToPolicy: true,
  visitors: [{ fullName: '', phoneNumber: '', email: '', relationship: '' }],
  status: 'pending'
};

export default function AdminVisitor() {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(initialFormState);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [searchTerm, forms]);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/visitors`);
      const flattenedData = response.data.map(form => ({
        id: form._id,
        visitDate: moment(form.visitDate).format('MMMM D, YYYY h:mm A'),
        arrivalTime: moment(form.arrivalTime, 'HH:mm').format('h:mm A'),
        departureTime: moment(form.departureTime, 'HH:mm').format('h:mm A'),
        purpose: form.purpose,
        items: form.items,
        specialInstructions: form.specialInstructions,
        ...(form.visitors[0] || {}),
        status: form.status || 'pending'
      }));
      setForms(flattenedData);
      setFilteredForms(flattenedData);
    } catch (error) {
      showError('Failed to fetch visitors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterForms = () => {
    const filtered = forms.filter(form =>
      Object.values(form).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredForms(filtered);
  };

  const handleStatusChange = async (formId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/visitors/status/update`, { id: formId, status: newStatus });
      setForms(prevForms =>
        prevForms.map(form =>
          form.id === formId ? { ...form, status: newStatus } : form
        )
      );
      setFilteredForms(prevForms =>
        prevForms.map(form =>
          form.id === formId ? { ...form, status: newStatus } : form
        )
      );
      showSuccess('Status updated successfully');
    } catch (error) {
      showError('Error updating status: ' + error.message);
      fetchForms();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    if (!formData.visitors[0].fullName) return 'Full name is required';
    if (!formData.visitors[0].phoneNumber) return 'Phone number is required';
    if (!formData.visitors[0].email) return 'Email is required';
    if (!formData.visitDate) return 'Visit date is required';
    if (!formData.arrivalTime) return 'Arrival time is required';
    if (!formData.departureTime) return 'Departure time is required';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleVisitorChange = (index, e) => {
    const { name, value } = e.target;
    const newVisitors = [...selectedForm.visitors];
    newVisitors[index][name] = value;
    setSelectedForm(prevState => ({
      ...prevState,
      visitors: newVisitors
    }));
  };

  const handleRelationshipChange = (index, value) => {
    const newVisitors = [...selectedForm.visitors];
    newVisitors[index].relationship = value;
    setSelectedForm(prevState => ({
      ...prevState,
      visitors: newVisitors
    }));
  };

  const handleOpen = (form = initialFormState) => {
    setSelectedForm({
      ...initialFormState,
      ...form,
      visitors: form.visitors || initialFormState.visitors
    });
    setIsEdit(!!form.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedForm(initialFormState);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = {
        visitDate: selectedForm.visitDate,
        arrivalTime: selectedForm.arrivalTime,
        departureTime: selectedForm.departureTime,
        purpose: selectedForm.purpose || '',
        items: selectedForm.items || '',
        specialInstructions: selectedForm.specialInstructions || '',
        visitors: selectedForm.visitors,
        status: selectedForm.status || 'pending',
        agreeToPolicy: true
      };

      const validationError = validateForm(formData);
      if (validationError) {
        showError(validationError);
        return;
      }

      if (isEdit) {
        await axios.put(`${API_BASE_URL}/visitors/${selectedForm.id}`, formData);
        showSuccess('Visitor updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/visitors/register`, formData);
        showSuccess('Visitor added successfully');
      }

      fetchForms();
      handleClose();
    } catch (error) {
      showError(`Failed to ${isEdit ? 'update' : 'add'} visitor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/visitors/${id}`);
      fetchForms();
      showSuccess('Visitor deleted successfully');
    } catch (error) {
      showError('Error deleting visitor: ' + error.message);
    } finally {
      setLoading(false);
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
      field: 'visitDate',
      headerName: 'Visit Date',
      flex: 1,
      minWidth: 150,
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
          value={params.row.status || 'pending'}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
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
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpen(params.row)} sx={{ mr: 1 }}>
            <Pencil size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <Trash2 size={18} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Paper sx={{ height: 'calc(100vh - 100px)', width: '100%', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <User size={32} style={{ marginRight: '8px' }} />
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Admin Visitor Management</h1>
      </Box>
      <Box sx={{ mb: 3 }}>
        <p>Manage visitor entries efficiently.</p>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          startIcon={<UserPlus />}
          sx={{ height: 40 }}
        >
          Add Visitor
        </Button>
        <TextField
          placeholder="Search visitors..."
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
        rows={filteredForms}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        getRowId={(row) => row.id}
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
        <DialogTitle>{isEdit ? 'Edit Visitor' : 'Add Visitor'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            name="fullName"
            value={selectedForm?.visitors?.[0]?.fullName || ''}
            onChange={(e) => handleVisitorChange(0, e)}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Phone Number"
            name="phoneNumber"
            value={selectedForm?.visitors?.[0]?.phoneNumber || ''}
            onChange={(e) => handleVisitorChange(0, e)}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={selectedForm?.visitors?.[0]?.email || ''}
            onChange={(e) => handleVisitorChange(0, e)}
            fullWidth
            required
          />
          <Box sx={{ mt: 2 }}>
            <Label className="text-lg text-black">Relationship to Tenant *</Label>
            <Select
              value={selectedForm?.visitors?.[0]?.relationship || ''}
              onChange={(e) => handleRelationshipChange(0, e.target.value)}
              fullWidth
              required
            >
              {RELATIONSHIP_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <TextField
            margin="dense"
            label="Visit Date"
            name="visitDate"
            type="datetime-local"
            value={selectedForm?.visitDate ? moment(selectedForm.visitDate).format('YYYY-MM-DDTHH:mm') : ''}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Arrival Time"
            name="arrivalTime"
            type="time"
            value={selectedForm?.arrivalTime || ''}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Departure Time"
            name="departureTime"
            type="time"
            value={selectedForm?.departureTime || ''}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Purpose"
            name="purpose"
            value={selectedForm?.purpose || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Items"
            name="items"
            value={selectedForm?.items || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Special Instructions"
            name="specialInstructions"
            value={selectedForm?.specialInstructions || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <Box sx={{ mt: 2 }}>
            <Label className="text-lg text-black">Status *</Label>
            <Select
              value={selectedForm.status || 'pending'}
              onChange={(e) => setSelectedForm(prevState => ({ ...prevState, status: e.target.value }))}
              fullWidth
              required
            >
              {STATUS_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value} sx={{ color: option.color }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

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