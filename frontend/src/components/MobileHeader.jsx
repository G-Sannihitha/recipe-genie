// C:\AI_CHATBOT\recipe-genie\frontend\src\components\MobileHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./MobileHeader.css";

const MobileHeader = ({ sidebarOpen, setSidebarOpen, user }) => {
  const { logout } = useAuth();
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
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
      <header className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h1 className="mobile-title">Recipe Genie</h1>

        <div className="mobile-user-section" ref={dropdownRef}>
          <div
            className="mobile-user-avatar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img
              src={profilePhoto}
              alt="Profile"
              className="mobile-avatar"
              referrerPolicy="no-referrer"
            />
          </div>

          {menuOpen && (
            <div className="mobile-dropdown-menu">
              <div className="mobile-dropdown-item mobile-email-item">
                {email}
              </div>
              <div className="mobile-dropdown-divider"></div>

              <div className="mobile-dropdown-section-title">THEME</div>
              <div
                className="mobile-dropdown-item"
                onClick={() => handleThemeChange("light")}
              >
                <Sun size={16} className="mobile-dropdown-icon" /> Light
              </div>
              <div
                className="mobile-dropdown-item"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon size={16} className="mobile-dropdown-icon" /> Dark
              </div>
              <div
                className="mobile-dropdown-item"
                onClick={() => handleThemeChange("system")}
              >
                <Monitor size={16} className="mobile-dropdown-icon" /> System Default
              </div>

              <div className="mobile-dropdown-divider"></div>
              <div
                className="mobile-dropdown-item mobile-logout-item"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} className="mobile-dropdown-icon" /> Logout
              </div>
            </div>
          )}
        </div>
      </header>

      {/* === Logout Confirmation Modal === */}
      {showLogoutModal && (
        <div className="mobile-logout-modal-overlay">
          <div className="mobile-logout-modal">
            <h3>Are you sure you want to log out?</h3>
            <p>
              Log out of Recipe Genie as <br />
              <strong>{email}</strong>?
            </p>
            <div className="mobile-modal-buttons">
              <button className="mobile-logout-btn" onClick={confirmLogout}>
                Log out
              </button>
              <button
                className="mobile-cancel-btn"
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

export default MobileHeader;
