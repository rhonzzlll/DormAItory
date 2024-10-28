import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Bed, Bath, Wifi, Wind } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';

const RoomCard = ({ room }) => (
  <Link to={`/tenant/room-view/${room._id}`} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
    <img
       src={room.images[0] || '/placeholder-room.jpg'}
       alt={`Room ${room.roomNumber}`}
       className="w-full h-48 object-cover"
    />
    <div className="p-3">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Room {room.roomNumber}</h2>
      <p className="text-xs text-gray-600 mb-1 flex items-center">
        <MapPin size={12} className="mr-1" />
        916 R. Hidalgo Street Quiapo
      </p>
      <p className="text-xs text-gray-700 mb-2 line-clamp-2">{room.description}</p>
      <p className="text-lg font-bold text-blue-600 mb-2">₱{room.price}/month</p>
      <div className="flex items-center text-gray-600 text-xs">
        <Bed size={14} className="mr-1" />
        <span className="mr-2">{room.capacity} Beds</span>
        <Bath size={14} className="mr-1" />
        <span className="mr-2">{room.amenities.bathroom ? 'Private' : 'Shared'} Bath</span>
        {room.amenities.wifi && (
          <span className="flex items-center mr-2">
            <Wifi size={14} className="mr-1" />
            WiFi
          </span>
        )}
        {room.amenities.aircon && (
          <span className="flex items-center mr-2">
            <Wind size={14} className="mr-1" />
            Air Conditioner
          </span>
        )}
      </div>
    </div>
  </Link>
);

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/dorms');
        setRooms(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <div className="text-center py-10">Loading rooms...</div>;

  if (error) return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, index) => (
          <RoomCard key={`${room._id}-${index}`} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomList;