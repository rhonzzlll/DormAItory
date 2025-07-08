import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  List,
  Users,
  Zap,
  Mail,
  Settings,
  CreditCard,
  Calendar,
  Clock,
  Megaphone,
  Home,
  Star
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import AOS from 'aos';

// Import images
import dormbotPic from '../../Images/icons/dormbot pic.png';

const VisitorsChart = () => {
  const [visitorsData, setVisitorsData] = useState([]);
  useEffect(() => {
    const fetchVisitorsData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/visitors/');
        setVisitorsData(response.data);
      } catch (error) {
        console.error('Error fetching visitors data:', error);
      }
    };
    fetchVisitorsData();
  }, []);
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Users className="mr-3 w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Monthly Visitors
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={visitorsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: '#f9f9f9' }}
            itemStyle={{ color: '#333' }}
          />
          <Bar
            dataKey="count"
            fill="#3B82F6"
            name="Visitors"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MaintenanceRequestsChart = () => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/maintenancerequest/get');
        setMaintenanceData(response.data);
      } catch (error) {
        console.error('Error fetching maintenance data:', error);
      }
    };
    fetchMaintenanceData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Settings className="mr-3 w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Monthly Maintenance Requests
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={maintenanceData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: '#f9f9f9' }}
            itemStyle={{ color: '#333' }}
          />
          <Bar
            dataKey="count"
            fill="#10B981"
            name="Maintenance Requests"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnnouncementsList = ({ announcements }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Megaphone className="mr-3 w-6 h-6 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Latest Announcements
        </h2>
      </div>
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div key={index} className="border-b pb-3">
              <h3 className="font-semibold text-gray-700">{announcement.title}</h3>
              <p className="text-gray-600 text-sm">{new Date(announcement.date).toLocaleDateString()}</p>
              <p className="mt-1">{announcement.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No announcements available.</p>
        )}
      </div>
    </div>
  );
};

const EventsList = ({ events, selectedDate }) => {
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedDate.month() &&
      eventDate.getFullYear() === selectedDate.year();
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Calendar className="mr-3 w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Events for {selectedDate.format('MMMM YYYY')}
        </h2>
      </div>
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <div key={index} className="border-b pb-3">
              <h3 className="font-semibold text-gray-700">{event.title}</h3>
              <p className="text-gray-600 text-sm">{new Date(event.date).toLocaleDateString()}</p>
              <p className="mt-1">{event.description}</p>
              <p className="text-gray-600 text-sm">Location: {event.location}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No events scheduled for this month.</p>
        )}
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showAllEvents, setShowAllEvents] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchAnnouncementsAndEvents();
  }, [selectedDate]);

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);
  const fetchAnnouncementsAndEvents = async () => {
    try {
      // Fetch announcements
      const announcementsResponse = await axios.get('http://localhost:8080/api/announcements/');
      console.log('Announcements response:', announcementsResponse.data);
      setAnnouncements(announcementsResponse.data.announcements || announcementsResponse.data || []);

      // Fetch events
      const eventsResponse = await axios.get('http://localhost:8080/api/events/');
      console.log('Events response:', eventsResponse.data);
      setEvents(eventsResponse.data.events || eventsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set some sample data for demonstration if API fails
    }
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const getEventForDate = (date) => {
    return events.find(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date && eventDate.getMonth() === selectedDate.month() && eventDate.getFullYear() === selectedDate.year();
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const toggleViewAllEvents = () => {
    setShowAllEvents(!showAllEvents);
  };

  // Format current date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section accent-background">
        <div className="container position-relative" data-aos="fade-up" data-aos-delay={100}>
          <div className="row gy-5 justify-content-between">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <h2><span>Welcome to </span><span className="accent">DormAItory!</span></h2>
              <p>{formattedDate}</p>
              <div className="d-flex">
                <a href="#about" className="btn-get-started">Get Started</a>
              </div>
            </div>
            <div className="col-lg-5 order-1 order-lg-2">
              <img src="/assets/img/dormBldg.png" className="img-fluid" alt="Dorm Building" />
            </div>
          </div>
        </div>

        <div className="icon-boxes position-relative" data-aos="fade-up" data-aos-delay={200}>
          <div className="container position-relative">
            <div className="row gy-4 mt-5">
              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={100}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/room-list')}>
                  <div className="icon"><i className="bi bi-card-list"></i></div>
                  <h4 className="title"><a href="#" className="stretched-link">Room List</a></h4>
                  <p>View and manage dormitory rooms</p>
                </div>
              </div>{/*End Icon Box */}

              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/visitor-management')}>
                  <div className="icon"><i className="bi bi-people"></i></div>
                  <h4 className="title"><a href="#" className="stretched-link">Visitor Management</a></h4>
                  <p>Register and track visitors</p>
                </div>
              </div>{/*End Icon Box */}

              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={300}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/utilities')}>
                  <div className="icon"><i className="bi bi-lightning-charge"></i></div>
                  <h4 className="title"><a href="#" className="stretched-link">Rent & Utilities</a></h4>
                  <p>Monitor and manage utility usage</p>
                </div>
              </div>{/*End Icon Box */}

              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/contact-admin')}>
                  <div className="icon"><i className="bi bi-envelope"></i></div>
                  <h4 className="title"><span className="stretched-link" role="button" tabIndex={0} style={{ cursor: 'pointer' }}>Contact Admin</span></h4>
                  <p>Get in touch with dormitory administration</p>
                </div>
              </div>{/*End Icon Box */}

              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={500}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/maintenance-request')}>
                  <div className="icon"><i className="bi bi-nut"></i></div>
                  <h4 className="title"><a href="#" className="stretched-link">Maintenance Request</a></h4>
                  <p>Submit a maintenance or repair request</p>
                </div>
              </div>{/*End Icon Box */}

              <div className="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay={600}>
                <div className="icon-box" onClick={() => handleCardClick('/tenant/payment-options')}>
                  <div className="icon"><i className="bi bi-credit-card"></i></div>
                  <h4 className="title"><a href="#" className="stretched-link">Payment Options</a></h4>
                  <p>View and manage your payment methods</p>
                </div>
              </div>{/*End Icon Box */}
            </div>
          </div>
        </div>
      </section>{/* End Hero Section */}

      {/* Call To Action Section */}
      <section id="call-to-action" className="call-to-action section dark-background">
        <div className="container">
          <img src="/assets/img/bgDB.png" alt="DormBot Background" />
          <div className="content row justify-content-center" data-aos="zoom-in" data-aos-delay={20}>
            <div className="col-xl-10">
              <div className="text-center">
                <h3>Interact with DormBot</h3>
                <p>Need help with anything? Ask DormBot right away!</p>

                <Link to="/tenant/chatbot" className="cta-btn" style={{ color: 'white' }}>Interact with DormBot</Link>
              </div>
            </div>
          </div>
        </div>
      </section>{/* End Call To Action Section */}

      {/* Calendar and Announcements Section */}
      <section id="cal-and-announcements" className="services section">
        <div className="container">
          <div className="section-header">
            <h2>Calendar and Announcements</h2>
            <p>Stay updated with the latest events and announcements</p>
          </div>

          <div className="row gy-4">
            {/* Calendar Component */}
            <div className="col-lg-6 col-md-6" data-aos="fade-up" data-aos-delay={100}>
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="bi bi-calendar4-week"></i>
                </div>
                <h3>Upcoming Events</h3>
                <div className="calendar-container">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{months[selectedDate.month()]} {selectedDate.year()}</h3>
                    {/* Simplified Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mt-2 text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="font-bold text-gray-600">{day}</div>
                      ))}
                      {Array.from({ length: new Date(selectedDate.year(), selectedDate.month() + 1, 0).getDate() }, (_, i) => {
                        const event = getEventForDate(i + 1);
                        return (
                          <div
                            key={i}
                            className={`p-1 rounded ${event ? 'bg-green-200 text-green-800' : 'text-gray-600'}`}
                            onMouseEnter={() => setHoveredDate(i + 1)}
                            onMouseLeave={() => setHoveredDate(null)}
                          >
                            {i + 1}
                            {hoveredDate === i + 1 && event && (
                              <div className="absolute bg-white shadow-lg p-2 rounded mt-1 text-left z-10">
                                <h4 className="font-bold">{event.title}</h4>
                                <p>{event.description}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <a href="#" className="readmore stretched-link" onClick={(e) => {
                  e.preventDefault();
                  toggleViewAllEvents();
                }}>
                  {showAllEvents ? "Hide events" : "View all events"} <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>{/* End Calendar Item */}

            {/* Announcements Component */}
            <div className="col-lg-6 col-md-6" data-aos="fade-up" data-aos-delay={200}>
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="bi bi-megaphone"></i>
                </div>
                <h3>Announcements</h3>
                <AnnouncementsList announcements={announcements} />
              </div>
            </div>{/* End Announcements Item */}
          </div>

          {/* Conditional Event List */}
          {showAllEvents && (
            <div className="row mt-4" data-aos="fade-up" data-aos-delay={200}>
              <div className="col-12">
                <EventsList events={events} selectedDate={selectedDate} />
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="row mt-6" data-aos="fade-up" data-aos-delay={300}>
            <div className="section-header mt-5">
              <h2>Activity Dashboard</h2>
              <p>Recent dormitory activities and statistics</p>
            </div>

            <div className="col-lg-6 col-md-6 mb-4">
              <VisitorsChart />
            </div>
            <div className="col-lg-6 col-md-6 mb-4">
              <MaintenanceRequestsChart />
            </div>
          </div>
        </div>
      </section>{/* End Calendar and Announcements Section */}
    </main>
  );
};

export default MainPage;
