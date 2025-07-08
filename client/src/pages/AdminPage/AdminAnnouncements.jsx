import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Calendar, Edit3, Save, Speaker, Bell, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/layouts/ui/Tabs";
import AdminContentTemplate from '../../pages/AdminPage/AdminContentTemplate';
import dayjs from 'dayjs';

const AdminManagementUI = () => {
  // State for announcements
  const [announcements, setAnnouncements] = useState([]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    date: dayjs(),
    priority: 'medium',
    active: true
  });

  // State for events
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: dayjs(),
    endDate: null,
    location: 'Open Area',
    category: 'social',
    capacity: null,
    isRecurring: false,
    recurringPattern: null,
    active: true
  });

  // Common state
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [activeTab, setActiveTab] = useState("announcements");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const announcementsResponse = await axios.get('http://localhost:8080/api/announcements');
      const eventsResponse = await axios.get('http://localhost:8080/api/events');
  
      console.log('Fetched announcements:', announcementsResponse.data);
      console.log('Fetched events:', eventsResponse.data);
  
      // Assuming the announcements are nested within an 'announcements' property
      setAnnouncements(Array.isArray(announcementsResponse.data.announcements) ? announcementsResponse.data.announcements : []);
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Handle announcements
  const addAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      setError('Title and content are required for announcements');
      return;
    }
  
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8080/api/announcements', {
        ...newAnnouncement,
        date: newAnnouncement.date.toISOString(),
        postedBy: "currentUserId"
      });
  
      await fetchData(); // Refetch data after adding
      setNewAnnouncement({
        title: '',
        content: '',
        date: dayjs(),
        priority: 'medium',
        active: true
      });
      setError(null);
    } catch (error) {
      console.error('Error adding announcement:', error);
      setError('Failed to add announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const updateAnnouncement = async (id, updatedAnnouncement) => {
    setIsLoading(true);
    try {
      const date = dayjs(updatedAnnouncement.date).isValid() ? dayjs(updatedAnnouncement.date).toISOString() : new Date().toISOString();
      await axios.put(`http://localhost:8080/api/announcements/${id}`, {
        ...updatedAnnouncement,
        date
      });
  
      await fetchData(); // Refetch data after updating
      setEditingItem(null);
      setEditingType(null);
      setError(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      setError('Failed to update announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteAnnouncement = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/announcements/${id}`);
      await fetchData(); // Refetch data after deleting
      setError(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle events
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.location) {
      setError('Title, description, and location are required for events');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/events', {
        ...newEvent,
        date: dayjs(newEvent.date).isValid() ? dayjs(newEvent.date).toISOString() : new Date().toISOString(),
        endDate: newEvent.endDate ? (dayjs(newEvent.endDate).isValid() ? dayjs(newEvent.endDate).toISOString() : null) : null,
        organizer: "management" // Always set to 'management'
      });

      setEvents([...events, response.data]);
      setNewEvent({
        title: '',
        description: '',
        date: dayjs(),
        endDate: null,
        location: 'Open Area',
        category: 'social',
        capacity: null,
        isRecurring: false,
        recurringPattern: null,
        active: true
      });
      setError(null);
    } catch (error) {
      console.error('Error adding event:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
      }
      setError('Failed to add event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const updateEvent = async (id, updatedEvent) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/api/events/${id}`, {
        ...updatedEvent,
        date: dayjs(updatedEvent.date).isValid() ? dayjs(updatedEvent.date).toISOString() : new Date().toISOString(),
        endDate: updatedEvent.endDate ? (dayjs(updatedEvent.endDate).isValid() ? dayjs(updatedEvent.endDate).toISOString() : null) : null
      });

      setEvents(events.map(event => (event._id === id ? response.data : event)));
      setEditingItem(null);
      setEditingType(null);
      setError(null);
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
      }
      setError('Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const deleteEvent = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
      }
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (item, type) => {
    setEditingItem(item._id);
    setEditingType(type);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  // Priority badge color based on level
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Category badge color based on type
  const getCategoryColor = (category) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'educational': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      case 'other': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminContentTemplate>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Speaker className="mr-2 w-6 h-6" />
         Manage Announcements
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="announcements" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" /> Announcements
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Events
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-3 w-6 h-6 text-blue-600" />
                  Manage Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Announcement Form */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-medium text-gray-700">Add New Announcement</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date"
                          value={newAnnouncement.date}
                          onChange={(date) => setNewAnnouncement({
                            ...newAnnouncement,
                            date
                          })}
                          renderInput={(params) => <Input {...params} />}
                        />
                      </LocalizationProvider>
                      <div>
                        <select
                          value={newAnnouncement.priority}
                          onChange={(e) => setNewAnnouncement({
                            ...newAnnouncement,
                            priority: e.target.value
                          })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value
                      })}
                      placeholder="Announcement Title"
                    />
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value
                      })}
                      placeholder="Announcement Content"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="announcement-active"
                        checked={newAnnouncement.active}
                        onChange={(e) => setNewAnnouncement({
                          ...newAnnouncement,
                          active: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="announcement-active">Active</label>
                    </div>
                    <Button
                      onClick={addAnnouncement}
                      className="flex items-center"
                      disabled={isLoading}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {isLoading ? 'Adding...' : 'Add Announcement'}
                    </Button>
                  </div>

                  {/* Announcements List */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">Current Announcements</h3>
                    {announcements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No announcements found. Add your first announcement above.
                      </div>
                    ) : (
                      announcements.map(announcement => (
                        <div
                          key={announcement._id}
                          className={`bg-white border p-4 rounded-lg shadow-sm ${!announcement.active ? 'opacity-60' : ''}`}
                        >
                          {editingItem === announcement._id && editingType === 'announcement' ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    label="Date"
                                    value={dayjs(announcement.date)}
                                    onChange={(date) => setAnnouncements(announcements.map(a =>
                                      a._id === announcement._id ? { ...a, date } : a
                                    ))}
                                    renderInput={(params) => <Input {...params} />}
                                  />
                                </LocalizationProvider>
                                <select
                                  value={announcement.priority}
                                  onChange={(e) => setAnnouncements(announcements.map(a =>
                                    a._id === announcement._id ? { ...a, priority: e.target.value } : a
                                  ))}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="low">Low Priority</option>
                                  <option value="medium">Medium Priority</option>
                                  <option value="high">High Priority</option>
                                </select>
                              </div>
                              <Input
                                value={announcement.title}
                                onChange={(e) => setAnnouncements(announcements.map(a =>
                                  a._id === announcement._id ? { ...a, title: e.target.value } : a
                                ))}
                                placeholder="Announcement Title"
                              />
                              <textarea
                                value={announcement.content}
                                onChange={(e) => setAnnouncements(announcements.map(a =>
                                  a._id === announcement._id ? { ...a, content: e.target.value } : a
                                ))}
                                placeholder="Announcement Content"
                                className="w-full p-2 border rounded-md min-h-[100px]"
                              />
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`active-${announcement._id}`}
                                  checked={announcement.active}
                                  onChange={(e) => setAnnouncements(announcements.map(a =>
                                    a._id === announcement._id ? { ...a, active: e.target.checked } : a
                                  ))}
                                  className="mr-2"
                                />
                                <label htmlFor={`active-${announcement._id}`}>Active</label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateAnnouncement(announcement._id, announcement)}
                                  className="flex items-center"
                                  disabled={isLoading}
                                >
                                  <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg flex items-center">
                                    {announcement.title}
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(announcement.priority)}`}>
                                      {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                    </span>
                                    {!announcement.active &&
                                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                        Inactive
                                      </span>
                                    }
                                  </h4>
                                  <p className="text-sm text-gray-500">{dayjs(announcement.date).format('MMM D, YYYY')}</p>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(announcement, 'announcement')}
                                  >
                                    <Edit3 className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAnnouncement(announcement._id)}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-700">{announcement.content}</p>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-3 w-6 h-6 text-green-600" />
                  Manage Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Event Form */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-medium text-gray-700">Add New Event</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={newEvent.date}
                          onChange={(date) => setNewEvent({
                            ...newEvent,
                            date
                          })}
                          renderInput={(params) => <Input {...params} />}
                        />
                      </LocalizationProvider>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="End Date (Optional)"
                          value={newEvent.endDate}
                          onChange={(date) => setNewEvent({
                            ...newEvent,
                            endDate: date
                          })}
                          renderInput={(params) => <Input {...params} />}
                        />
                      </LocalizationProvider>
                    </div>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({
                        ...newEvent,
                        title: e.target.value
                      })}
                      placeholder="Event Title"
                    />
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({
                        ...newEvent,
                        description: e.target.value
                      })}
                      placeholder="Event Description"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          location: e.target.value
                        })}
                        placeholder="Location"
                      />
                      <Input
                        type="number"
                        value={newEvent.capacity || ''}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          capacity: e.target.value ? parseInt(e.target.value) : null
                        })}
                        placeholder="Capacity (Optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          category: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="social">Social</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="educational">Educational</option>
                        <option value="administrative">Administrative</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="event-active"
                          checked={newEvent.active}
                          onChange={(e) => setNewEvent({
                            ...newEvent,
                            active: e.target.checked
                          })}
                          className="mr-2"
                        />
                        <label htmlFor="event-active">Active</label>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="event-recurring"
                        checked={newEvent.isRecurring}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          isRecurring: e.target.checked,
                          recurringPattern: e.target.checked ? newEvent.recurringPattern || 'weekly' : null
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="event-recurring">Recurring Event</label>
                    </div>
                    {newEvent.isRecurring && (
                      <select
                        value={newEvent.recurringPattern || ''}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          recurringPattern: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    )}
                    <Button
                      onClick={addEvent}
                      className="flex items-center"
                      disabled={isLoading}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {isLoading ? 'Adding...' : 'Add Event'}
                    </Button>
                  </div>

                  {/* Events List */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">Current Events</h3>
                    {events.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No events found. Add your first event above.
                      </div>
                    ) : (
                      events.map(event => (
                        <div
                          key={event._id}
                          className={`bg-white border p-4 rounded-lg shadow-sm ${!event.active ? 'opacity-60' : ''}`}
                        >
                          {editingItem === event._id && editingType === 'event' ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    label="Start Date"
                                    value={dayjs(event.date)}
                                    onChange={(date) => setEvents(events.map(e =>
                                      e._id === event._id ? { ...e, date } : e
                                    ))}
                                    renderInput={(params) => <Input {...params} />}
                                  />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    label="End Date (Optional)"
                                    value={event.endDate ? dayjs(event.endDate) : null}
                                    onChange={(date) => setEvents(events.map(e =>
                                      e._id === event._id ? { ...e, endDate: date } : e
                                    ))}
                                    renderInput={(params) => <Input {...params} />}
                                  />
                                </LocalizationProvider>
                              </div>
                              <Input
                                value={event.title}
                                onChange={(e) => setEvents(events.map(ev =>
                                  ev._id === event._id ? { ...ev, title: e.target.value } : ev
                                ))}
                                placeholder="Event Title"
                              />
                              <textarea
                                value={event.description}
                                onChange={(e) => setEvents(events.map(ev =>
                                  ev._id === event._id ? { ...ev, description: e.target.value } : ev
                                ))}
                                placeholder="Event Description"
                                className="w-full p-2 border rounded-md min-h-[100px]"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  value={event.location}
                                  onChange={(e) => setEvents(events.map(ev =>
                                    ev._id === event._id ? { ...ev, location: e.target.value } : ev
                                  ))}
                                  placeholder="Location"
                                />
                                <Input
                                  type="number"
                                  value={event.capacity || ''}
                                  onChange={(e) => setEvents(events.map(ev =>
                                    ev._id === event._id ? { ...ev, capacity: e.target.value ? parseInt(e.target.value) : null } : ev
                                  ))}
                                  placeholder="Capacity (Optional)"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <select
                                  value={event.category}
                                  onChange={(e) => setEvents(events.map(ev =>
                                    ev._id === event._id ? { ...ev, category: e.target.value } : ev
                                  ))}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="social">Social</option>
                                  <option value="maintenance">Maintenance</option>
                                  <option value="educational">Educational</option>
                                  <option value="administrative">Administrative</option>
                                  <option value="other">Other</option>
                                </select>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`active-${event._id}`}
                                    checked={event.active}
                                    onChange={(e) => setEvents(events.map(ev =>
                                      ev._id === event._id ? { ...ev, active: e.target.checked } : ev
                                    ))}
                                    className="mr-2"
                                  />
                                  <label htmlFor={`active-${event._id}`}>Active</label>
                                </div>
                              </div>
                              <div className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id={`recurring-${event._id}`}
                                  checked={event.isRecurring}
                                  onChange={(e) => setEvents(events.map(ev =>
                                    ev._id === event._id ? {
                                      ...ev,
                                      isRecurring: e.target.checked,
                                      recurringPattern: e.target.checked ? ev.recurringPattern || 'weekly' : null
                                    } : ev
                                  ))}
                                  className="mr-2"
                                />
                                <label htmlFor={`recurring-${event._id}`}>Recurring Event</label>
                              </div>
                              {event.isRecurring && (
                                <select
                                  value={event.recurringPattern || ''}
                                  onChange={(e) => setEvents(events.map(ev =>
                                    ev._id === event._id ? { ...ev, recurringPattern: e.target.value } : ev
                                  ))}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateEvent(event._id, event)}
                                  className="flex items-center"
                                  disabled={isLoading}
                                >
                                  <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={cancelEditing}

                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg flex items-center">
                                    {event.title}
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                    </span>
                                    {event.isRecurring &&
                                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                        {event.recurringPattern.charAt(0).toUpperCase() + event.recurringPattern.slice(1)}
                                      </span>
                                    }
                                    {!event.active &&
                                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                        Inactive
                                      </span>
                                    }
                                  </h4>
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {dayjs(event.date).format('MMM D, YYYY')}
                                    {event.endDate && ` - ${dayjs(event.endDate).format('MMM D, YYYY')}`}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {event.location}
                                  </div>
                                  {event.capacity && (
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <Users className="h-3 w-3 mr-1" />
                                      Capacity: {event.capacity}
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(event, 'event')}
                                  >
                                    <Edit3 className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteEvent(event._id)}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-700">{event.description}</p>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminContentTemplate>
  );
};

export default AdminManagementUI;