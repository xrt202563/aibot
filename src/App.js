import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessageStream } from './difyApi';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送消息
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 添加一个空的 AI 消息占位
    const aiMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const finalConvId = await sendChatMessageStream(
        text,
        conversationId,
        (chunk) => {
          setMessages(prev => {
            const updated = [...prev];
            if (updated[aiMsgIndex]) {
              updated[aiMsgIndex] = {
                ...updated[aiMsgIndex],
                content: updated[aiMsgIndex].content + chunk,
              };
            }
            return updated;
          });
        }
      );
      setConversationId(finalConvId);
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        if (updated[aiMsgIndex]) {
          updated[aiMsgIndex] = {
            ...updated[aiMsgIndex],
            content: `❌ 出错了: ${err.message}`,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // 键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessages([]);
    setConversationId('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 Dify AI 聊天机器人</h1>
        <button className="clear-btn" onClick={handleClear} disabled={loading}>
          清空对话
        </button>
      </header>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>开始对话</h2>
            <p>输入你的问题，AI 助手将为你解答</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}
              >
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-bubble">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content || (loading && idx === messages.length - 1 ? '思考中...' : '')}</ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <textarea
          className="input-box"
          placeholder="输入你的消息... (Shift+Enter 换行，Enter 发送)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}

export default App;
