// MobileChat.jsx - Clean version without tiles
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MobileChatInput from "./MobileChatInput";
import "./MobileChat.css";

const MobileChat = ({ currentChatId = null, onChatCreated = () => {} }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(currentChatId);
  const messagesEndRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // Clean markdown
  const cleanMarkdown = (text) => {
    if (!text) return text;
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/^#+\s*(.*?)$/gm, "$1")
      .replace(/^---+\s*$/gm, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n\s*\n\s*\n/g, "\n\n");
  };

  // Format text
  const formatPlainText = (content) => {
    const cleaned = cleanMarkdown(content);
    const lines = cleaned.split("\n");
    const elements = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<br key={`br-${i}`} />);
        return;
      }

      const numbered = trimmed.match(/^(\d+)\.\s+(.*)/);
      const bullet = trimmed.match(/^[•\-]\s+(.*)/);

      if (["📝", "👨‍🍳", "💡"].some((icon) => trimmed.includes(icon))) {
        elements.push(<div key={i} className="section-heading">{trimmed}</div>);
      } else if (numbered) {
        elements.push(
          <div key={i} className="numbered-item">
            <span className="number">{numbered[1]}</span>
            <span className="text">{numbered[2]}</span>
          </div>
        );
      } else if (bullet) {
        elements.push(
          <div key={i} className="bullet-item">
            <span className="bullet">•</span>
            <span className="text">{bullet[1]}</span>
          </div>
        );
      } else {
        elements.push(<div key={i} className="text-line">{trimmed}</div>);
      }
    });

    return elements;
  };

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
      setActiveChatId(currentChatId);
    } else {
      setMessages([]);
      setActiveChatId(null);
    }
  }, [currentChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatMessages = async (chatId) => {
    if (!chatId || !user) {
      setMessages([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/chat/messages/${user.uid}/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const formatted = data.messages?.map((m) => ({ role: m.role, content: m.content })) || [];
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setMessages([]);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading || !user) return;

    const userMessage = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      let chatId = activeChatId;

      // Create chat if needed
      if (!chatId) {
        const newChatResponse = await fetch(`${BASE_URL}/chat/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.uid }),
        });

        if (newChatResponse.ok) {
          const newChatData = await newChatResponse.json();
          chatId = newChatData.chat_id;
          setActiveChatId(chatId);
          onChatCreated(chatId);
        } else {
          chatId = `local-${Date.now()}`;
        }
      }

      // Send message to backend
      const messageResponse = await fetch(`${BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: user.uid, 
          chat_id: chatId, 
          message: message 
        }),
      });

      if (messageResponse.ok) {
        const messageData = await messageResponse.json();
        setMessages([...updatedMessages, { 
          role: "assistant", 
          content: messageData.reply 
        }]);
        
        // Refresh sidebar
        if (window.sidebarRefresh) {
          window.sidebarRefresh();
        }
      } else {
        throw new Error(`HTTP ${messageResponse.status}`);
      }
    } catch (error) {
      console.error("Send error:", error);
      setMessages([...updatedMessages, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-chat-container">
      <div className="mobile-chat-messages">
        {messages.length === 0 ? (
          <div className="mobile-welcome">
            <div className="mobile-welcome-header">
              <div className="mobile-chef-avatar">👨‍🍳</div>
              <h2>Hello! I'm Recipe Genie</h2>
              <p className="mobile-welcome-subtitle">
                Your AI cooking assistant ready to help with recipes, substitutions, and culinary guidance
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`mobile-message ${msg.role}`}>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <div className="mobile-plain-text-content">
                    {formatPlainText(msg.content)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {isLoading && (
          <div className="mobile-typing-indicator">
            <div className="mobile-typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Box - Always visible */}
      <MobileChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default MobileChat;