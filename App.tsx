import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/views/ChatView';
import { VisionView } from './components/views/VisionView';
import { AppMode, ModelType } from './types';
import { Settings, ExternalLink, Cpu, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);
  const [chatSessionId, setChatSessionId] = useState<string>(Date.now().toString());

  const handleNewChat = useCallback(() => {
    setChatSessionId(Date.now().toString());
    setCurrentMode(AppMode.CHAT);
  }, []);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.CHAT:
        return (
          <motion.div 
            key={`chat-${chatSessionId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <ChatView key={chatSessionId} model={selectedModel} />
          </motion.div>
        );
      case AppMode.VISION:
        return (
          <motion.div 
            key="vision"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <VisionView model={selectedModel} />
          </motion.div>
        );
      case AppMode.SETTINGS:
        return (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-6 lg:p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-32 lg:pb-8"
          >
             <div className="flex items-center gap-4 lg:gap-6 mb-10 lg:mb-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                  <div className="relative p-3 lg:p-4 bg-slate-900/50 glass border border-blue-500/30 rounded-2xl lg:rounded-3xl">
                    <Settings className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight">System Core</h2>
                  <p className="text-slate-500 text-xs lg:text-sm font-medium">Configure Nexus Quantum Engine</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-32">
                <div className="bg-slate-900/40 glass glass-card border border-white/5 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-6 lg:mb-8 flex items-center gap-3">
                        <Cpu className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                        Neural Engine
                    </h3>
                    
                    <div className="space-y-3 lg:space-y-4">
                        {[
                          { id: ModelType.FLASH, name: 'Quantum Flash', desc: 'Optimized speed', badge: 'Fast' },
                          { id: ModelType.PRO, name: 'Quantum Pro', desc: 'Deep analytics', badge: 'Ultra' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`w-full p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-left border transition-all duration-500 flex justify-between items-center group ${
                              selectedModel === m.id 
                              ? 'bg-blue-600/10 border-blue-500/40' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-bold text-sm lg:text-lg ${selectedModel === m.id ? 'text-blue-400' : 'text-slate-300'}`}>{m.name}</p>
                              </div>
                              <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5 font-medium">{m.desc}</p>
                            </div>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedModel === m.id ? 'border-blue-500 bg-blue-500' : 'border-white/10'
                            }`}>
                              {selectedModel === m.id && <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4 text-white" />}
                            </div>
                          </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/40 glass glass-card border border-white/5 rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Nexus Metadata</h3>
                    <p className="text-slate-400 text-xs lg:text-sm leading-relaxed mb-6 lg:mb-8 font-medium">
                      Version: <span className="text-blue-400 font-mono">3.0.Quantum</span><br/>
                      Protocols: Gemini-2.5-Native<br/>
                      Status: Deployment Active
                    </p>
                    <a 
                        href="https://ai.google.dev" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full px-5 py-3 lg:py-4 bg-white/5 hover:bg-blue-600/20 text-slate-200 rounded-xl lg:rounded-2xl font-bold transition-all flex items-center justify-between border border-white/5 text-xs lg:text-sm"
                    >
                        <span>Documentation</span>
                        <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" />
                    </a>
                </div>
             </div>
          </motion.div>
        );
      default:
        return <ChatView key={chatSessionId} model={selectedModel} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#02040a] text-slate-100 overflow-hidden relative">
      {/* Quantum Auras */}
      <div className="aura-orb w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-blue-600/20 -top-40 -left-40" />
      <div className="aura-orb w-[250px] lg:w-[500px] h-[250px] lg:h-[500px] bg-violet-600/10 bottom-0 -right-20" style={{ animationDelay: '-5s' }} />
      
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <Sidebar 
        currentMode={currentMode} 
        onModeChange={setCurrentMode} 
        onNewChat={handleNewChat}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
