import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Wifi, 
  Wind, 
  Share2, 
  Info,
  Send
} from 'lucide-react';
import Button from '../../components/layouts/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';
import { Textarea } from '../../components/layouts/ui/textarea';

const RoomView = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setError('No room ID provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/dorms/get/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setRoom(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError('Failed to fetch room data');
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your message submission logic here
    console.log('Message submitted:', message);
    setMessage('');
    setShowContact(false);
  };

  if (loading) return (
    <div className="container mx-auto">
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading room details...</p>
      </div>
    </div>
  );

  if (error) return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!room) return (
    <div className="container mx-auto">
      <div className="text-center py-10">
        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Room not found</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={room.images && room.images.length > 0 ? room.images[0] : ''}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-96 object-cover"
          />
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          {copied && (
            <div className="absolute top-16 right-4 bg-white px-3 py-1 rounded-md shadow-lg animate-fade-in-down">
              Link copied!
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Room {room.roomNumber} - ₱{room.price.toLocaleString()}/month
              </CardTitle>
              <p className="text-sm text-gray-500 flex items-center mt-2">
                <MapPin size={16} className="mr-1" />
                {room.address || '916 R. Hidalgo Street Quiapo'}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Available
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">{room.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <span className="flex items-center p-2 bg-gray-50 rounded-lg">
              <Bed size={16} className="mr-2" />
              <span className="text-sm text-gray-600">{room.capacity} Beds</span>
            </span>
            
            <span className="flex items-center p-2 bg-gray-50 rounded-lg">
              <Bath size={16} className="mr-2" />
              <span className="text-sm text-gray-600">
                {room.amenities && room.amenities.bathroom ? 'Private' : 'Shared'} Bath
              </span>
            </span>

            {room.amenities && room.amenities.wifi && (
              <span className="flex items-center p-2 bg-gray-50 rounded-lg">
                <Wifi size={16} className="mr-2" />
                <span className="text-sm text-gray-600">WiFi</span>
              </span>
            )}

            {room.amenities && room.amenities.aircon && (
              <span className="flex items-center p-2 bg-gray-50 rounded-lg">
                <Wind size={16} className="mr-2" />
                <span className="text-sm text-gray-600">Air Conditioner</span>
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Current Occupancy</h3>
            <div className="flex justify-between items-center">
              <span className="text-green-700">
                Currently Rented: {room.currentlyRented || 0} People
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {room.capacity - (room.currentlyRented || 0)} Available
              </span>
            </div>
          </div>

          {!showContact ? (
            <Button 
              onClick={() => setShowContact(true)}
              className="mt-4 w-full bg-[#008db9] hover:bg-[#007a9f] text-white transition-colors"
            >
              CONTACT LANDLORD
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-[#008db9]"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#008db9] hover:bg-[#007a9f] text-white transition-colors"
                >
                  <Send size={16} className="mr-2" />
                  Send Message
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowContact(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomView;