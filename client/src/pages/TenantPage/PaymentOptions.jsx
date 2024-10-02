import React, { useState } from 'react';
import styles from './styles/Payment.module.css';
import { CreditCard, CheckSquare } from 'lucide-react';

const PaymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>You may visit the admin office for billing inquiries</p>
      <h2 className={styles.title}>Available Payment Options</h2>
      <div className={styles.grid}>
        <PaymentOption 
          icon={<CreditCard className={styles.icon} />}
          title="GCash"
          subtitle="GCash Payment"
          selected={selectedOption === 'gcash'}
          onClick={() => handleOptionSelect('gcash')}
          color="#017cfe" // GCash color
        />
        <PaymentOption 
          icon={<CreditCard className={styles.icon} />}
          title="PayMaya"
          subtitle="PayMaya Payment"
          selected={selectedOption === 'paymaya'}
          onClick={() => handleOptionSelect('paymaya')}
          color="#29741d" // PayMaya color
        />
        <PaymentOption 
          icon={<CreditCard className={styles.icon} />}
          title="Cash"
          subtitle="Cash Payment"
          selected={selectedOption === 'cash'}
          onClick={() => handleOptionSelect('cash')}
          color="#01b463" // Cash color
        />
      </div>
      <div className={styles.actions}>
        <button className={styles.goBack}>GO BACK</button>
        <button className={styles.continue} disabled={!selectedOption}>CONTINUE</button>
      </div>
    </div>
  );
};

const PaymentOption = ({ icon, title, subtitle, selected, onClick, color }) => {
  return (
    <div 
      className={`${styles.paymentOption} ${selected ? styles.selected : ''}`} 
      onClick={onClick}
      style={{ backgroundColor: color }} // Set background color based on props
    >
      {icon}
      <h3 className={styles.optionTitle}>{title}</h3>
      <p className={styles.optionSubtitle}>{subtitle}</p>
      <button className={styles.detailsButton}>See Details</button>
    </div>
  );
};

export default PaymentOptions;
