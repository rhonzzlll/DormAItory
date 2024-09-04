import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    birthdate: {
      day: "",
      month: "",
      year: "",
    },
    gender: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in data.birthdate) {
      setData((prev) => ({
        ...prev,
        birthdate: { ...prev.birthdate, [name]: value },
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const url = "http://localhost:8080/api/users";
      const { data: res } = await axios.post(url, data);
      navigate("/login");
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
        <div className={styles.form_header}>
          <img src="\src\Images\icons\dormbot pic.png" alt="Dormitory Icon" />
          <h1>Tenant Registration Form</h1>
        </div>
        <form className={styles.form_container} onSubmit={handleSubmit}>
          <div className={styles.input_group}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter your First Name"
              value={data.firstName}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.input_group}>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your Last Name"
              value={data.lastName}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={`${styles.input_group} ${styles.full_width}`}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter your Address"
              value={data.address}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.input_group}>
            <label>Birthdate (DD/MM/YYYY)</label>
            <div className={styles.date_group}>
              <select
                name="day"
                value={data.birthdate.day}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                name="month"
                value={data.birthdate.month}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Month</option>
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((month, i) => (
                  <option key={i} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                name="year"
                value={data.birthdate.year}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Year</option>
                {[...Array(100)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={i} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className={styles.input_group}>
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={data.gender}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className={styles.input_group}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your Password"
              value={data.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.input_group}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your Password"
              value={data.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.input_group}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your Email Address"
              value={data.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.input_group}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter your Phone Number"
              value={data.phoneNumber}
              onChange={handleChange}
              className={styles.input}
              required
            />
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
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
