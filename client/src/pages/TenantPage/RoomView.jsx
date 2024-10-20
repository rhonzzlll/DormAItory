import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Wifi, Wind } from 'lucide-react';
import Button from '../../components/layouts/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';

const RoomView = () => {
  const { id } = useParams();
  console.log('Room ID from useParams:', id);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        console.error('No room ID provided');
        setError('No room ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching room data for ID: ${id}`);
        const res = await fetch(`/api/dorms/get/${id}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setRoom(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading room details...</div>;

  if (error) return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!room) return <div className="text-center py-10">Room not found</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden">
        <img
          src={room.images && room.images.length > 0 ? room.images[0] : ''}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-64 object-cover"
        />
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Room {room.roomNumber} - ₱{room.price}/month
          </CardTitle>
          <p className="text-sm text-gray-500 flex items-center">
            <MapPin size={16} className="mr-1" />
            {room.address || '916 R. Hidalgo Street Quiapo'}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">{room.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Bed size={16} className="mr-1" />
              {room.capacity} Beds
            </span>
            <span className="flex items-center">
              <Bath size={16} className="mr-1" />
              {room.amenities && room.amenities.bathroom ? 'Private' : 'Shared'} Bath
            </span>
            {room.amenities && room.amenities.wifi && (
              <span className="flex items-center">
                <Wifi size={16} className="mr-1" />
                WiFi
              </span>
            )}
            {room.amenities && room.amenities.aircon && (
              <span className="flex items-center">
                <Wind size={16} className="mr-1" />
                Air Conditioner
              </span>
            )}
          </div>
          <Button className="mt-4 w-full">CONTACT LANDLORD</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomView;