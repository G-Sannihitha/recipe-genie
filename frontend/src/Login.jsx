import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/chat");
    } catch (error) {
      alert("Google login error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/chat");
    } catch (error) {
      alert("Login error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEmailLogin();
    }
  };

  return (
    <div className="auth-container">
      {/* Mediterranean Doodle Background */}
      <div className="auth-wallpaper"></div>

      <div className="auth-card">
        {/* Header Section */}
        <div className="auth-header">
          <div className="logo-wrapper">
            <span className="chef-emoji">👨‍🍳</span>
            <h1 className="app-title">Recipe Genie</h1>
          </div>
          <div className="welcome-text">
            <h2>Welcome back</h2>
            <p>Log in to continue your culinary journey</p>
          </div>
        </div>

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin} 
          className="auth-btn google-btn"
          disabled={isLoading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="btn-icon"
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Email Login Form */}
        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <button 
            onClick={handleEmailLogin} 
            className="auth-btn primary-btn"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Continue"
            )}
          </button>
        </div>

        {/* Sign up link */}
        <div className="auth-link">
          <p>
            New to Recipe Genie?{" "}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;