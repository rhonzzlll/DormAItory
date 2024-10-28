import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.companyInfo}>
          <h2>DormAItory</h2>
          <p>DormAItory is an innovative web-based dormitory management system designed to streamline
            the operations of residential facilities
            by integrating advanced AI-powered prompt-based analytics.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
        <div className={styles.linksColumn}>
          <h3>Useful Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Profile</a></li>

          </ul>
        </div>
        <div className={styles.linksColumn}>
          <h3>Our Services</h3>
          <ul>
            <li><a href="#">Rooms List</a></li>
            <li><a href="#">ChatBot</a></li>
            <li><a href="#">Maintenance Request</a></li>
            <li><a href="#">Utilities</a></li>
            <li><a href="#">Records</a></li>
          </ul>
        </div>
        <div className={styles.contactInfo}>
          <h3>Contact Us</h3>
              <p>MLQU Dormitory</p>

    <p>Manila, Philippines 1712</p>
    <p>Phone: (02) 8994 5124</p>
    <p>Email: mlqu.dormitory@gmail.com</p>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; Copyright <strong>DormAItory</strong>. All Rights Reserved</p>

      </div>
    </footer>
  );
};

export default Footer;