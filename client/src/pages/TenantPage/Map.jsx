import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ locations }) => {
  // Center the map to MLQU Dormitory coordinates
  const center = [14.5963, 120.9860];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lng]}>
          <Popup>
            Room {location.roomNumber}
            <br />
            ₱{location.price}/month
          </Popup>
        </Marker>
      ))}
      {/* Add a marker for MLQU Dormitory */}
      <Marker position={center}>
        <Popup>MLQU Dormitory<br />Brgy 385 Arlegui St, Quiapo, Manila</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
