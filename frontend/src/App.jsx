// App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./firebase";
import Chat from "./Chat";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Auth from "./Auth";
import "./App.css";

function AppContent() {
  const { user } = useAuth();
  const [currentChatId, setCurrentChatId] = useState(null);

  const handleNewChat = (chatId) => setCurrentChatId(chatId);
  const handleChatSelect = (chatId) => setCurrentChatId(chatId);

  return (
    <div className="app-container">
      {user ? (
        <>
          {/* Header fixed on top, moves with sidebar */}

          {/* Sidebar + Chat below header */}
          <div className="main-layout">
            <Sidebar
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onChatSelect={handleChatSelect}
            />
            <div className="chat-area">
              <Header />
              <Chat
                currentChatId={currentChatId}
                onChatCreated={handleNewChat}
              />
            </div>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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
