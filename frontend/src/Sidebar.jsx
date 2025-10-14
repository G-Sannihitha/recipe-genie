import React, { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import { useAuth } from "./context/AuthContext";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const Sidebar = ({ currentChatId, onChatSelect, onNewChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [deleteChatTitle, setDeleteChatTitle] = useState("");
  const menuRef = useRef(null);

  // --- Global tooltip state (collapsed only) ---
  const [tip, setTip] = useState({ show: false, text: "", top: 0, left: 0 });

  const showGlobalTip = (e, text) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({
      show: true,
      text,
      top: r.top + r.height / 2, // vertical center
      left: r.right + 8, // right beside the toggle
    });
  };
  const hideGlobalTip = () => setTip((t) => ({ ...t, show: false }));

  // --- Load Chats ---
  const loadUserChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/chat/chats/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      } else setChats([]);
    } catch (e) {
      console.error("Error loading chats:", e);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadUserChats();
  }, [user]);

  useEffect(() => {
    window.sidebarRefresh = loadUserChats;
    return () => (window.sidebarRefresh = null);
  }, []);

  // --- Collapse toggle ---
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
    if (next) document.body.classList.add("sidebar-collapsed");
    else document.body.classList.remove("sidebar-collapsed");
    // hide tooltip when toggling
    hideGlobalTip();
  };

  useEffect(() => {
    if (collapsed) document.body.classList.add("sidebar-collapsed");
    else document.body.classList.remove("sidebar-collapsed");
  }, [collapsed]);

  // --- CRUD ---
  const handleNewChat = async () => {
    try {
      const res = await fetch("http://localhost:8000/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadUserChats();
        onNewChat?.(data.chat_id);
        onChatSelect?.(data.chat_id);
      }
    } catch {
      const id = `local-${Date.now()}`;
      const n = {
        id,
        title: "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setChats((p) => [n, ...p]);
      onNewChat?.(id);
      onChatSelect?.(id);
    }
  };

  const startRename = (chatId, title) => {
    setRenamingChatId(chatId);
    setRenameValue(title);
    setActiveMenu(null);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!renameValue.trim()) return setRenamingChatId(null);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, title: renameValue.trim() } : c
      )
    );
    try {
      await fetch("http://localhost:8000/chat/title", {
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

  const confirmDelete = (id, title) => {
    setDeleteChatId(id);
    setDeleteChatTitle(title);
    setActiveMenu(null);
  };

  const handleDeleteChat = async () => {
    if (!deleteChatId) return;
    try {
      await fetch(`http://localhost:8000/chat/${user.uid}/${deleteChatId}`, {
        method: "DELETE",
      });
      await loadUserChats();
      if (currentChatId === deleteChatId) onChatSelect?.(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteChatId(null);
    }
  };

  const grouped = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7 = new Date(today);
    last7.setDate(last7.getDate() - 7);
    const g = { today: [], yesterday: [], previous7Days: [], older: [] };
    chats.forEach((c) => {
      const d = new Date(c.updated_at || c.created_at);
      d.setHours(0, 0, 0, 0);
      if (+d === +today) g.today.push(c);
      else if (+d === +yesterday) g.yesterday.push(c);
      else if (d > last7) g.previous7Days.push(c);
      else g.older.push(c);
    });
    return g;
  })();

  const renderGroup = (items, title) =>
    items.length ? (
      <div className="date-group">
        <div className="date-group-header">{title}</div>
        {items.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${
              currentChatId === chat.id ? "active" : ""
            } ${renamingChatId === chat.id ? "renaming" : ""}`}
            onClick={() => onChatSelect?.(chat.id)}
          >
            <div className="chat-main">
              {renamingChatId === chat.id ? (
                <input
                  type="text"
                  className="rename-input"
                  value={renameValue}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit(chat.id);
                    if (e.key === "Escape") setRenamingChatId(null);
                  }}
                  onBlur={() => handleRenameSubmit(chat.id)}
                />
              ) : (
                <div className="chat-title" title={chat.title}>
                  {chat.title}
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                className="chat-menu-trigger"
                title="More options"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu((prev) => (prev === chat.id ? null : chat.id));
                }}
              >
                <MoreVertical size={16} />
              </button>
            )}
            {activeMenu === chat.id && !collapsed && (
              <div className="context-menu modern" ref={menuRef}>
                <button
                  className="context-item"
                  onClick={() => startRename(chat.id, chat.title)}
                >
                  <Pencil size={15} className="menu-icon" /> Rename
                </button>
                <button
                  className="context-item delete"
                  onClick={() => confirmDelete(chat.id, chat.title)}
                >
                  <Trash2 size={15} className="menu-icon" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div
            className="sidebar-logo-wrapper"
            onClick={() => {
              if (collapsed) toggleCollapsed();
            }}
          >
            {/* Chef icon always visible */}
            <div className="sidebar-logo" title="Recipe Genie">
              👨‍🍳
            </div>

            {/* Toggle shown only when expanded (uses CSS tooltip) */}
            {!collapsed && (
              <button
                className="sidebar-toggle tooltip"
                onClick={toggleCollapsed}
                data-tooltip="Close sidebar"
              >
                <PanelLeftClose size={22} />
              </button>
            )}

            {/* Collapsed toggle (uses JS global tooltip to stay above header) */}
            {collapsed && (
              <button
                className="sidebar-toggle tooltip collapsed-toggle"
                onClick={toggleCollapsed}
                onMouseEnter={(e) => showGlobalTip(e, "Open sidebar")}
                onMouseLeave={hideGlobalTip}
              >
                <PanelLeftOpen size={22} />
              </button>
            )}
          </div>
        </div>

        {/* New Chat visible even when collapsed */}
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} />
          <span>New chat</span>
        </button>

        {!collapsed && (
          <div className="chat-history">
            {loading ? (
              <div className="loading-chats">Loading chats…</div>
            ) : chats.length === 0 ? (
              <div className="empty-chats">No chats yet</div>
            ) : (
              <div className="chat-list">
                {renderGroup(grouped.today, "Today")}
                {renderGroup(grouped.yesterday, "Yesterday")}
                {renderGroup(grouped.previous7Days, "Previous 7 days")}
                {renderGroup(grouped.older, "Older")}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Global tooltip for collapsed state */}
      {tip.show && (
        <div
          className="global-tooltip"
          style={{ top: `${tip.top}px`, left: `${tip.left}px` }}
        >
          {tip.text}
        </div>
      )}

      {/* Delete modal */}
      {deleteChatId && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete chat?</h3>
            <p>
              This will delete <strong>{deleteChatTitle}</strong>.
            </p>
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteChatId(null)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleDeleteChat}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
