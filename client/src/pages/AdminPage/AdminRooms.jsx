import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';
import AdminContentTemplate from './AdminContentTemplate';
import imageCompression from 'browser-image-compression';

export default function DormitoryManagement({ onRoomChange }) {
  const [formData, setFormData] = useState({
    id: '',
    roomNumber: '',
    capacity: 1,
    occupied: 0,
    price: 0,
    amenities: {
      aircon: false,
      wifi: false,
      bathroom: false,
    },
    description: '',
    images: [],
  });

  const [dorms, setDorms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load dorms from API on component mount
    axios.get('http://localhost:8080/api/dorms')
      .then(response => setDorms(response.data))
      .catch(error => setError(error.message));
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id.startsWith('amenities.')) {
      const amenityName = id.split('.')[1];
      setFormData({
        ...formData,
        amenities: {
          ...formData.amenities,
          [amenityName]: checked,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: type === 'number' ? Number(value) : value,
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
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
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages].slice(0, 6) // Limit to 6 images
      }));
      setUploading(false);
    } catch (err) {
      setError("Error processing images. Please try again.");
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.occupied > formData.capacity) {
      setError('Occupied beds cannot exceed capacity');
      return;
    }

    const submitData = async () => {
      try {
        const data = { ...formData };
        if (!isEditing) {
          delete data.id; // Remove `id` field when creating a new dorm
        }

        const response = isEditing
          ? await axios.put(`http://localhost:8080/api/dorms/update/${formData.id}`, data)
          : await axios.post('http://localhost:8080/api/dorms/create', data);

        if (isEditing) {
          setDorms(dorms.map(dorm => dorm.id === formData.id ? response.data : dorm));
        } else {
          setDorms([...dorms, response.data]);
        }
        resetForm();
        onRoomChange(); // Notify RoomList to refetch rooms
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };

    submitData();
  };

  const handleEdit = (dorm) => {
    setFormData(dorm);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/dorms/delete/${id}`)
      .then(() => {
        setDorms(dorms.filter(dorm => dorm.id !== id));
        onRoomChange(); // Notify RoomList to refetch rooms
      })
      .catch(error => setError(error.message));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      roomNumber: '',
      capacity: 1,
      occupied: 0,
      price: 0,
      amenities: {
        aircon: false,
        wifi: false,
        bathroom: false,
      },
      description: '',
      images: [],
    });
    setIsEditing(false);
  };

  return (
    <AdminContentTemplate>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dormitory Management System</h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roomNumber" className="block mb-1">Room Number</label>
              <input
                type="text"
                id="roomNumber"
                value={formData.roomNumber}
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
                value={formData.capacity}
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
                value={formData.occupied}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-1">Rent</label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
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
                  checked={formData.amenities.aircon}
                  onChange={handleChange}
                  className="mr-2"
                />
                Air Conditioning
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="amenities.wifi"
                  checked={formData.amenities.wifi}
                  onChange={handleChange}
                  className="mr-2"
                />
                WiFi
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="amenities.bathroom"
                  checked={formData.amenities.bathroom}
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
              value={formData.description}
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
                  disabled={uploading || formData.images.length >= 6}
                />
              </label>
              <span className="text-sm text-gray-500">
                {formData.images.length}/6 images
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {formData.images.map((image, index) => (
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

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Room' : 'Add Room'}
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Dormitory Rooms</h2>
          {dorms.map(dorm => (
            <div key={dorm.id} className="border p-4 rounded shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {dorm.images.length > 0 && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={dorm.images[0]}
                      alt={`Room ${dorm.roomNumber}`}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">Room {dorm.roomNumber}</h3>
                      <p className="text-gray-600">
                        Capacity: {dorm.occupied}/{dorm.capacity} - ₱{dorm.price} per bed
                      </p>
                      <p className="text-sm text-gray-500">{dorm.description}</p>
                      <div className="mt-2 flex gap-2">
                        {Object.entries(dorm.amenities).map(([key, value]) => (
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
                        onClick={() => handleEdit(dorm)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dorm.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminContentTemplate>
  );
}