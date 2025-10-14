import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password should be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName.trim()) {
        await updateProfile(user, {
          displayName: displayName.trim()
        });
      }

      navigate('/chat');
    } catch (error) {
      console.error('Signup error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email is already registered. Please use a different email or login.');
          break;
        case 'auth/invalid-email':
          alert('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          alert('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/network-request-failed':
          alert('Network error. Please check your internet connection.');
          break;
        default:
          alert('Signup failed: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
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
            <h2>Create Your Account</h2>
            <p>Join us to start your culinary adventure</p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="displayName">Full Name (Optional)</label>
            <input
              id="displayName"
              type="text"
              placeholder="Enter your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
              required
            />
          </div>

          <button 
            onClick={handleSignup} 
            className="auth-btn primary-btn"
            disabled={isLoading || !email || !password || !confirmPassword}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        {/* Login link */}
        <div className="auth-link">
          <p>
            Already have an account?{" "}
            <Link to="/" className="link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;