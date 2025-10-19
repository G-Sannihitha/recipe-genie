// C:\AI_CHATBOT\recipe-genie\frontend\src\App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Chat from "./Chat";
import MobileChat from "./components/MobileChat";
import Header from "./Header";
import MobileHeader from "./components/MobileHeader";
import MobileSidebar from "./components/MobileSidebar";
import Sidebar from "./Sidebar";
import Auth from "./Auth";
import { useSwipe } from "./hooks/useSwipe";
import "./App.css";

function AppContent() {
  const { user } = useAuth();
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe gestures for mobile
  useSwipe(
    () => isMobile && setSidebarOpen(false),
    () => isMobile && setSidebarOpen(true)
  );

  const handleNewChat = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {isMobile ? (
        // Mobile Layout
        <>
          <MobileHeader 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
          
          <MobileSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            currentChatId={currentChatId}
          />
          
          <div className="mobile-chat-area">
            <MobileChat
              currentChatId={currentChatId}
              onChatCreated={handleNewChat}
            />
          </div>
        </>
      ) : (
        // Desktop Layout
        <>
          <Header />
          <div className="main-layout">
            <Sidebar
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onChatSelect={handleChatSelect}
            />
            <div className="chat-area">
              <Chat
                currentChatId={currentChatId}
                onChatCreated={handleNewChat}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}