import React from 'react';
import { MessageSquare, Image as ImageIcon, Settings, Plus, Sparkles } from 'lucide-react';
import { AppMode } from '../types';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, onNewChat }) => {
  const navItems = [
    { mode: AppMode.CHAT, label: 'Chat', icon: MessageSquare, desc: 'Neural Chat' },
    { mode: AppMode.VISION, label: 'Vision', icon: ImageIcon, desc: 'Image Lab' },
    { mode: AppMode.SETTINGS, label: 'Core', icon: Settings, desc: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 h-screen bg-slate-950/80 glass border-r border-slate-800/60 flex-col flex-shrink-0 z-30 shadow-2xl">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 group cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              <Sparkles className="text-white w-7 h-7" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">NEXUS</h1>
              <p className="text-[10px] font-mono text-indigo-400/80 tracking-widest uppercase font-bold">Studio Core</p>
            </div>
          </div>
        </div>

        <div className="px-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm tracking-wide">New Session</span>
          </motion.button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Capabilities</p>
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => onModeChange(item.mode)}
                className={`w-full group relative flex flex-col gap-1 p-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-800/40 text-blue-400 border border-blue-500/20'
                    : 'text-slate-500 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                    <p className="text-[10px] opacity-60 font-medium">{item.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 glass border-t border-slate-800/60 flex items-center justify-around px-4 z-50">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-tighter">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-dot"
                  className="w-1 h-1 rounded-full bg-blue-500 mt-0.5 shadow-[0_0_8px_rgba(59,130,246,1)]"
                />
              )}
            </button>
          );
        })}
        <button
          onClick={onNewChat}
          className="flex flex-col items-center justify-center w-full h-full text-indigo-400"
        >
          <Plus className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-tighter">New</span>
        </button>
      </div>
    </>
  );
};
