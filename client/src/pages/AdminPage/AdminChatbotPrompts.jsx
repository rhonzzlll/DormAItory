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
import { Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import axios from 'axios';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { CardTitle } from '../../components/layouts/ui/Card';
import AdminContentTemplate from '../../pages/AdminPage/AdminContentTemplate';

const AdminChatbotPrompts = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
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
    if (!requests) {
      return;
    }

    const filtered = requests.filter(request =>
      Object.values(request).some(query =>
        query && query.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRequests(filtered);
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://dormaitory.online:8080/api/chat/prompts');
      setRequests(response.data.data.prompts);
      setFilteredRequests(response.data.data.prompts);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
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
    setSelectedRequest(request);
    setIsEdit(!!request._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.post(`http://dormaitory.online:8080/api/chat/prompts/delete`, {
        "_id": id,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { _id, query, response } = selectedRequest;

      if (isEdit) {
        await axios.post(`http://dormaitory.online:8080/api/chat/prompts/upsert`, {
          _id,
          query,
          response
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      } else {
        await axios.post(`http://dormaitory.online:8080/api/chat/prompts/upsert`, {
          query,
          response
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      }

      fetchRequests();
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const columns = [
    { field: 'query', headerName: 'Query', flex: 1, minWidth: 200 },
    { field: 'response', headerName: 'Response', flex: 2, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
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
    <AdminContentTemplate sx={{ minHeight: '100vh' }}>
      <Paper sx={{ height: 950, width: '100%', p: 3 }}>
        <CardTitle>Admin Chatbot Prompts</CardTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', marginTop: "1rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
            startIcon={<UserPlus />}
            sx={{ height: 40 }}
          >
            Add Prompt
          </Button>
          <TextField
            placeholder="Search prompts..."
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
  pageSize={5}
  rowsPerPageOptions={[15, 30, 45]} // Update this line
  disableSelectionOnClick
  getRowId={(row) => row._id}
  sx={{
    border: 'none',
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #f0f0f0',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f5f5f5',
      borderBottom: 'none',
    }
  }}
/>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{isEdit ? 'Edit Prompt' : 'Add Prompt'}</DialogTitle>
          <DialogContent>
            {isEdit ? (
              <TextField
                margin="dense"
                name="_id"
                label="ID"
                type="text"
                fullWidth
                value={selectedRequest?._id || ''}
                readOnly
                disabled
              />
            ) : null}
            <TextField
              margin="dense"
              name="query"
              label="Query"
              type="text"
              fullWidth
              value={selectedRequest?.query || ''}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="response"
              label="Response"
              type="text"
              fullWidth
              value={selectedRequest?.response || ''}
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
    </AdminContentTemplate>
  );
}

export default AdminChatbotPrompts;