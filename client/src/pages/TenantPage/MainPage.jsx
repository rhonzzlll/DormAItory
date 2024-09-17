import React from 'react';
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

const CalendarComponent = () => {
  return (
    <div className={styles.calendar_section}>
      <Calendar className={styles.calendar_icon} />
      <div className={styles.calendar_grid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className={styles.calendar_day}>{day}</div>
        ))}
        {[...Array(31)].map((_, i) => (
          <div key={i} className={i === 6 ? styles.highlighted_day : styles.calendar_date}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
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
            <CalendarComponent />
          </div>
          <div className={styles.announcements}>
            <h3>Announcements</h3>
            <ul>
              <li>Our office will be closed today. Hence, the office hours will be resumed tomorrow, Monday, from 8 AM to 4:30 PM. Thank you!</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainPage;