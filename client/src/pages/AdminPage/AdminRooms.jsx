import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Upload, X, Bed } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';
import imageCompression from 'browser-image-compression';
import AdminContentTemplate from '../../pages/AdminPage/AdminContentTemplate';

// Helper function to format currency in PHP
const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function AdminRooms() {
  const [roomData, setRoomData] = useState({
    _id: undefined,
    roomNumber: "",
    capacity: 0,
    occupied: 0,
    electricity: 0.0,
    water: 0.0,
    price: 0,
    amenities: {
      aircon: false,
      wifi: false,
      bathroom: false
    },
    description: "",
    images: []
  });

  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;

  const API_BASE_URL = 'http://localhost:8080/api/dorms';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      if (response.data && Array.isArray(response.data.dorms)) {
        setRooms(response.data.dorms);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(`Failed to fetch rooms: ${error.message}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id.startsWith('amenities.')) {
      const amenityName = id.split('.')[1];
      setRoomData(prev => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [amenityName]: checked,
        },
      }));
    } else {
      setRoomData(prev => ({
        ...prev,
        [id]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    const compressImage = async (file) => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        return await convertToBase64(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
      }
    };

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const compressedImages = await Promise.all(files.map(compressImage));
      setRoomData(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages].slice(0, 6)
      }));
    } catch (err) {
      setError("Error processing images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setRoomData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!roomData.roomNumber.trim()) {
      setError('Room number is required');
      return false;
    }
    if (roomData.capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }
    if (roomData.occupied > roomData.capacity) {
      setError('Occupied beds cannot exceed capacity');
      return false;
    }
    if (roomData.price < 0 || roomData.electricity < 0 || roomData.water < 0) {
      setError('Rates cannot be negative');
      return false;
    }
    return true;
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingRoom) {
        await axios.post(`${API_BASE_URL}/update`, roomData, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        setEditingRoom(true);
      } else {
        await axios.post(`${API_BASE_URL}/create`, roomData, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      }

      setError('');
      fetchRooms();
      resetForm();
      window.location.reload(); // Refresh the page after adding a room
    } catch (error) {
      setError(editingRoom ? 'Failed to update room' : 'Failed to add new room');
    }
  };

  const handleEdit = (room) => {
    setRoomData({
      _id: room._id,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      occupied: room.occupied,
      electricity: room.electricity,
      water: room.water,
      price: room.price,
      amenities: room.amenities || { aircon: false, wifi: false, bathroom: false },
      description: room.description || "",
      images: room.images || []
    });
    setEditingRoom(true);
  };

  const handleRoomDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await axios.get(`${API_BASE_URL}/delete/${id}`);
      fetchRooms();
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setRoomData({
      _id: undefined,
      roomNumber: "",
      capacity: 0,
      occupied: 0,
      electricity: 0.0,
      water: 0.0,
      price: 0,
      amenities: {
        aircon: false,
        wifi: false,
        bathroom: false
      },
      description: "",
      images: []
    });
    setEditingRoom(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(rooms.length / roomsPerPage);
  const displayedRooms = rooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <AdminContentTemplate title="">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Bed className="w-8 h-8 mr-2" />
          Room Management
        </h1>
        <p className="mb-6">Manage the rooms in your dormitory, including adding, editing, and deleting rooms.</p>

        <form onSubmit={handleRoomSubmit} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roomNumber" className="block mb-1">Room Number</label>
              <input
                type="text"
                id="roomNumber"
                value={roomData.roomNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block mb-1">Capacity</label>
              <input
                type="number"
                id="capacity"
                value={roomData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="occupied" className="block mb-1">Occupied Beds</label>
              <input
                type="number"
                id="occupied"
                value={roomData.occupied}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-1">Rent Price (PHP)</label>
              <input
                type="number"
                id="price"
                value={roomData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="electricity" className="block mb-1">Electricity Rate (PHP/kWh)</label>
              <input
                type="number"
                id="electricity"
                value={roomData.electricity}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="water" className="block mb-1">Water Rate (PHP/cubic meter)</label>
              <input
                type="number"
                id="water"
                value={roomData.water}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Amenities</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="amenities.aircon"
                  checked={roomData.amenities.aircon}
                  onChange={handleChange}
                  className="mr-2"
                />
                Air Conditioning
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="amenities.wifi"
                  checked={roomData.amenities.wifi}
                  onChange={handleChange}
                  className="mr-2"
                />
                WiFi
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="amenities.bathroom"
                  checked={roomData.amenities.bathroom}
                  onChange={handleChange}
                  className="mr-2"
                />
                Bathroom
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1">Description</label>
            <textarea
              id="description"
              value={roomData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block mb-1">Room Images</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-500 rounded cursor-pointer hover:bg-blue-100">
                <Upload className="w-5 h-5 mr-2" />
                Choose Images
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || roomData.images.length >= 6}
                />
              </label>
              <span className="text-sm text-gray-500">
                {roomData.images.length}/6 images
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {roomData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Room ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              {editingRoom ? 'Update Room' : 'Add Room'}
            </button>
            {editingRoom && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Room Listings</h2>
          {displayedRooms.map((room) => (
            <div key={room._id} className="border p-4 rounded shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {room.images?.length > 0 && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={room.images[0]}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                      <p className="text-gray-600">
                        Capacity: {room.occupied}/{room.capacity} - {formatPHP(room.price)} per bed
                      </p>
                      <p className="text-sm text-gray-500">
                        Electricity: {formatPHP(room.electricity)}/kWh | Water: {formatPHP(room.water)}/cubic meter
                      </p>
                      <p className="text-sm text-gray-500">{room.description}</p>
                      <div className="mt-2 flex gap-2">
                        {Object.entries(room.amenities || {}).map(([key, value]) => (
                          value && (
                            <span key={key} className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="px-3 py-1 text-blue-500 hover:text-blue-700 border border-blue-500 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRoomDelete(room._id)}
                        className="px-3 py-1 text-red-500 hover:text-red-700 border border-red-500 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rooms available. Add a room to get started.
            </div>
          )}

          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 mx-1 border rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminContentTemplate>
  );
}