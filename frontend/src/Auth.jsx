import React, { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons
import wallpaper from "./assets/Wallpaper.png";
import "./Auth.css";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // ---- Validate password strength ----
  const isStrongPassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  // ---- Google Login ----
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

  // ---- Email Login ----
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

  // ---- Signup ----
  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!isStrongPassword(password)) {
      alert(
        "Please choose a stronger password.\nIt must include at least:\n- 8 characters\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character"
      );
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (displayName.trim()) {
        await updateProfile(user, { displayName: displayName.trim() });
      }

      navigate("/chat");
    } catch (error) {
      alert("Signup failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Forgot Password ----
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset password");
      return;
    }
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("✅ Password reset email sent! Check your inbox.");
    } catch (error) {
      alert("Error sending password reset email: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Enter key ----
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      isSignUp ? handleSignup() : handleEmailLogin();
    }
  };

  // ---- Toggle password visibility ----
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-wallpaper"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.92)), url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="auth-card">
        {/* ===== App Header ===== */}
        <div className="auth-header">
          <div className="logo-wrapper">
            <span className="chef-emoji">👨‍🍳</span>
            <h1 className="app-title">Recipe Genie</h1>
          </div>
          <div className="welcome-text">
            <p>
              {isSignUp
                ? "Create an account to start your culinary adventure."
                : "Log in to continue your culinary journey."}
            </p>
          </div>
        </div>

        {/* ===== Google Login ===== */}
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

        <div className="divider">
          <span>or</span>
        </div>

        {/* ===== Email Form ===== */}
        <div className="auth-form">
          {isSignUp && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Full name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="form-input"
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Password Field with Eye Icon */}
          <div className="input-group password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-input password-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Field with Eye Icon */}
          {isSignUp && (
            <div className="input-group password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="form-input password-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {/* Forgot Password (only for login) */}
          {!isSignUp && (
            <div className="forgot-password">
              <button
                className="link forgot-btn"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            onClick={isSignUp ? handleSignup : handleEmailLogin}
            className="auth-btn primary-btn"
            disabled={
              isLoading ||
              !email ||
              !password ||
              (isSignUp && !confirmPassword)
            }
          >
            {isLoading ? <div className="loading-spinner" /> : "Continue"}
          </button>
        </div>

        {/* ===== Toggle ===== */}
        <div className="auth-toggle">
          <p>
            {isSignUp ? "Already have an account?" : "New to Recipe Genie?"}{" "}
            <button
              className="link toggle-btn"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;