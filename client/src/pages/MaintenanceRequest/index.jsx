import React, { useState } from 'react';
import styles from './styles.module.css'; // Correct file name

const MaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:'',
    tenantId: '',
    floorNo: '',
    roomNo: '',
    roomLetter: '',
    concernType: '',
    otherConcern: '',
    specificationOfConcern: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>dormAitory</h1>
        <div className={styles.profileIcon}></div>
      </header>
      <main className={styles.main}>
        <h2>Maintenance Request</h2>
        <p className={styles.subtitle}>Fill out the following fields and submit your request form. Please expect a minimum of 1-2 days for the processing of your request.</p>
        <form onSubmit={handleSubmit}>
          <section>
            <h3>Tenant Information</h3>
            <p>Fill out all the required fields. Make sure that your room number is specified and clear.</p>
            <div className={styles.formGrid}>
              <input 
                type="text" 
                name="fullName" 
                placeholder="Full Name" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="text" 
                name="tenantId" 
                placeholder="Tenant ID No." 
                value={formData.tenantId} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="text" 
                name="floorNo" 
                placeholder="Floor No." 
                value={formData.floorNo} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="text" 
                name="roomNo" 
                placeholder="Room No." 
                value={formData.roomNo} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="text" 
                name="roomLetter" 
                placeholder="Room Letter (A or B)" 
                value={formData.roomLetter} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </section>
          <section>
            <h3>Type of Concern</h3>
            <p>Fill out the required fields.</p>
            <div className={styles.concernOptions}>
              <label>
                <input 
                  type="radio" 
                  name="concernType" 
                  value="electrical" 
                  checked={formData.concernType === 'electrical'} 
                  onChange={handleInputChange} 
                />
                Electrical (Involves Sockets, Wirings, etc.)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="concernType" 
                  value="aircon" 
                  checked={formData.concernType === 'aircon'} 
                  onChange={handleInputChange} 
                />
                Aircon Maintenance (Involves Issue/Damage, Cleaning Request, etc.)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="concernType" 
                  value="room" 
                  checked={formData.concernType === 'room'} 
                  onChange={handleInputChange} 
                />
                Room Maintenance (Involves Mattress Request, Bunk Maintenance, etc.)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="concernType" 
                  value="other" 
                  checked={formData.concernType === 'other'} 
                  onChange={handleInputChange} 
                />
                Others (Please specify)
              </label>
              {formData.concernType === 'other' && (
                <input 
                  type="text" 
                  name="otherConcern" 
                  placeholder="Specify other concern" 
                  value={formData.otherConcern} 
                  onChange={handleInputChange} 
                />
              )}
            </div>
          </section>
          <section>
            <h3>Specification of Concern</h3>
            <p>Fill out this field with your specified concern/s.</p>
            <textarea 
              name="specificationOfConcern" 
              placeholder="Fill out this field with your specified concern/s" 
              value={formData.specificationOfConcern} 
              onChange={handleInputChange} 
              required 
            />
          </section>
          <button type="submit" className={styles.submitButton}>Submit Form</button>
        </form>
        <p className={styles.note}>*Only fill-up when advised and/or necessary*</p>
      </main>
    </div>
  );
};

export default MaintenanceRequest;
