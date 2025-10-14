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
  };

  return (
    <header className="header">
      {/* Left: Chef icon + Title */}
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
            <div className="dropdown-item email-item">{email}</div>
            <div className="dropdown-divider"></div>

            <div className="dropdown-section-title">THEME</div>
            <div
              className="dropdown-item"
              onClick={() => handleThemeChange("light")}
            >
              <Sun size={16} className="icon" /> Light
            </div>
            <div
              className="dropdown-item"
              onClick={() => handleThemeChange("dark")}
            >
              <Moon size={16} className="icon" /> Dark
            </div>
            <div
              className="dropdown-item"
              onClick={() => handleThemeChange("system")}
            >
              <Monitor size={16} className="icon" /> System Default
            </div>

            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout-item" onClick={logout}>
              <LogOut size={16} className="icon" /> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
