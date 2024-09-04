import React from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './styles.module.css';
import dormbotPic from '../../Images/icons/dormbot pic.png';
const DormBot = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Ask Anything!</h1>
      <p className={styles.subHeader}>Our DormBot is here to assist you</p>
      
      <div className={styles.grid}>
        <button className={styles.button}>
          What can DormBot do?
        </button>
        <button className={styles.button}>
          Where can I make a cash payment?
        </button>
        <button className={styles.button}>
          How do I request a repair?
        </button>
        <button className={styles.button}>
          Can I have visitors in my room?
        </button>
      </div>
      
      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder="Ask Something..."
          className={styles.input}
        />
        <button className={styles.iconButton}>
          <MessageCircle className="h-6 w-6 text-gray-400" />
        </button>
      </div>
      
      <div className={styles.dormbot_icons}>
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
            <img src={dormbotPic} alt="DormBot" className={styles.dormbot_icon} />
          </div>
      </div>

  );
};

export default DormBot;
