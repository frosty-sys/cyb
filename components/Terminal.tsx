import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal as TerminalIcon, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import { streamCyberDoomResponse } from '../services/geminiService';
import GlitchText from './GlitchText';
import ReactMarkdown from 'react-markdown';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'system',
      content: 'INITIALIZING CYBERDOOM V1.0.4... \n> NEURAL LINK ESTABLISHED. \n> WAITING FOR OPERATOR INPUT.',
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsgPlaceholder: Message = {
      id: modelMsgId,
      role: 'model',
      content: '', // Start empty for streaming
      timestamp: Date.now(),
      isStreaming: true
    };

    setMessages(prev => [...prev, modelMsgPlaceholder]);

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      let accumulatedText = "";

      await streamCyberDoomResponse(history, userMsg.content, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(m => 
            m.id === modelMsgId 
              ? { ...m, content: accumulatedText }
              : m
          )
        );
        scrollToBottom();
      });

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `ERROR: CONNECTION SEVERED. \n${error instanceof Error ? error.message : 'UNKNOWN_EXCEPTION'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
      setMessages(prev => 
        prev.map(m => 
          m.id === modelMsgId 
            ? { ...m, isStreaming: false }
            : m
        )
      );
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-green-900/20 border-b border-green-800 p-2 flex items-center justify-between backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 text-green-500">
          <TerminalIcon size={16} />
          <span className="font-bold tracking-wider text-sm">/bin/bash/cyberdoom_agent_v1</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-700">PID: 49204</span>
          <span className="text-green-700">SECURE_SHELL</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10" onClick={() => inputRef.current?.focus()}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            <div className={`flex items-center gap-2 text-[10px] mb-1 opacity-70 ${msg.role === 'user' ? 'text-blue-400' : (msg.role === 'system' ? 'text-red-500' : 'text-green-600')}`}>
              <span>[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
              <span>{msg.role === 'user' ? 'USER@NODE_1' : (msg.role === 'system' ? 'SYS_ROOT' : 'UNIT-CD1')}</span>
            </div>
            
            <div className={`max-w-[85%] font-mono text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'text-blue-300 border-r-2 border-blue-500 pr-3' 
                : (msg.role === 'system' ? 'text-red-500 font-bold' : 'text-green-400 border-l-2 border-green-500 pl-3')
            }`}>
              {msg.role === 'model' ? (
                 <>
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                   {msg.isStreaming && <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle" />}
                 </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/90 border-t border-green-900/50 z-20">
        <div className="flex items-center gap-2 bg-green-900/10 border border-green-800/50 p-2 rounded-sm focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/50 transition-all">
          <span className="text-green-600 animate-pulse">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isTyping ? "PROCESSING INCOMING TRANSMISSION..." : "ENTER COMMAND..."}
            disabled={isTyping}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono placeholder-green-800"
            autoComplete="off"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="text-green-700 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-green-800">
           <span>STATUS: {isTyping ? 'TRANSMITTING' : 'READY'}</span>
           <span>ENCRYPTION: AES-256-GCM</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;