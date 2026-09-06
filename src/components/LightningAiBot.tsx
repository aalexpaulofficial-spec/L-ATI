/**
 * LIGHTNING AI BOT — Interactive Floating Companion & Assistant.
 *
 * Always visible on the landing page, featuring the official LIGHTNING ATI emblem
 * with an animated multi-color intelligence core border.
 */

import { useState, useRef, useEffect } from 'react';
import { DEFAULT_QUESTIONS, getBotResponse } from '../data/botKnowledge';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export function LightningAiBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened on desktop
      if (window.innerWidth > 640) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query || isThinking) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    // Subtle fluid processing pause to feel alive and intelligent
    setTimeout(() => {
      const botAnswer = getBotResponse(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 380);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating AI Bot Trigger ────────────────────────────────────────── */}
      <button
        type="button"
        className="lightning-bot-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle LIGHTNING AI Assistant"
        aria-expanded={isOpen}
        title="LIGHTNING AI — Intelligent Companion"
      >
        <div className="lightning-bot-trigger__ring" aria-hidden="true" />
        <div className="lightning-bot-trigger__core">
          <img
            src="/assets/brand/jc-lightning-ati-bw.png"
            alt="LIGHTNING ATI Emblem"
            className="lightning-bot-trigger__emblem"
          />
        </div>
        <span className="lightning-bot-trigger__badge" aria-hidden="true" />
      </button>

      {/* ── Assistant Panel ────────────────────────────────────────────────── */}
      <div
        className={`lightning-bot-panel ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="LIGHTNING AI Assistant"
      >
        {/* Header */}
        <header className="lightning-bot-header">
          <div className="lightning-bot-header__identity">
            <div className="lightning-bot-header__emblem-wrap" aria-hidden="true">
              <img
                src="/assets/brand/jc-lightning-ati-bw.png"
                alt=""
                className="lightning-bot-header__emblem"
              />
            </div>
            <div className="lightning-bot-header__title-group">
              <span className="lightning-bot-header__title">
                LIGHTNING AI
                <span className="lightning-bot-header__status">
                  <span className="lightning-bot-header__status-dot" />
                  Active
                </span>
              </span>
              <span className="lightning-bot-header__tag">Artificial Thinking Intelligence</span>
            </div>
          </div>

          <button
            type="button"
            className="lightning-bot-header__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close LIGHTNING AI panel"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Pinned Welcome Card — permanently visible, never cut off when questions are asked */}
        <div className="lightning-bot-intro-pinned">
          <div className="lightning-bot-welcome">
            <p className="lightning-bot-welcome__text">
              I'm <strong>LIGHTNING AI</strong>. Ask me anything about LIGHTNING ATI, how it works, or how to use the website.
            </p>
          </div>
        </div>

        {/* Body / Messages */}
        <div className="lightning-bot-body">

          {/* 3 Default Suggested Questions */}
          <div className="lightning-bot-suggestions">
            <span className="lightning-bot-suggestions__label">Suggested Questions</span>
            {DEFAULT_QUESTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="lightning-bot-chip"
                onClick={() => handleSend(item.question)}
                disabled={isThinking}
              >
                <span>{item.question}</span>
                <span className="lightning-bot-chip__arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          {/* Conversation history */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`lightning-bot-msg lightning-bot-msg--${msg.sender}`}
            >
              <div className="lightning-bot-msg__bubble">{msg.text}</div>
              <span className="lightning-bot-msg__time">{msg.time}</span>
            </div>
          ))}

          {/* Thinking state */}
          {isThinking && (
            <div className="lightning-bot-thinking" aria-label="LIGHTNING AI is thinking">
              <span className="lightning-bot-thinking__dot" />
              <span className="lightning-bot-thinking__dot" />
              <span className="lightning-bot-thinking__dot" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <footer className="lightning-bot-footer">
          <form
            className="lightning-bot-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="lightning-bot-input"
              placeholder="Ask LIGHTNING AI…"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Ask LIGHTNING AI a question"
            />
            <button
              type="submit"
              className="lightning-bot-send"
              disabled={!inputQuery.trim() || isThinking}
              aria-label="Send question"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <div className="lightning-bot-foot-meta">
            LIGHTNING ATI · Powered by LIGHTNING-1
          </div>
        </footer>
      </div>
    </>
  );
}
