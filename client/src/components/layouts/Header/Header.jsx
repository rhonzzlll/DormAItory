import React from 'react';
import styles from './Header.module.css';
import { Home, User, List, Users, Zap, Info } from 'lucide-react';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1>Dormitory Management System</h1>
        <nav>
          <ul className={styles.navList}>
            <li><a href="/home"><Home size={18} />Home</a></li>
            <li><a href="/profile"><User size={18} />Profile</a></li>

            <li><a href="/about"><Info size={18} />About</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;