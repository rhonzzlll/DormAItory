import React, { useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

const DataTable = ({ rows, setUsers }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    roomNo: '',
    gender: '',
    email: '',
    phoneNumber: ''
  });

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://dormaitory.online/api/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://dormaitory.online/api/users/${selectedUser._id}`, formData);
      setUsers(prevUsers => prevUsers.map(user => (user._id === selectedUser._id ? formData : user)));
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post('http://dormaitory.online/api/users', formData);
      setUsers(prevUsers => [...prevUsers, response.data]);
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'roomNo', headerName: 'Room No', width: 150 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone Number', width: 150 },
    { field: 'actions', headerName: 'Actions', width: 150, renderCell: (params) => (
      <>
        <Button color="primary" onClick={() => handleEdit(params.row)}>Edit</Button>
        <Button color="secondary" onClick={() => { setSelectedUser(params.row); setIsDeleteOpen(true); }}>Delete</Button>
      </>
    )}
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Button color="primary" onClick={() => setIsCreateOpen(true)}>Add User</Button>
      <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} />

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => handleDelete(selectedUser._id)} color="primary">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="roomNo"
            label="Room No"
            type="text"
            fullWidth
            value={formData.roomNo}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="gender"
            label="Gender"
            type="text"
            fullWidth
            value={formData.gender}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="roomNo"
            label="Room No"
            type="text"
            fullWidth
            value={formData.roomNo}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="gender"
            label="Gender"
            type="text"
            fullWidth
            value={formData.gender}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleCreate} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataTable;