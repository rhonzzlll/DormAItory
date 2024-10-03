import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Users, Zap, Mail, Settings, CreditCard, Calendar, FileText } from 'lucide-react';
import styles from './styles/Main.module.css';
import dormbotPic from '../../Images/icons/dormbot pic.png';

const ActionCard = ({ icon, title, description, onClick }) => {
  return (
    <div className={styles.actionCard} onClick={onClick}>
      <div className={styles.icon}>{React.cloneElement(icon, { size: 48 })}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const CalendarComponent = ({ events }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const eventDates = events.reduce((acc, event) => {
    const date = new Date(event.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      acc[date.getDate()] = event.title;
    }
    return acc;
  }, {});

  return (
    <div className={styles.calendar_section}>
      <Calendar className={styles.calendar_icon} />
      <div className={styles.calendar_grid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className={styles.calendar_day}>{day}</div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isHighlighted = eventDates[day] ? styles.highlighted_day : '';
          return (
            <div key={i} className={`${styles.calendar_date} ${isHighlighted}`} title={eventDates[day]}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    // Fetch announcements and calendar events from your backend or state management
    // This is a placeholder. Replace with actual data fetching logic.
    setAnnouncements([
      { id: 1, content: "Office closed today. Hours resume tomorrow, 8 AM - 4:30 PM." }
    ]);
    setCalendarEvents([
      { id: 1, date: '2024-10-07', title: 'Maintenance Day' }
    ]);
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        {/* Welcome Message */}
        <div className={styles.welcomeMessage}>
          <p>Welcome to the User Dashboard</p>
        </div>

        <div className={styles.actionCards}>
          <ActionCard
            icon={<List />}
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
            title="Utilities"
            description="Monitor and manage utility usage"
            onClick={() => handleCardClick('/tenant/utilities')}
          />
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
          <ActionCard
            icon={<FileText />}
            title="Records"
            description="View your transaction history"
            onClick={() => handleCardClick('/tenant/records')}
          />
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
          <button className={styles.chatButton}>Chat with DormBot now!</button>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.calendar}>
            <h3>Calendar</h3>
            <CalendarComponent events={calendarEvents} />
          </div>
          <div className={styles.announcements}>
            <h3>Announcements</h3>
            <ul>
              {announcements.map(announcement => (
                <li key={announcement.id}>{announcement.content}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainPage;