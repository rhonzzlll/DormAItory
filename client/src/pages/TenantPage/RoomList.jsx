import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Room.module.css';

// Static room data (no real backend, front-end only)
const rooms = [
  { id: 1, roomNumber: 'Room 101', occupant: '0/4', status: 'Vacant' },
  { id: 2, roomNumber: 'Room 102', occupant: '0/4', status: 'Vacant' },
  { id: 3, roomNumber: 'Room 103', occupant: '0/4', status: 'Vacant' },
  { id: 4, roomNumber: 'Room 104', occupant: '0/4', status: 'Vacant' },
  { id: 5, roomNumber: 'Room 105', occupant: '0/4', status: 'Vacant' },
  { id: 6, roomNumber: 'Room 106', occupant: '0/4', status: 'Vacant' },
];

// Main component to list all rooms
const RoomsList = () => {
  return (
    <div className={styles['room-list']}>
      {rooms.map((room) => (
        <div className={styles['room-card']} key={room.id}>
          <h2>{room.roomNumber}</h2>
          <p>Occupant: {room.occupant}</p>
          <p>Status: {room.status}</p>
          <div className={styles['room-actions']}>
            <Link to={`/room/${room.id}`} className={styles['view-button']}>View Details</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomsList;
