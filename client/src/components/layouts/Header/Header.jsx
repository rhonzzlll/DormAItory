import React, { useContext, useState } from 'react'; // Import useContext
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import styles from './Header.module.css'; // Update path as needed
import { UserContext } from '../../../redux/UserContext'; // Adjust the path to UserContext

const Header = () => {
  const { user } = useContext(UserContext); // Get user from UserContext
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    console.log("Logged out");
    // Implement logout functionality here
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/tenant" className={styles.logoLink}>
          <img
            src={require('E:/dorm/client/src/Images/icons/logo.png')} // Update the path to your image
            alt="Logo"
            className={styles.logo}
          />
        </Link>

        <div className={styles.userIcon} onClick={toggleDropdown} style={{ cursor: 'pointer', position: 'relative' }}>
          {/* SVG Icon */}
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
              <Link to="/profile" className={styles.dropdownItem}>
                Edit Profile
              </Link>
              <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
