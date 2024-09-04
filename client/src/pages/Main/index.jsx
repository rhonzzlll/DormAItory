import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import dormbotPic from '../../Images/icons/dormbot pic.png';
import icon from '../../Images/icons/icon.png';
import { Mail, Settings, CreditCard, MessageCircle, Calendar } from 'lucide-react';

const Main = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('userData')) || {};

  const handleLogout = () => {
    localStorage.removeItem('userData');
    window.location.reload();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <div className={styles.main_container}>
      <header className={styles.header}>
        <h1 className={styles.header_title}>Dormitory Management System</h1>
        <div className={styles.profile_section}>
          <img
            src={icon}
            alt="Icon"
            className={styles.profile_icon}
            onClick={toggleProfileMenu}
          />
          {showProfileMenu && (
            <div className={styles.profile_menu}>
              <div className={styles.profile_info}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
              <button className={styles.white_btn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.content_wrapper}>
        <div className={styles.actions_section}>
          <Link to="/ContactAdmin" className={styles.action_link}>
            <ActionButton icon={<Mail />} label="Contact Admin" />
          </Link>
          <Link to="/MaintenanceRequest" className={styles.action_link}>
            <ActionButton icon={<Settings />} label="Maintenance Request" />
          </Link>
          <Link to="/Payment" className={styles.action_link}>
            <ActionButton icon={<CreditCard />} label="Payment Options" />
          </Link>
        </div>

        <div className={styles.dormbot_section}>
          <div className={styles.dormbot_info}>
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_image} />
            <div className={styles.dormbot_text}>
              <p className={styles.dormbot_title}>DormBot</p>
              <p>Allow me to assist you!</p>
            </div>
          </div>
          <Link to="/Dormbot" className={styles.chat_button}>
            Chat with DormBot now!
          </Link>
          <div className={styles.dormbot_icons}>
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
          </div>
        </div>

        <div className={styles.bottom_section}>
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

          <div className={styles.announcements_section}>
            <div className={styles.announcements_header}>
              <MessageCircle className={styles.announcement_icon} />
              <h3 className={styles.announcements_title}>ANNOUNCEMENTS</h3>
            </div>
            <p className={styles.announcement_date}>
              <span className={styles.announcement_author}>Admin</span> • Sun, July 7, 2024
            </p>
            <p className={styles.announcement_text}>
              Our office will be closed today. Hence, the office hours will be resumed
              tomorrow, Monday, from 8 AM to 4:30 PM. Thank you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label }) => (
  <div className={styles.action_button}>
    <div className={styles.action_icon_container}>
      {icon}
    </div>
    <button className={styles.action_btn}>
      {label}
    </button>
  </div>
);

export default Main;