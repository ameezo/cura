import { useState, useRef, useEffect, useCallback } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import Loader from '../../../components/ui/Loader';
import { getMessages, sendChatMessage, clearConversation } from '../../../api/aiChatApi';
import './AIChatPage.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(
    () => sessionStorage.getItem('cura_ai_disclaimer_dismissed') !== 'true'
  );
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    sessionStorage.setItem('cura_ai_disclaimer_dismissed', 'true');
  };

  // ── Load message history on mount ─────────────────────────────────────
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ── Send message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Optimistically add the user message
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setSending(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const data = await sendChatMessage(text);
      // Replace temp message with the real saved ones
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, data.user_message, data.assistant_message];
      });
    } catch (err) {
      setError(err.message || 'Failed to send message');
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  // ── Clear conversation ────────────────────────────────────────────────
  const handleClear = async () => {
    if (!window.confirm('Clear all chat history? This cannot be undone.')) return;

    setClearing(true);
    try {
      await clearConversation();
      setMessages([]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to clear conversation');
    } finally {
      setClearing(false);
    }
  };

  // ── Enter to send ─────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Auto-resize textarea ──────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  // ── Format AI response (basic markdown-like) ──────────────────────────
  const formatContent = (content) => {
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br/>');
    // Convert bullet points
    formatted = formatted.replace(/^[-•]\s+(.+)/gm, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    return formatted;
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <span className="material-symbols-rounded">smart_toy</span>
          </div>
          <div>
            <h2>AI Health Assistant</h2>
            <span className="chat-status">
              <span className="chat-status-dot" />
              Powered by Gemini
            </span>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon="delete_sweep"
            onClick={handleClear}
            loading={clearing}
            disabled={sending}
            className="chat-clear-btn"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="chat-disclaimer">
          <span className="material-symbols-rounded chat-disclaimer-icon">info</span>
          <span className="chat-disclaimer-text">
            This AI provides <strong>general health information only</strong>. It does not replace professional medical advice, diagnosis, or treatment.
          </span>
          <button className="chat-disclaimer-close" onClick={dismissDisclaimer} aria-label="Dismiss">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
      )}

      {/* Chat Container */}
      <Card className="chat-container" padding="none">
        <div className="chat-messages">
          {/* Loading state */}
          {loading && (
            <div className="chat-loading">
              <Loader text="Loading conversation..." />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <Alert variant="danger" className="chat-error">
              {error}
            </Alert>
          )}

          {/* Empty state */}
          {!loading && messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <span className="material-symbols-rounded">forum</span>
              </div>
              <h3>Welcome to Cura AI Assistant</h3>
              <p>Ask me anything about general health information.</p>
              <div className="chat-suggestions">
                <button className="chat-suggestion" onClick={() => setInput('What are some tips for better sleep?')}>
                  <span className="material-symbols-rounded">bedtime</span>
                  Tips for better sleep
                </button>
                <button className="chat-suggestion" onClick={() => setInput('How can I manage daily stress?')}>
                  <span className="material-symbols-rounded">self_improvement</span>
                  Managing daily stress
                </button>
                <button className="chat-suggestion" onClick={() => setInput('What should a balanced diet include?')}>
                  <span className="material-symbols-rounded">restaurant</span>
                  Balanced diet basics
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-msg ${msg.sender === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="chat-msg-avatar">
                  <span className="material-symbols-rounded">smart_toy</span>
                </div>
              )}
              <div className="chat-msg-bubble">
                {msg.sender === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                ) : (
                  <p>{msg.content}</p>
                )}
                <span className="chat-msg-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="chat-msg chat-msg-ai">
              <div className="chat-msg-avatar">
                <span className="material-symbols-rounded">smart_toy</span>
              </div>
              <div className="chat-msg-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Type your health question..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending || loading}
            />
            <Button
              variant="primary"
              icon="send"
              onClick={handleSend}
              disabled={!input.trim() || sending || loading}
              className="chat-send-btn"
            />
          </div>
          <p className="chat-input-hint">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
