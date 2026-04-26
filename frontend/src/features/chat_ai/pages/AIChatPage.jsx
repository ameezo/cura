import { useState, useRef, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { mockChatMessages } from '../../../utils/mockData';
import './AIChatPage.css';

const AI_RESPONSES = [
  "That's a great question! Based on general wellness guidelines, I'd recommend speaking with your doctor for personalized advice. In the meantime, staying hydrated and maintaining regular sleep schedules can help significantly.",
  "I understand your concern. While I can provide general health information, it's important to consult with a healthcare professional for specific medical advice. Would you like me to help you book an appointment?",
  "Thank you for sharing that. Regular exercise, balanced nutrition, and adequate sleep are foundational to good health. Your doctor can provide more specific recommendations based on your health profile.",
  "That's a common concern many patients have. I'd suggest tracking your symptoms and discussing them at your next appointment. Would you like me to set a reminder for you?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: `msg_${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));

    const aiResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    const aiMsg = { id: `msg_${Date.now() + 1}`, role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, aiMsg]);
    setTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <span className="material-symbols-rounded">smart_toy</span>
          </div>
          <div>
            <h2>AI Health Assistant</h2>
            <span className="chat-status">
              <span className="chat-status-dot" />
              Online
            </span>
          </div>
        </div>
      </div>

      <Alert variant="warning" className="chat-disclaimer">
        This AI assistant provides general health information only. It does not replace professional medical advice, diagnosis, or treatment.
      </Alert>

      <Card className="chat-container" padding="none">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}>
              {msg.role === 'assistant' && (
                <div className="chat-msg-avatar">
                  <span className="material-symbols-rounded">smart_toy</span>
                </div>
              )}
              <div className="chat-msg-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {typing && (
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

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Type your health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <Button variant="primary" icon="send" onClick={sendMessage} disabled={!input.trim() || typing} className="chat-send-btn" />
          </div>
        </div>
      </Card>
    </div>
  );
}
