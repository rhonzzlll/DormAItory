import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Calendar, Edit3, Save, Speaker } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AdminContentTemplate from '../../pages/AdminPage/AdminContentTemplate';
import dayjs from 'dayjs';

const AdminManagementUI = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    date: null,
    title: '',
    description: '',
    type: 'event'
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/announcements');
      const allItems = response.data;
      setCalendarEvents(allItems.filter(item => item.type === 'event'));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addCalendarEvent = async () => {
    if (newEvent.date && newEvent.title.trim() !== '') {
      try {
        const eventToAdd = {
          ...newEvent,
          content: newEvent.title
        };
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
          console.error('Response data:', error.response.data);
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

  const updateCalendarEvent = async (id, updatedEvent) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/announcements/${id}`, updatedEvent);
      if (response && response.data) {
        setCalendarEvents(calendarEvents.map(event =>
          event._id === id ? response.data : event
        ));
        setEditingEvent(null);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
      if (error.response && error.response.data) {
        console.error('Response data:', error.response.data);
      }
    }
  };

  return (
    <AdminContentTemplate >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Speaker className="mr-2 w-6 h-6" />
            Admin Management Dashboard
          </h1>
        </div>
        <p className="text-gray-600">Welcome to the Admin Management Dashboard. Here you can manage calendar events.</p>

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
                  {editingEvent === event._id ? (
                    <div className="flex-grow">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Select date"
                          value={dayjs(event.date)}
                          onChange={(date) => setCalendarEvents(calendarEvents.map(e =>
                            e._id === event._id ? { ...e, date: date } : e
                          ))}
                          renderInput={(params) => <Input {...params} />}
                          className="mb-2"
                        />
                      </LocalizationProvider>
                      <Input
                        value={event.title}
                        onChange={(e) => setCalendarEvents(calendarEvents.map(ev =>
                          ev._id === event._id ? { ...ev, title: e.target.value } : ev
                        ))}
                        className="mb-2"
                      />
                      <Input
                        value={event.description}
                        onChange={(e) => setCalendarEvents(calendarEvents.map(ev =>
                          ev._id === event._id ? { ...ev, description: e.target.value } : ev
                        ))}
                        className="mb-2"
                      />
                      <Button onClick={() => updateCalendarEvent(event._id, event)} className="flex items-center">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-grow">
                      <h3 className="font-semibold">{dayjs(event.date).format('MMM D, YYYY')}: {event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEvent(event._id)}
                    >
                      <Edit3 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCalendarEvent(event._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminContentTemplate>
  );
};

export default AdminManagementUI;