import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2, Sparkles, Globe, ExternalLink, Zap } from 'lucide-react';
import { Message, ModelType, GroundingSource } from '../../types';
import { streamChatResponse } from '../../services/geminiService';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatViewProps {
  model: ModelType;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const ChatView: React.FC<ChatViewProps> = ({ model }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: `### Neural System Online\nInterface: **Nexus Quantum v3**\nModel Core: **${model}**\n\nI am synchronized with global data streams. Awaiting your first command.`,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsgPlaceholder: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      sources: []
    };

    setMessages((prev) => [...prev, modelMsgPlaceholder]);

    try {
      const generator = streamChatResponse(messages, userMsg.content, model);
      let fullContent = '';
      let allSources: GroundingSource[] = [];

      for await (const chunk of generator) {
        if (chunk.text) fullContent += chunk.text;
        if (chunk.sources) {
          chunk.sources.forEach(newSrc => {
            if (!allSources.find(s => s.uri === newSrc.uri)) {
              allSources.push(newSrc);
            }
          });
        }
        
        setMessages((prev) => 
          prev.map((m) => m.id === modelMsgId ? { ...m, content: fullContent, sources: allSources } : m)
        );
      }
      
      setMessages((prev) => 
        prev.map((m) => m.id === modelMsgId ? { ...m, isStreaming: false } : m)
      );
    } catch (error) {
      setMessages((prev) => 
        prev.map((m) => 
          m.id === modelMsgId 
            ? { ...m, content: `### Sync Interrupted\nThe quantum link has been severed. \n\n**System Logs:** \`${String(error)}\``, error: true, isStreaming: false } 
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-16 lg:pb-0">
      {/* Header */}
      <header className="flex-none px-6 lg:px-10 py-4 lg:py-5 bg-slate-950/20 glass border-b border-white/5 flex justify-between items-center z-20">
        <div className="flex items-center gap-4 lg:gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-slate-900/80 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <h2 className="text-sm lg:text-lg font-black text-white tracking-[0.1em]">NEURAL NEXUS</h2>
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="flex items-center gap-1 text-[8px] lg:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
              <span className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[80px] lg:max-w-none">Grounding Ready</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 lg:p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl lg:rounded-2xl transition-all duration-300"
        >
          <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 lg:py-10 space-y-8 lg:space-y-12 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12 lg:space-y-16">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className={`flex gap-3 lg:gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1.5 lg:gap-3">
                  <div
                    className={`relative w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                      msg.role === 'user'
                        ? 'bg-slate-800 border border-white/10 text-slate-300'
                        : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4 lg:w-6 lg:h-6" /> : <Bot className="w-4 h-4 lg:w-6 lg:h-6" />}
                  </div>
                </div>

                <div className={`flex-1 min-w-0 flex flex-col gap-3 lg:gap-5 ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`rounded-2xl lg:rounded-[2.5rem] p-5 lg:p-10 relative overflow-hidden transition-all duration-500 ${
                      msg.role === 'user'
                        ? 'bg-blue-600/10 border border-blue-500/20 text-slate-100 rounded-tr-none'
                        : 'bg-slate-900/40 glass border border-white/10 text-slate-100 rounded-tl-none glass-card'
                    }`}
                  >
                    <div className="relative z-10 text-sm lg:text-base">
                      {msg.content ? (
                        <div className={msg.isStreaming ? 'streaming-text' : ''}>
                          <MarkdownRenderer content={msg.content} />
                          {msg.isStreaming && <span className="quantum-cursor" />}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 py-2">
                          <div className="flex items-center gap-3 lg:gap-6">
                             <div className="relative w-8 h-8 flex items-center justify-center">
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="absolute inset-0 bg-blue-500/10 rounded-full blur-md"
                                />
                                <div className="google-loader-orbit relative scale-75 lg:scale-100">
                                  <GoogleIcon />
                                </div>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-xs lg:text-sm font-bold text-white tracking-wide">Searching Google Knowledge</span>
                               <span className="text-[8px] lg:text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] animate-pulse mt-0.5 lg:mt-1">Grounding Neural Pathways...</span>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-2xl"
                    >
                      <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4 px-2 lg:px-4">
                        <Globe className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-400" />
                        <span className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Knowledge Fragments</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 px-1 lg:px-2">
                        {msg.sources.map((src, i) => (
                          <motion.a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 lg:px-5 py-2 lg:py-3 bg-slate-900/40 glass border border-white/5 hover:border-blue-500/40 rounded-xl lg:rounded-2xl group"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                            <span className="text-[10px] lg:text-[11px] font-bold text-slate-400 group-hover:text-white truncate">{src.title}</span>
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-10" />
        </div>
      </div>

      {/* Input */}
      <div className="flex-none p-4 lg:p-10 bg-transparent relative z-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={false}
            animate={{ scale: isStreaming ? 0.98 : 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl lg:rounded-[3rem] blur-xl opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            
            <div className="relative flex flex-col bg-slate-950/80 glass border border-white/10 rounded-2xl lg:rounded-[2.5rem] overflow-hidden focus-within:border-blue-500/50 transition-all duration-500">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Synchronize command..."
                className="w-full bg-transparent border-0 p-4 lg:p-8 pr-12 lg:pr-24 text-slate-100 placeholder-slate-700 focus:ring-0 resize-none min-h-[60px] lg:min-h-[120px] max-h-[250px] lg:max-h-[400px] text-base lg:text-xl font-medium leading-relaxed"
                rows={1}
                disabled={isStreaming}
              />
              
              <div className="flex items-center justify-between px-4 lg:px-10 pb-4 lg:pb-8">
                <div className="hidden sm:flex gap-3 lg:gap-5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/5 rounded-full border border-blue-500/10">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grounding</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isStreaming}
                  className="group relative flex items-center gap-3 px-6 lg:px-12 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl lg:rounded-2xl transition-all font-black tracking-widest text-[10px] lg:text-xs overflow-hidden ml-auto"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                  ) : (
                    <>
                      <span>SYNC</span>
                      <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
