// frontend/src/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import "./Chat.css";

const Chat = ({ 
  currentChatId = null, 
  onChatCreated = () => {} 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(currentChatId);
  const messagesEndRef = useRef(null);

  // Function to aggressively clean markdown
  const cleanMarkdown = (text) => {
    if (!text) return text;
    
    let cleaned = text
      // Remove **bold**
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove *italic*
      .replace(/\*(.*?)\*/g, '$1')
      // Remove _italic_
      .replace(/_(.*?)_/g, '$1')
      // Remove `code`
      .replace(/`(.*?)`/g, '$1')
      // Remove # headers
      .replace(/^#+\s*(.*?)$/gm, '$1')
      // Remove --- horizontal rules
      .replace(/^---+\s*$/gm, '')
      // Remove markdown links
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Normalize multiple line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return cleaned;
  };

  // Format plain text with proper line breaks and ChatGPT-like spacing
  const formatPlainText = (content) => {
    const cleanedContent = cleanMarkdown(content);
    
    const lines = cleanedContent.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        // Add spacing between paragraphs
        elements.push(<br key={`br-${i}`} />);
        continue;
      }
      
      // Check for emoji section headings
      if (line.includes('📝') || line.includes('👨‍🍳') || line.includes('💡')) {
        elements.push(
          <div key={i} className="section-heading">
            {line}
          </div>
        );
        continue;
      }
      
      // Check for numbered list items (1., 2., etc.)
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
      
      // Check for bullet points (• or - )
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
      
      // Check for sub-headings in ingredients
      if (line.includes('For the') || line.includes('For filling') || line.includes('For assembly')) {
        elements.push(
          <div key={i} className="bullet-item">
            <span className="bullet"></span>
            <span className="text" style={{fontWeight: '600'}}>{line}</span>
          </div>
        );
        continue;
      }
      
      // Regular text
      elements.push(
        <div key={i} className="text-line">
          {line}
        </div>
      );
    }
    
    return elements;
  };

  // Load messages when chat changes
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
      const response = await fetch(`http://localhost:8000/chat/messages/${user.uid}/${chatId}`);
      
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages?.map(msg => ({
          role: msg.role,
          content: msg.content
        })) || [];
        setMessages(formattedMessages);
      } else {
        console.warn("No previous messages found");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
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
      
      // If no active chat, create one via backend
      if (!chatId) {
        try {
          const newChatResponse = await fetch("http://localhost:8000/chat/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.uid }),
          });
          
          if (newChatResponse.ok) {
            const newChatData = await newChatResponse.json();
            chatId = newChatData.chat_id;
          } else {
            chatId = `local-${Date.now()}`;
          }
        } catch (error) {
          chatId = `local-${Date.now()}`;
        }
        
        setActiveChatId(chatId);
        if (onChatCreated) {
          onChatCreated(chatId);
        }
      }

      // Send message to backend
      const response = await fetch("http://localhost:8000/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          chat_id: chatId,
          message: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setMessages([...updatedMessages, { 
          role: "assistant", 
          content: data.reply 
        }]);
        
        // Trigger sidebar refresh after message is sent
        if (window.sidebarRefresh) {
          window.sidebarRefresh();
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback response
      const fallbackResponse = "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages([...updatedMessages, { 
        role: "assistant", 
        content: fallbackResponse 
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

  // Suggestion card click handler
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => {
      const textarea = document.querySelector('.chat-input textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-header">
              <div className="chef-avatar">👨‍🍳</div>
              <h2>Hello! I'm Recipe Genie</h2>
              <p className="welcome-subtitle">
                Your AI cooking assistant ready to help with recipes, substitutions, and culinary guidance
              </p>
            </div>
            
            <div className="suggestions-grid">
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("How to make egg sandwich?")}
              >
                <h4>🥪 Quick Breakfast</h4>
                <p>Get step-by-step instructions for perfect egg sandwiches</p>
              </div>
              
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("Tomato chutney recipe")}
              >
                <h4>🍅 Indian Condiments</h4>
                <p>Learn authentic tomato chutney with pro tips</p>
              </div>
              
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("What can I make with chicken and potatoes?")}
              >
                <h4>🍗 Ingredient Helper</h4>
                <p>Discover recipes based on what you have</p>
              </div>
              
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("Substitute for eggs in baking")}
              >
                <h4>🔄 Smart Substitutions</h4>
                <p>Find perfect ingredient replacements</p>
              </div>
              
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("Plan a vegetarian meal for this week")}
              >
                <h4>📅 Meal Planning</h4>
                <p>Get customized weekly meal plans</p>
              </div>
              
              <div 
                className="suggestion-card"
                onClick={() => handleSuggestionClick("Explain different cooking techniques")}
              >
                <h4>👨‍🍳 Cooking Basics</h4>
                <p>Master fundamental cooking methods</p>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role}`}
          >
            {msg.role === 'user' ? (
              msg.content
            ) : (
              <div className="plain-text-content">
                {formatPlainText(msg.content)}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {/* <span className="typing-text">Recipe Genie is cooking up your answer...</span> */}
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
              title="Send message"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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