// C:\AI_CHATBOT\recipe-genie\frontend\src\Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import "./Chat.css";

const Chat = ({ currentChatId = null, onChatCreated = () => {}, isMobile = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(currentChatId);
  const messagesEndRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const cleanMarkdown = (text) => {
    if (!text) return text;
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#+\s*(.*?)$/gm, '$1')
      .replace(/^---+\s*$/gm, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  };

  const formatPlainText = (content) => {
    const cleanedContent = cleanMarkdown(content);
    const lines = cleanedContent.split('\n');
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') {
        elements.push(<br key={`br-${i}`} />);
        continue;
      }

      if (line.includes('📝') || line.includes('👨‍🍳') || line.includes('💡')) {
        elements.push(<div key={i} className="section-heading">{line}</div>);
        continue;
      }

      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        elements.push(
          <div key={i} className="numbered-item">
            <span className="number">{numberedMatch[1]}</span>
            <span className="text">{numberedMatch[2]}</span>
          </div>
        );
        continue;
      }

      const bulletMatch = line.match(/^[•\-]\s+(.*)/);
      if (bulletMatch) {
        elements.push(
          <div key={i} className="bullet-item">
            <span className="bullet">•</span>
            <span className="text">{bulletMatch[1]}</span>
          </div>
        );
        continue;
      }

      if (line.includes('For the') || line.includes('For filling') || line.includes('For assembly')) {
        elements.push(
          <div key={i} className="bullet-item">
            <span className="text" style={{ fontWeight: '600' }}>{line}</span>
          </div>
        );
        continue;
      }

      elements.push(<div key={i} className="text-line">{line}</div>);
    }

    return elements;
  };

  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
      setActiveChatId(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatMessages = async (chatId) => {
    if (!chatId || !user) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/messages/${user.uid}/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages?.map(msg => ({
          role: msg.role,
          content: msg.content
        })) || [];
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch(`${BASE_URL}/chat/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.chat_id;
      } else {
        return `local-${Date.now()}`;
      }
    } catch {
      return `local-${Date.now()}`;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = await createNewChat();
        setActiveChatId(chatId);
        onChatCreated?.(chatId);
      }

      const res = await fetch(`${BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid, chat_id: chatId, message: input }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
        window.sidebarRefresh?.();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }

    } catch (error) {
      console.error("Send error:", error);
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    setTimeout(() => {
      document.querySelector('.chat-input textarea')?.focus();
    }, 100);
  };

  return (
    <div className={`chat-container ${isMobile ? 'mobile' : ''}`}>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-header">
              <div className="chef-avatar">👨‍🍳</div>
              <h2>Hello! I'm Recipe Genie</h2>
              <p className="welcome-subtitle">Your AI cooking assistant ready to help with recipes, substitutions, and culinary guidance</p>
            </div>
            <div className="suggestions-grid">
              {[
                ["🥪 Quick Breakfast", "How to make egg sandwich?", "Get step-by-step instructions for perfect egg sandwiches"],
                ["🍅 Indian Condiments", "Tomato chutney recipe", "Learn authentic tomato chutney with pro tips"],
                ["🍗 Ingredient Helper", "What can I make with chicken and potatoes?", "Discover recipes based on what you have"],
                ["🔄 Smart Substitutions", "Substitute for eggs in baking", "Find perfect ingredient replacements"],
                ["📅 Meal Planning", "Plan a vegetarian meal for this week", "Get customized weekly meal plans"],
                ["👨‍🍳 Cooking Basics", "Explain different cooking techniques", "Master fundamental cooking methods"]
              ].map(([title, prompt, desc], i) => (
                <div key={i} className="suggestion-card" onClick={() => handleSuggestionClick(prompt)}>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'user' ? msg.content : (
              <div className="plain-text-content">{formatPlainText(msg.content)}</div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots"><span></span><span></span><span></span></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <div className="chat-input">
            <textarea
              placeholder="Ask a recipe question..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              className="send-btn"
              disabled={isLoading || !input.trim()}
              title="Send"
            >
              {isLoading ? <div className="loading-spinner"></div> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="chat-footer">
          <p>Recipe Genie can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
