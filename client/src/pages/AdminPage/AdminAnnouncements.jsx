import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Calendar, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AdminManagementUI = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    content: '',
    description: '',
    type: 'announcement'
  });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    date: null,
    title: '',
    description: '',
    type: 'event'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/announcements');
      const allItems = response.data;

      setAnnouncements(allItems.filter(item => item.type === 'announcement'));
      setCalendarEvents(allItems.filter(item => item.type === 'event'));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addAnnouncement = async () => {
    if (newAnnouncement.content.trim() !== '') {
      try {
        console.log('Adding announcement:', newAnnouncement); // Log the announcement data
        const response = await axios.post('http://localhost:8080/api/announcements', newAnnouncement);
        if (response && response.data) {
          setAnnouncements([...announcements, response.data]);
          setNewAnnouncement({ content: '', description: '', type: 'announcement' });
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error adding announcement:', error);
        if (error.response && error.response.data) {
          console.error('Response data:', error.response.data); // Log the response data
        }
      }
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${id}`);
      setAnnouncements(announcements.filter(announcement => announcement._id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const addCalendarEvent = async () => {
    if (newEvent.date && newEvent.title.trim() !== '') {
      try {
        const eventToAdd = {
          ...newEvent,
          content: newEvent.title // Use the title as the content for the event
        };
        console.log('Adding calendar event:', eventToAdd); // Log the event data
        const response = await axios.post('http://localhost:8080/api/announcements', eventToAdd);
        if (response && response.data) {
          setCalendarEvents([...calendarEvents, response.data]);
          setNewEvent({ date: null, title: '', description: '', type: 'event' });
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error adding calendar event:', error);
        if (error.response && error.response.data) {
          console.error('Response data:', error.response.data); // Log the response data
        }
      }
    }
  };

  const deleteCalendarEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${id}`);
      setCalendarEvents(calendarEvents.filter(event => event._id !== id));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Management Dashboard
          </h1>
          <div className="flex space-x-2">
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center">
              <Megaphone className="mr-2 w-4 h-4" />
              Manage Announcements
            </div>
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center">
              <Calendar className="mr-2 w-4 h-4" />
              Manage Events
            </div>
          </div>
        </div>

        {/* Announcements Management */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-3 w-6 h-6 text-blue-600" />
              Manage Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  content: e.target.value
                })}
                placeholder="Announcement Title"
                className="flex-grow"
              />
              <Input
                value={newAnnouncement.description}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  description: e.target.value
                })}
                placeholder="Description"
                className="flex-grow"
              />
              <Button onClick={addAnnouncement} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {announcements.map(announcement => (
                <div
                  key={announcement._id}
                  className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{announcement.content}</h3>
                    <p className="text-sm text-gray-600">{announcement.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnnouncement(announcement._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Events Management */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-3 w-6 h-6 text-green-600" />
              Manage Calendar Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select date"
                  value={newEvent.date}
                  onChange={(date) => setNewEvent({
                    ...newEvent,
                    date
                  })}
                  renderInput={(params) => <Input {...params} />}
                  className="flex-grow"
                />
              </LocalizationProvider>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({
                  ...newEvent,
                  title: e.target.value
                })}
                placeholder="Event Title"
                className="flex-grow"
              />
              <Input
                value={newEvent.description}
                onChange={(e) => setNewEvent({
                  ...newEvent,
                  description: e.target.value
                })}
                placeholder="Event Description"
                className="flex-grow"
              />
              <Button onClick={addCalendarEvent} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {calendarEvents.map(event => (
                <div
                  key={event._id}
                  className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{event.date}: {event.title}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCalendarEvent(event._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminManagementUI;