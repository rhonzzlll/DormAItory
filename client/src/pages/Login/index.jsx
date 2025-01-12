import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../../redux/UserContext'; // Adjust the path if necessary
import styles from "./styles.module.css";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = "949553693113-0ge0ak1tr940too033kavmkfb1iedbfh.apps.googleusercontent.com"; // Your actual Google client ID

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8080/api/auth"; // Your API endpoint
      const { data: res } = await axios.post(url, data);

      // Save user ID, token and role to local storage
      localStorage.setItem("_id", res["_id"]);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      // Save user email to context
      setUser({ email: data.email });

      // Redirect based on user role
      if (res.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/tenant");
      }
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status <= 500) {
        setError(error.response.data.message); // Display error message from the server
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log('Google login success:', response);
    const { credential } = response;
    try {
      const url = "http://localhost:8080/api/auth/google"; // Your API endpoint for Google login
      const { data: res } = await axios.post(url, { token: credential });

      // Save user ID, token and role to local storage
      localStorage.setItem("_id", res["_id"]);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      // Save user email to context
      setUser({ email: res.email });

      // Redirect based on user role
      if (res.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/tenant");
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError("An error occurred during Google login. Please try again.");
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failure:', error);
    setError("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={styles.login_container}>
        <div className={styles.login_form_container}>
          <div className={styles.left}>
            <form className={styles.form_container} onSubmit={handleSubmit}>
              <h1>dormAItory</h1>
              <input
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                value={data.email}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                value={data.password}
                required
                className={styles.input}
              />
              {error && <div className={styles.error_msg}>{error}</div>}
              <button type="submit" className={styles.green_btn}>
                Sign In
              </button>
            </form>
            <div className={styles.google_login}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                buttonText="Login with Google"
              />
            </div>
          </div>
          <div className={styles.right}>
            <h1>New Here?</h1>
            <Link to="/signup">
              <button type="button" className={styles.white_btn}>
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;