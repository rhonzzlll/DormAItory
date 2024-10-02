import React from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';


const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.contactInfo}>
            <h4>Contact Us</h4>
            <p>MLQU Dormitory</p>

            <p>Manila, Philippines 1712</p>
            <p>Phone: (02) 8994 5124</p>
            <p>Email: mlqu.dormitory@gmail.com</p>
          </div>
          <div className={styles.links}>
            <h4>Links</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Help & Support</a></li>
            </ul>
          </div>
          <div className={styles.social}>
            <h4>Follow Us</h4>
            <div className={styles.socialIcons}>
              <a href="#"><MessageCircle size={18} /></a>
              <a href="#"><MessageCircle size={18} /></a>
              <a href="#"><MessageCircle size={18} /></a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; 2024 Dormitory Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>

  )
}
export default Footer;
