import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import styles from './Header.module.css'; // Update path as needed
import { UserContext } from '../../../redux/UserContext'; // Adjust the path to UserContext
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';

const clientId = "949553693113-0ge0ak1tr940too033kavmkfb1iedbfh.apps.googleusercontent.com"; // Replace with your actual Google client ID

const Header = () => {
  const { user, logout } = useContext(UserContext); // Get user and logout from UserContext
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Use navigate to redirect

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    googleLogout();
    logout();
    console.log("Logged out");
    navigate('/login'); // Redirect to login page after logout
  };

  // Check if the user is an admin based on the role stored in local storage
  const isAdmin = localStorage.getItem("role") === "admin";

  // If user is admin, don't render the header
  if (isAdmin) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="index-page">
        <header id="header" className="header fixed-top">
          <div className="topbar d-flex align-items-center">
            <div className="container d-flex justify-content-center justify-content-md-between">
              <div className="contact-info d-flex align-items-center">
                <i className="bi bi-pin-map d-flex align-items-center"> Arlegui Dormitory, Arlegui St., Quiapo, Manila</i>
                <i className="bi bi-telephone d-flex align-items-center ms-4"><span> Contact us via +63 945 840 5527</span></i>
              </div>
            </div>
          </div>

          {/* Main Header */}
          <div className={`${styles.mainHeader} branding d-flex align-items-center`}>
            <div className={`${styles.container} container position-relative d-flex align-items-center justify-content-between`}>
              {/* Logo */}
              <RouterLink
                to="/tenant"
                className="logo d-flex align-items-center"
              >
                <img src="assets/img/typelogo.png" alt="Logo" />
              </RouterLink>

              {/* Navigation Bar */}
              <nav id="navmenu" className="navmenu">
                <ul>
                  <li><a href="/tenant" className="active">Services<br /></a></li>
                  <li><RouterLink to="/tenant/chatbot">DormBot</RouterLink></li>
                  <li><ScrollLink to="cal-and-announcements" smooth={true} duration={500}>Calendar and Announcements</ScrollLink></li>
                  <li><RouterLink to="/profile">Profile</RouterLink></li>
                </ul>
                <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
              </nav>

              {/* User Dropdown */}
              <div className={styles.userIcon} onClick={toggleDropdown} style={{ cursor: 'pointer', position: 'relative' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: '40px', height: '40px', color: 'white' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>

                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    {/* Display user email if available */}
                    <p className={styles.dropdownItem}>Email: {user?.email || "Not logged in"}</p>
                    {/* Use Link to navigate to the Profile page */}
                    <RouterLink to="/profile" className={styles.dropdownItem}>
                      Profile
                    </RouterLink>
                    <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Header;