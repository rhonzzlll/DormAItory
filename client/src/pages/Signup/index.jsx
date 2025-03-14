import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles.module.css';

const Signup = () => {
  const [data, setData] = useState({
    tenantId: undefined,
    firstName: '',
    lastName: '',
    address: "",
    birthdate: {
      day: '',
      month: '',
      year: '',
    },
    gender: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToEULA: false, // New state for EULA agreement
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in data.birthdate) {
      setData((prev) => ({
        ...prev,
        birthdate: { ...prev.birthdate, [name]: value },
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox for EULA
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!data.firstName.trim()) {
      errors.firstName = 'First Name is required';
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'Last Name is required';
    }

    if (!data.birthdate.day || !data.birthdate.month || !data.birthdate.year) {
      errors.birthdate = 'Complete Birthdate is required';
    }

    if (!data.gender) {
      errors.gender = 'Gender is required';
    }

    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email address is invalid';
    }

    if (!data.phoneNumber) {
      errors.phoneNumber = 'Phone Number is required';
    } else if (!/^\d{11}$/.test(data.phoneNumber)) { // Updated to 11 digits
      errors.phoneNumber = 'Phone Number must be 11 digits';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.agreeToEULA) {
      errors.agreeToEULA = 'You must agree to the End User License Agreement';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const url = 'http://dormaitory.online:8080/api/users';

      const currentData = { ...data };
      delete currentData.agreeToEULA; // Remove EULA flag before sending to backend

      currentData["birthdate"] = new Date(`${data.birthdate.year}-${data.birthdate.month}-${data.birthdate.day}`);

      const { data: res } = await axios.post(url, currentData);
      navigate('/login');
      console.log(res.message);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.form_header}>
            <h1>Sign Up</h1>
          </div>
          <div className={styles.form_container}>
            <div className={styles.input_group}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={data.firstName}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.firstName && <div className={styles.error_msg}>{errors.firstName}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={data.lastName}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.lastName && <div className={styles.error_msg}>{errors.lastName}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={data.address}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.input_group}>
              <label>Birthdate</label>
              <div className={styles.date_group}>
                <select name="day" value={data.birthdate.day} onChange={handleChange}>
                  <option value="">Day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select name="month" value={data.birthdate.month} onChange={handleChange}>
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
                <select name="year" value={data.birthdate.year} onChange={handleChange}>
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {errors.birthdate && <div className={styles.error_msg}>{errors.birthdate}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Gender</label>
              <select name="gender" value={data.gender} onChange={handleChange} className={styles.input}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>

              </select>
              {errors.gender && <div className={styles.error_msg}>{errors.gender}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.email && <div className={styles.error_msg}>{errors.email}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={data.phoneNumber}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.phoneNumber && <div className={styles.error_msg}>{errors.phoneNumber}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.password && <div className={styles.error_msg}>{errors.password}</div>}
            </div>
            <div className={styles.input_group}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.confirmPassword && <div className={styles.error_msg}>{errors.confirmPassword}</div>}
            </div>
            <div className={`${styles.input_group} ${styles.full_width}`}>
              <label className={styles.eula_checkbox}>
                <input
                  type="checkbox"
                  name="agreeToEULA"
                  checked={data.agreeToEULA}
                  onChange={handleChange}
                  required
                />
                I agree to the End User License Agreement (EULA)
              </label>
              <div className={styles.eula_container}>
                <h2>End User License Agreement (EULA)</h2>
                <p>Last Updated: January 11, 2025</p>
                <p>This End User License Agreement ("Agreement") is a legal agreement between you ("User" or "You") and Technological Institute of the Philippines Dormitory Management Team ("Company," "We," "Us," or "Our") for the use of the dormAItory ("System"). By accessing or using the System, you agree to be bound by the terms of this Agreement. If you do not agree to these terms, you must not use the System.</p>
                <h3>1. License Grant</h3>
                <p>1.1 The Company grants you a limited, non-exclusive, non-transferable, revocable license to access and use the System solely for personal, non-commercial purposes, subject to the terms of this Agreement.</p>
                <h3>2. Data Collection and Usage</h3>
                <p>2.1 The System collects personal data, including but not limited to:</p>
                <ul>
                  <li>Full name</li>
                  <li>Contact information (email, phone number)</li>
                  <li>Address</li>
                  <li>Tenant ID</li>
                  <li>Payment details</li>
                  <li>Visitor information</li>
                  <li>Maintenance requests</li>
                  <li>Other information provided for dormitory management purposes.</li>
                </ul>
                <p>2.2 This data will be used for the following purposes:</p>
                <ul>
                  <li>Managing your dormitory account</li>
                  <li>Processing payments and tracking transaction history</li>
                  <li>Enhancing user experience through personalized services</li>
                  <li>Maintaining security and monitoring visitor access</li>
                  <li>Conducting analytics for service improvement.</li>
                </ul>
                <p>2.3 We are committed to safeguarding your data in compliance with applicable data protection laws.</p>
                <h3>3. User Responsibilities</h3>
                <p>3.1 You agree not to:</p>
                <ul>
                  <li>Share your login credentials with others.</li>
                  <li>Use the System for any unlawful or unauthorized purpose.</li>
                  <li>Tamper with or disrupt the System's functionality.</li>
                </ul>
                <p>3.2 You are responsible for the accuracy of the data you provide. Any incorrect or outdated information may impact the functionality of the System.</p>
                <h3>4. Data Safekeeping</h3>
                <p>4.1 The Company implements industry-standard security measures to protect your data. However, you acknowledge that no system is entirely secure, and the Company cannot guarantee absolute protection against unauthorized access or data breaches.</p>
                <p>4.2 In case of a data breach, the Company will notify affected users as required by applicable laws.</p>
                <h3>5. Ownership and Intellectual Property</h3>
                <p>5.1 The System, including its software, designs, logos, and content, is the property of the Company and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the System.</p>

                <p>This Agreement shall be governed by and construed in accordance with the laws of the Philippines.</p>
                <p>For questions or disputes about this agreement, please contact us at mrsantos@tip.edu.ph.</p>
              </div>
              {errors.agreeToEULA && <div className={styles.error_msg}>{errors.agreeToEULA}</div>}
            </div>
            {error && <div className={styles.error_msg}>{error}</div>}
            <button
              type="submit"
              className={`${styles.green_btn} ${styles.full_width}`}
            >
              REGISTER
            </button>
            <div className={styles.link_container}>
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 underline font-semibold">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;