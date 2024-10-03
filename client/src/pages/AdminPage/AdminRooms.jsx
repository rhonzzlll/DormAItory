import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Form } from '../../components/layouts/ui';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/layouts/ui/table';
import { Search, Plus, Edit, UserPlus, UserMinus } from 'lucide-react';

const AdminRoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [isEvictUserModalOpen, setIsEvictUserModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, statusFilter]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const applyFilters = () => {
    let filtered = rooms;
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    setFilteredRooms(filtered);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleAddRoom = () => {
    setCurrentRoom(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditRoom = (room) => {
    setCurrentRoom(room);
    setIsAddEditModalOpen(true);
  };

  const handleAssignUsers = (room) => {
    setCurrentRoom(room);
    setIsAssignUsersModalOpen(true);
  };

  const handleEvictUser = (room) => {
    setCurrentRoom(room);
    setIsEvictUserModalOpen(true);
  };

  const handleSaveRoom = async (roomData) => {
    try {
      const url = currentRoom ? `/api/rooms/${currentRoom.id}` : '/api/rooms';
      const method = currentRoom ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (response.ok) {
        fetchRooms();
        setIsAddEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleAssignUsersSave = async (assignedUsers) => {
    try {
      const response = await fetch(`/api/rooms/${currentRoom.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: assignedUsers }),
      });
      if (response.ok) {
        fetchRooms();
        setIsAssignUsersModalOpen(false);
      }
    } catch (error) {
      console.error('Error assigning users:', error);
    }
  };

  const handleEvictUserConfirm = async (userId) => {
    try {
      const response = await fetch(`/api/rooms/${currentRoom.id}/evict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchRooms();
        setIsEvictUserModalOpen(false);
      }
    } catch (error) {
      console.error('Error evicting user:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Room Management</h1>

      <div className="flex mb-4">
        <div className="relative w-64 mr-4">
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="w-40 mr-4"
        >
          <option value="all">All Status</option>
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
        </Select>

        <Button onClick={handleAddRoom} className="flex items-center">
          <Plus className="mr-2" /> Add Room
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Room Number</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Amenities</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRooms.map(room => (
            <tr key={room.id}>
              <td>{room.number}</td>
              <td>{room.type}</td>
              <td>{room.capacity}</td>
              <td>{room.status}</td>
              <td>{room.amenities.join(', ')}</td>
              <td>
                <Button onClick={() => handleEditRoom(room)} className="mr-2">
                  <Edit className="mr-1" /> Edit
                </Button>
                <Button onClick={() => handleAssignUsers(room)} className="mr-2">
                  <UserPlus className="mr-1" /> Assign
                </Button>
                {room.status === 'occupied' && (
                  <Button onClick={() => handleEvictUser(room)} variant="danger">
                    <UserMinus className="mr-1" /> Evict
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={currentRoom ? 'Edit Room' : 'Add Room'}
      >
        <RoomForm
          room={currentRoom}
          onSave={handleSaveRoom}
          onCancel={() => setIsAddEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAssignUsersModalOpen}
        onClose={() => setIsAssignUsersModalOpen(false)}
        title="Assign Users"
      >
        <AssignUsersForm
          room={currentRoom}
          onSave={handleAssignUsersSave}
          onCancel={() => setIsAssignUsersModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEvictUserModalOpen}
        onClose={() => setIsEvictUserModalOpen(false)}
        title="Evict User"
      >
        <EvictUserForm
          room={currentRoom}
          onConfirm={handleEvictUserConfirm}
          onCancel={() => setIsEvictUserModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Placeholder components for the modals
const RoomForm = ({ room, onSave, onCancel }) => {
  // Implement form for adding/editing room details
  return <div>Room Form Placeholder</div>;
};

const AssignUsersForm = ({ room, onSave, onCancel }) => {
  // Implement form for assigning users to a room
  return <div>Assign Users Form Placeholder</div>;
};

const EvictUserForm = ({ room, onConfirm, onCancel }) => {
  // Implement form for evicting a user from a room
  return <div>Evict User Form Placeholder</div>;
};

export default AdminRoomsList;