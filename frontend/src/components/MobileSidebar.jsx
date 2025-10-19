// MobileSidebar.jsx - Fixed with proper event handling
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MobileSidebar.css';

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  onChatSelect, 
  onNewChat,
  currentChatId 
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [deleteChatTitle, setDeleteChatTitle] = useState("");
  const menuRefs = useRef({});
  const sidebarRef = useRef(null);

  // Load user chats
  const loadUserChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const BASE_URL = process.env.REACT_APP_API_URL;
      const res = await fetch(`${BASE_URL}/chat/chats/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      } else {
        setChats([]);
      }
    } catch (e) {
      console.error("Error loading chats:", e);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      loadUserChats();
    }
  }, [user, isOpen]);

  // Global sidebar refresh function
  useEffect(() => {
    window.sidebarRefresh = loadUserChats;
    return () => {
      delete window.sidebarRefresh;
    };
  }, []);

  const handleNewChat = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL;
      const res = await fetch(`${BASE_URL}/chat/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid }),
      });
      
      if (res.ok) {
        const data = await res.json();
        await loadUserChats();
        onNewChat(data.chat_id);
        onChatSelect(data.chat_id);
        onClose();
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const startRename = (chatId, title, e) => {
    e?.stopPropagation();
    setRenamingChatId(chatId);
    setRenameValue(title);
    setActiveMenu(null);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!renameValue.trim()) {
      setRenamingChatId(null);
      return;
    }
    
    try {
      const BASE_URL = process.env.REACT_APP_API_URL;
      await fetch(`${BASE_URL}/chat/title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          chat_id: chatId,
          title: renameValue.trim(),
        }),
      });
      await loadUserChats();
    } catch (e) {
      console.error(e);
    } finally {
      setRenamingChatId(null);
    }
  };

  const confirmDelete = (id, title, e) => {
    e?.stopPropagation();
    setDeleteChatId(id);
    setDeleteChatTitle(title);
    setActiveMenu(null);
  };

  const handleDeleteChat = async () => {
    if (!deleteChatId) return;
    try {
      const BASE_URL = process.env.REACT_APP_API_URL;
      await fetch(`${BASE_URL}/chat/${user.uid}/${deleteChatId}`, {
        method: "DELETE",
      });
      await loadUserChats();
      if (currentChatId === deleteChatId) {
        onChatSelect(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteChatId(null);
      setDeleteChatTitle("");
    }
  };

  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);
    onClose();
  };

  const toggleMenu = (chatId, e) => {
    e?.stopPropagation();
    setActiveMenu(activeMenu === chatId ? null : chatId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenu) {
        const clickedOutside = Object.values(menuRefs.current).every(ref => 
          ref && !ref.contains(e.target)
        );
        
        if (clickedOutside) {
          setActiveMenu(null);
        }
      }
      
      // Close delete modal when clicking outside
      if (deleteChatId && !e.target.closest('.mobile-delete-modal')) {
        setDeleteChatId(null);
        setDeleteChatTitle("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeMenu, deleteChatId]);

  // Group chats by date
  const groupedChats = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7 = new Date(today);
    last7.setDate(last7.getDate() - 7);
    
    const grouped = { today: [], yesterday: [], previous7Days: [], older: [] };
    
    chats.forEach((chat) => {
      const chatDate = new Date(chat.updated_at || chat.created_at);
      chatDate.setHours(0, 0, 0, 0);
      
      if (chatDate.getTime() === today.getTime()) {
        grouped.today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(chat);
      } else if (chatDate > last7) {
        grouped.previous7Days.push(chat);
      } else {
        grouped.older.push(chat);
      }
    });
    
    return grouped;
  })();

  const renderChatGroup = (chats, title) => {
    if (chats.length === 0) return null;
    
    return (
      <div className="mobile-chat-group">
        <div className="mobile-group-title">{title}</div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`mobile-chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            onClick={() => handleChatSelect(chat.id)}
          >
            <div className="mobile-chat-main">
              {renamingChatId === chat.id ? (
                <input
                  type="text"
                  className="mobile-rename-input"
                  value={renameValue}
                  autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(chat.id);
                    if (e.key === 'Escape') setRenamingChatId(null);
                  }}
                  onBlur={() => handleRenameSubmit(chat.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="mobile-chat-title">{chat.title}</span>
              )}
            </div>
            
            {renamingChatId !== chat.id && (
              <button
                className="mobile-chat-menu-btn"
                onClick={(e) => toggleMenu(chat.id, e)}
              >
                <MoreVertical size={16} />
              </button>
            )}
            
            {activeMenu === chat.id && (
              <div 
                ref={el => menuRefs.current[chat.id] = el}
                className="mobile-context-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="mobile-context-item"
                  onClick={(e) => startRename(chat.id, chat.title, e)}
                >
                  <Pencil size={16} />
                  Rename
                </button>
                <button
                  className="mobile-context-item delete"
                  onClick={(e) => confirmDelete(chat.id, chat.title, e)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`mobile-sidebar ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-sidebar-header">
          <h3>Recent Chats</h3>
          <button className="mobile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <button className="mobile-new-chat-btn" onClick={handleNewChat}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>
        
        <div className="mobile-chat-list">
          {loading ? (
            <div className="mobile-loading">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="mobile-no-chats">No recent chats</div>
          ) : (
            <>
              {renderChatGroup(groupedChats.today, "Today")}
              {renderChatGroup(groupedChats.yesterday, "Yesterday")}
              {renderChatGroup(groupedChats.previous7Days, "Previous 7 Days")}
              {renderChatGroup(groupedChats.older, "Older")}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteChatId && (
          <div 
            className="mobile-delete-modal-overlay"
            onClick={() => {
              setDeleteChatId(null);
              setDeleteChatTitle("");
            }}
          >
            <div 
              className="mobile-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Delete chat?</h4>
              <p>This will delete <strong>"{deleteChatTitle}"</strong>.</p>
              <p>This action cannot be undone.</p>
              <div className="mobile-delete-actions">
                <button 
                  className="mobile-cancel-btn"
                  onClick={() => {
                    setDeleteChatId(null);
                    setDeleteChatTitle("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="mobile-confirm-btn"
                  onClick={handleDeleteChat}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default MobileSidebar;