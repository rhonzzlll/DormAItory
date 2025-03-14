import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  MapPin,
  Bed,
  Bath,
  Wifi,
  Wind,
  Share2,
  Info
} from 'lucide-react';
import Button from '../../components/layouts/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// Import Swiper modules
import 'swiper/css/autoplay';

const RoomView = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        setError('No room ID provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://dormaitory.online:8080/api/dorms/get/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setRoom(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError(`Failed to fetch room data: ${error.message}`);
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

  const handleContact = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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

  // Get the correct occupancy information
  const occupiedCount = room.occupied || 0;
  const isFullyOccupied = room.capacity <= occupiedCount;
  const availableSpace = Math.max(0, room.capacity - occupiedCount);

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden">
        <div className="relative">
          {room.images && room.images.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              className="h-96 w-full"
            >
              {room.images.map((image, index) => (
                <SwiperSlide key={index} className="w-full h-full">
                  <img
                    src={image}
                    alt={`Room ${room.roomNumber} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}

          <button
            onClick={handleShare}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
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
                Room {room.roomNumber} - ₱{room.price ? room.price.toLocaleString() : 'N/A'}/month
              </CardTitle>
              <p className="text-sm text-gray-500 flex items-center mt-2">
                <MapPin size={16} className="mr-1" />
                {room.address || '916 R. Hidalgo Street Quiapo'}
              </p>
            </div>
            <span className={`px-3 py-1 ${!isFullyOccupied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-sm font-medium`}>
              {!isFullyOccupied ? 'Available' : 'Fully Occupied'}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">{room.description || 'No description available for this room.'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <span className="flex items-center p-2 bg-gray-50 rounded-lg">
              <Bed size={16} className="mr-2" />
              <span className="text-sm text-gray-600">{room.capacity || 0} Beds</span>
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
              <span className="text-gray-700">
                Currently Occupied: {occupiedCount} People
              </span>
              <span className={`px-3 py-1 ${availableSpace > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-sm`}>
                {availableSpace} {availableSpace === 1 ? 'Bed' : 'Beds'} Available
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Pricing Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Rate:</span>
                <span className="font-medium">₱{room.price ? room.price.toLocaleString() : 'N/A'}/month</span>
              </div>
              {room.electricity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Electricity Fee:</span>
                  <span className="font-medium">₱{room.electricity.toLocaleString()}/month</span>
                </div>
              )}
              {room.water && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Water Fee:</span>
                  <span className="font-medium">₱{room.water.toLocaleString()}/month</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleContact}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            CONTACT LANDLORD
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="contact-dialog-title"
        aria-describedby="contact-dialog-description"
      >
        <DialogTitle id="contact-dialog-title">{"Contact Landlord"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="contact-dialog-description">
            For inquiries, feel free to email us at mlqudormitory@gmail.com or visit us in person. We'd be happy to assist you!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoomView;