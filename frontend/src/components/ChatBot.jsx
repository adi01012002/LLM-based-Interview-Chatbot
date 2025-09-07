

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Play } from 'lucide-react';
import styles from './ChatBot.module.css';  // ✅ CSS module import
import useVoice from '../hooks/useVoice';

const ChatBot = ({ onSendMessage, messages, loading, disabled }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { isListening, isSpeaking, transcript, error, startListening, stopListening, speak, stopSpeaking, clearTranscript } = useVoice();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
    clearTranscript();
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePlayLastBot = () => {
    const lastBot = [...messages].reverse().find(m => m.role === 'bot');
    if (lastBot) speak(lastBot.content);
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatbotMessages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageWrapper} ${styles[msg.role]}`}>
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.messageWrapper} ${styles.bot}`}>
            <div className={`${styles.messageContent} ${styles.typingIndicator}`}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatbotControls}>
        <button 
          onClick={handleMicToggle} 
          disabled={disabled} 
          title={isListening ? "Stop recording" : "Start recording"} 
          className={styles.micBtn}
        >
          {isListening ? <MicOff /> : <Mic />}
        </button>

        <button onClick={handlePlayLastBot} title="Read last bot message" className={styles.playBtn}>
          <Play />
        </button>

        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={disabled ? "Interview finished" : "Type your answer..."}
            disabled={disabled}
          />
          <button onClick={handleSend} disabled={loading || disabled || !input.trim()} className={styles.sendBtn}>
            <Send size={20} />
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default ChatBot;

