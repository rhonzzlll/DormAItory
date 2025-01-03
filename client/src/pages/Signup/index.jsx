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
      const url = 'http://localhost:8080/api/users';

      const currentData = { ...data };
      delete currentData.agreeToEULA; // Remove EULA flag before sending to backend

      currentData["birthdate"] = new Date(`${data.birthdate.day} ${data.birthdate.month} ${data.birthdate.year}`);

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
                  {/* Add day options here */}
                </select>
                <select name="month" value={data.birthdate.month} onChange={handleChange}>
                  <option value="">Month</option>
                  {/* Add month options here */}
                </select>
                <select name="year" value={data.birthdate.year} onChange={handleChange}>
                  <option value="">Year</option>
                  {/* Add year options here */}
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
                <option value="other">Other</option>
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
                I agree to the <button type="button" className={styles.eula_link} onClick={() => alert('EULA Details')}>
                  End User License Agreement
                </button>
              </label>
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
                <Link to="/login" className={styles.link}>
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