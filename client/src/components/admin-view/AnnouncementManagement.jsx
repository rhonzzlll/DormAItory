import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([
    { id: 1, content: "Office closed today. Hours resume tomorrow, 8 AM - 4:30 PM." }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const addAnnouncement = () => {
    if (newAnnouncement.trim() !== '') {
      setAnnouncements([...announcements, { id: Date.now(), content: newAnnouncement }]);
      setNewAnnouncement('');
    }
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Announcements</h2>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          rows="3"
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          placeholder="Enter new announcement"
        />
        <button
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          onClick={addAnnouncement}
        >
          <PlusCircle size={20} className="mr-2" />
          Add Announcement
        </button>
      </div>
      <ul className="space-y-4">
        {announcements.map(announcement => (
          <li key={announcement.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
            <span>{announcement.content}</span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => deleteAnnouncement(announcement.id)}
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnnouncementManagement;