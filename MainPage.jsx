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
import styles from './styles/Main.module.css';
import dormbotPic from '../../Images/icons/dormbot pic.png';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

const ActionCard = ({ icon, title, description, onClick }) => {
  return (
    <div className={styles.actionCard} onClick={onClick}>
      <div className={styles.icon}>{React.cloneElement(icon, { size: 48 })}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const VisitorsChart = () => {
  const [visitorsData, setVisitorsData] = useState([]);
  useEffect(() => {
    const fetchVisitorsData = async () => {
      try {
        const response = await axios.get('http://dormaitory.online:8080/api/visitors/');
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
        const response = await axios.get('http://dormaitory.online:8080/api/maintenancerequest/get');
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

const MainPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    fetchAnnouncementsAndEvents();
  }, [selectedDate]);

  const fetchAnnouncementsAndEvents = async () => {
    try {
      const response = await axios.get('http://dormaitory.online:8080/api/announcements');
      const data = response.data;

      setAnnouncements(data.filter(item => !item.date || item.type === 'announcement'));
      setEvents(data.filter(item => item.date && item.type === 'event'));
    } catch (error) {
      console.error('Error fetching announcements and events:', error);
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        {/* Welcome Message */}
        <div className={styles.welcomeMessage}>
          <p>Welcome to the User Dashboard</p>
        </div>

        <div className={styles.actionCards}>
          <div className={styles.actionCardsRow}>
            <ActionCard
              icon={<Home />} // Changed icon to Home
              title="Room List"
              description="View and manage dormitory rooms"
              onClick={() => handleCardClick('/tenant/room-list')}
            />
            <ActionCard
              icon={<Users />}
              title="Visitor Management"
              description="Register and track visitors"
              onClick={() => handleCardClick('/tenant/visitor-management')}
            />
            <ActionCard
              icon={<Zap />}
              title="Rent & Utilities"
              description="Monitor and manage utility usage"
              onClick={() => handleCardClick('/tenant/utilities')}
            />
          </div>
          <div className={styles.actionCardsRow}>
            <ActionCard
              icon={<Mail />}
              title="Contact Admin"
              description="Get in touch with dormitory administration"
              onClick={() => handleCardClick('/tenant/contact-admin')}
            />
            <ActionCard
              icon={<Settings />}
              title="Maintenance Request"
              description="Submit a maintenance or repair request"
              onClick={() => handleCardClick('/tenant/maintenance-request')}
            />
            <ActionCard
              icon={<CreditCard />}
              title="Payment Options"
              description="View and manage your payment methods"
              onClick={() => handleCardClick('/tenant/payment-options')}
            />
          </div>
        </div>

        <div className={styles.chatBot}>
          <div className={styles.chatBotHeader}>
            <div className={styles.dormbot_icons}>
              <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
            </div>
            <div>
              <h3>DormBot</h3>
              <p>Allow me to assist you!</p>
            </div>
          </div>
          <div className={styles.chatButtonContainer}>
            <Link to="/tenant/chatbot" className={styles.chatButton}>Chat with DormBot now!</Link>
          </div>
        </div>

        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div id="cal-and-announcements" className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Announcements
              </h1>
              <div className="flex space-x-2">
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center">
                  <Megaphone className="mr-2 w-4 h-4" />
                  Announcements
                </div>
                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center">
                  <Calendar className="mr-2 w-4 h-4" />
                  Events
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Announcements Column */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Megaphone className="mr-3 w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Latest Announcements
                  </h2>
                </div>
                {events.map(event => (
                  <div key={event._id} className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center">
                    <div className="mr-4">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Title: {event.title}</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-bold">{formatDate(event.date)}</span>
                      </div>
                      <p className="text-gray-600">Description: {event.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar & Events Column */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="mr-3 w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Upcoming Events
                  </h2>
                </div>

                {/* Date Picker */}
                <div className="mb-4">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Select date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </div>

                {/* Simple Calendar Placeholder */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{months[selectedDate.month()]} {selectedDate.year()}</h3>
                    {/* Simplified Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mt-2 text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="font-bold text-gray-600">{day}</div>
                      ))}
                      {[...Array(31)].map((_, i) => {
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
                              <div className="absolute bg-white shadow-lg p-2 rounded mt-1 text-left">
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
              </div>
            </div>

            {/* New Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <VisitorsChart />
              <MaintenanceRequestsChart />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainPage;