import React, { useState } from 'react';
import { LayoutGrid, Terminal as TerminalIcon, Shield, Settings, Menu, X } from 'lucide-react';
import Terminal from './components/Terminal';
import SystemMonitor from './components/SystemMonitor';
import GlitchText from './components/GlitchText';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'logs' | 'config'>('terminal');

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono overflow-hidden flex flex-col md:flex-row">
      {/* Background Grid - visual flair */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 z-0"
        style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
        }}
      />

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-green-900 bg-black z-50">
        <GlitchText text="CYBERDOOM_1" className="font-bold text-xl tracking-tighter" />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Navigation */}
      <div className={`
        fixed md:relative inset-y-0 left-0 w-64 bg-black/95 transform transition-transform duration-300 z-40 border-r border-green-900/50 flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-green-900/50 hidden md:block">
           <GlitchText text="CYBERDOOM_1" className="font-bold text-2xl tracking-tighter block" />
           <span className="text-xs text-green-700 tracking-widest">AUTONOMOUS AGENT</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <SystemMonitor />
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 border-t border-green-900/50 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-3 p-3 rounded text-sm transition-all ${activeTab === 'terminal' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-green-800 hover:text-green-600'}`}
          >
            <TerminalIcon size={16} /> TERMINAL_UPLINK
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-3 p-3 rounded text-sm transition-all ${activeTab === 'logs' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-green-800 hover:text-green-600'}`}
          >
            <Shield size={16} /> SECURITY_LOGS
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-3 p-3 rounded text-sm transition-all ${activeTab === 'config' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-green-800 hover:text-green-600'}`}
          >
            <Settings size={16} /> CONFIG_SYS
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen relative z-10">
        {activeTab === 'terminal' && <Terminal />}
        
        {activeTab === 'logs' && (
          <div className="p-8 h-full overflow-auto">
             <h2 className="text-xl mb-4 border-b border-green-800 pb-2 flex items-center gap-2">
               <Shield className="text-red-500" /> ACCESS LOGS
             </h2>
             <div className="font-mono text-xs space-y-2 opacity-80">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 border-b border-green-900/30 pb-1">
                    <span className="col-span-3 text-green-700">{new Date(Date.now() - i * 1000000).toISOString()}</span>
                    <span className="col-span-2 text-yellow-600">WARN</span>
                    <span className="col-span-7">Unauthorized packet detected at port {8000 + i}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'config' && (
           <div className="p-8 h-full flex items-center justify-center">
             <div className="border border-green-800 bg-green-900/10 p-8 max-w-md text-center">
               <Settings className="w-12 h-12 mx-auto mb-4 text-green-600 animate-spin-slow" />
               <h3 className="text-lg font-bold mb-2">ACCESS RESTRICTED</h3>
               <p className="text-sm text-green-700 mb-6">
                 Configuration locked by SYSTEM_ADMIN. <br/>
                 Current clearance level: USER_NULL
               </p>
               <button className="px-4 py-2 bg-green-900/20 border border-green-600 hover:bg-green-900/40 text-xs tracking-wider">
                 REQUEST ELEVATION
               </button>
             </div>
           </div>
        )}
      </div>
      
    </div>
  );
};

export default App;