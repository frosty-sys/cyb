import React, { useEffect, useState } from 'react';
import { storage } from './services/storage';
import { User, ViewState, Project } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import Admin from './components/Admin';
import Profile from './components/Profile';
import { Settings, LogOut, User as UserIcon, LayoutDashboard, Database } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('AUTH');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    storage.init();
    const session = storage.getSession();
    if (session) {
      setUser(session);
      setView('DASHBOARD');
    }
  }, []);

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setView('AUTH');
  };

  const navigateToProject = (project: Project) => {
    setCurrentProject(project);
    setView('EDITOR');
  };

  // Main Layout
  if (!user) {
    return <Auth onLogin={(u) => { setUser(u); setView('DASHBOARD'); }} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation */}
      <header className="h-16 glass-panel border-b border-gray-200 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">cyberdoom.rf.gd</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">agentic</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
             <button onClick={() => setView('DASHBOARD')} className={`hover:text-indigo-600 ${view === 'DASHBOARD' ? 'text-indigo-600' : ''}`}>Dashboard</button>
             {user.isAdmin && <button onClick={() => setView('ADMIN')} className={`hover:text-indigo-600 ${view === 'ADMIN' ? 'text-indigo-600' : ''}`}>Admin Panel</button>}
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <div className="text-sm font-semibold">{user.username}</div>
               <div className="text-xs text-indigo-600 font-medium">{user.isAdmin ? 'Admin' : `${user.credits} Credits`}</div>
             </div>
             
             <button onClick={() => setView('PROFILE')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <UserIcon size={20} />
             </button>
             <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'DASHBOARD' && (
          <Dashboard 
            user={user} 
            onOpenProject={navigateToProject} 
            onCreateProject={(p) => { setCurrentProject(p); setView('EDITOR'); }} 
          />
        )}
        
        {view === 'EDITOR' && currentProject && (
          <Editor 
            project={currentProject} 
            user={user}
            onBack={() => setView('DASHBOARD')} 
          />
        )}

        {view === 'ADMIN' && <Admin currentUser={user} />}
        
        {view === 'PROFILE' && (
          <Profile 
            user={user} 
            onUpdate={(updated) => setUser(updated)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;