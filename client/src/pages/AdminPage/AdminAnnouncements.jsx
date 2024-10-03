import React, { useState } from 'react';
import { PlusCircle, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import  Button  from '../../components/layouts/ui/Button';
import { Input } from '../../components/layouts/ui/Input';

const AdminManagement = () => {
  const [announcements, setAnnouncements] = useState([
    { id: 1, content: "Office closed today. Hours resume tomorrow, 8 AM - 4:30 PM." }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, date: '2024-10-07', title: 'Maintenance Day' }
  ]);
  const [newEvent, setNewEvent] = useState({ date: '', title: '' });

  const addAnnouncement = () => {
    if (newAnnouncement.trim() !== '') {
      setAnnouncements([...announcements, { id: Date.now(), content: newAnnouncement }]);
      setNewAnnouncement('');
    }
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  const addCalendarEvent = () => {
    if (newEvent.date && newEvent.title.trim() !== '') {
      setCalendarEvents([...calendarEvents, { id: Date.now(), ...newEvent }]);
      setNewEvent({ date: '', title: '' });
    }
  };

  const deleteCalendarEvent = (id) => {
    setCalendarEvents(calendarEvents.filter(event => event.id !== id));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Enter new announcement"
            />
            <Button onClick={addAnnouncement}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
          <ul className="mt-4 space-y-2">
            {announcements.map(announcement => (
              <li key={announcement.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <span>{announcement.content}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(announcement.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Input
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Event title"
            />
            <Button onClick={addCalendarEvent}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
          <ul className="mt-4 space-y-2">
            {calendarEvents.map(event => (
              <li key={event.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <span>{event.date}: {event.title}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteCalendarEvent(event.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;