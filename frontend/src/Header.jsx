// C:\AI_CHATBOT\recipe-genie\frontend\src\Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, LogOut, X } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  const username = user?.displayName || user?.email?.split("@")[0] || "Guest";
  const email = user?.email || "user@example.com";
  const profilePhoto =
    user?.photoURL || "https://cdn-icons-png.flaticon.com/512/2922/2922506.png";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle theme changes
  const handleThemeChange = (mode) => {
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      localStorage.setItem("theme", "system");
    } else {
      setDarkMode(mode === "dark");
      localStorage.setItem("theme", mode);
    }
    setMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        {/* Left: Title */}
        <div className="header-left">
          <span className="header-title">Recipe Genie</span>
        </div>

        {/* Right: Profile + Theme Dropdown */}
        <div className="header-right" ref={dropdownRef}>
          <div className="user-section" onClick={() => setMenuOpen(!menuOpen)}>
            <img
              src={profilePhoto}
              alt="Profile"
              className="profile-avatar"
              referrerPolicy="no-referrer"
            />
            <span className="username">{username}</span>
          </div>

          {menuOpen && (
            <div className="dropdown-menu">
              {/* User Info */}
              <div className="user-info">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="user-info-avatar"
                  referrerPolicy="no-referrer"
                />
                <div className="user-details">
                  <div className="user-name">{username}</div>
                  <div className="user-email">{email}</div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* Theme Section */}
              <div className="dropdown-section">
                <div className="section-title">THEME</div>
                <div className="theme-options">
                  <div
                    className={`theme-option ${!darkMode ? "active" : ""}`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun size={16} className="theme-icon" />
                    <span className="theme-label">Light</span>
                    {!darkMode && <div className="theme-check">✓</div>}
                  </div>
                  <div
                    className={`theme-option ${darkMode ? "active" : ""}`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon size={16} className="theme-icon" />
                    <span className="theme-label">Dark</span>
                    {darkMode && <div className="theme-check">✓</div>}
                  </div>
                  <div
                    className="theme-option"
                    onClick={() => handleThemeChange("system")}
                  >
                    <Monitor size={16} className="theme-icon" />
                    <span className="theme-label">System Default</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* Logout */}
              <div className="logout-section">
                <div
                  className="logout-option"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <LogOut size={16} className="logout-icon" />
                  <span className="logout-label">Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* === Logout Confirmation Modal === */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <button
              className="modal-close"
              onClick={() => setShowLogoutModal(false)}
            >
              <X size={18} />
            </button>
            <h3>Are you sure you want to log out?</h3>
            <p>
              Log out of Recipe Genie as <br />
              <strong>{email}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="logout-btn" onClick={confirmLogout}>
                Log out
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
