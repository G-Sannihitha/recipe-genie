// C:\AI_CHATBOT\recipe-genie\frontend\src\Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
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
          <span className="username">Hello, {username}</span>
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
                <div className="user-name">Hello, {username}</div>
                <div className="user-email">{email}</div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            {/* Theme Section */}
            <div className="dropdown-section">
              <div className="section-title">THEME</div>
              <div className="theme-options">
                <div
                  className={`theme-option ${!darkMode ? 'active' : ''}`}
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun size={16} className="theme-icon" />
                  <span className="theme-label">Light</span>
                  {!darkMode && <div className="theme-check">✓</div>}
                </div>
                <div
                  className={`theme-option ${darkMode ? 'active' : ''}`}
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
              <div className="logout-option" onClick={handleLogout}>
                <LogOut size={16} className="logout-icon" />
                <span className="logout-label">Logout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;