// src/MainLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Header from "./Header";
import "./App.css";

const MainLayout = () => {
  return (
    <div className="app-container">
      
      <div className="main-content">
        <Header />
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
};

export default MainLayout;
