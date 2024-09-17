import React, { useState } from 'react';
import styles from './styles/Payment.module.css'
import { CreditCard, CheckSquare } from 'lucide-react';

const PaymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>PAYMENT OPTION</h1>
        <CreditCard size={24} />
      </header>
      <p className={styles.subtitle}>Contact the admin first before paying</p>
      <div className={styles.options}>
        <button 
          className={`${styles.option} ${selectedOption === 'gcash' ? styles.selected : ''}`}
          onClick={() => handleOptionSelect('gcash')}
        >
          {selectedOption === 'gcash' && <CheckSquare className={styles.checkIcon} />}
          <span>GCASH</span>
          <img src="/path-to-gcash-logo.png" alt="GCash" className={styles.logo} />
        </button>
        <button 
          className={`${styles.option} ${selectedOption === 'paymaya' ? styles.selected : ''}`}
          onClick={() => handleOptionSelect('paymaya')}
        >
          {selectedOption === 'paymaya' && <CheckSquare className={styles.checkIcon} />}
          <span>PayMaya</span>
          <img src="/path-to-paymaya-logo.png" alt="PayMaya" className={styles.logo} />
        </button>
        <button 
          className={`${styles.option} ${selectedOption === 'cash' ? styles.selected : ''}`}
          onClick={() => handleOptionSelect('cash')}
        >
          {selectedOption === 'cash' && <CheckSquare className={styles.checkIcon} />}
          <span>Cash</span>
          <CreditCard className={styles.logo} />
        </button>
      </div>
      <div className={styles.actions}>
        <button className={styles.goBack}>GO BACK</button>
        <button className={styles.continue} disabled={!selectedOption}>CONTINUE</button>
      </div>
    </div>
  );
};

export default PaymentOptions;