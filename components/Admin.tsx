import React, { useState, useEffect } from 'react';
import { User, AppConfig } from '../types';
import { storage } from '../services/storage';
import { Save, Plus, RefreshCw, Trash2, Shield } from 'lucide-react';

interface AdminProps {
  currentUser: User;
}

const Admin: React.FC<AdminProps> = ({ currentUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<AppConfig>(storage.getConfig());
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [newKey, setNewKey] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Vasudev@2012') {
      setIsAuthenticated(true);
    } else {
      alert('Access Denied');
    }
  };

  const handleConfigUpdate = () => {
    storage.updateConfig(config);
    alert('Configuration Updated Successfully');
  };

  const addCredits = (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.credits += amount;
      storage.saveUser(user);
      setUsers(storage.getUsers()); // Refresh list
    }
  };

  const addSecretKey = () => {
    if (newKey && !config.secretKeys.includes(newKey)) {
      setConfig(prev => ({ ...prev, secretKeys: [...prev.secretKeys, newKey] }));
      setNewKey('');
    }
  };

  const removeSecretKey = (key: string) => {
    setConfig(prev => ({ ...prev, secretKeys: prev.secretKeys.filter(k => k !== key) }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6 text-red-600">
             <Shield size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Admin Restricted</h2>
          <p className="text-center text-gray-500 mb-6">Enter secure access credentials.</p>
          <form onSubmit={handleAuth}>
             <input 
               type="password" 
               value={password} 
               onChange={e => setPassword(e.target.value)}
               className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 outline-none"
               placeholder="Passkey"
             />
             <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
               Unlock Panel
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Superuser Mode Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Settings */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <RefreshCw size={20} className="text-indigo-600"/> Platform Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Free Credits</label>
                <input 
                  type="number" 
                  value={config.dailyFreeCredits} 
                  onChange={e => setConfig({ ...config, dailyFreeCredits: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Credits reset for users upon first login each day.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firebase Config (Raw Text)</label>
                <textarea 
                  value={config.firebaseConfigRaw} 
                  onChange={e => setConfig({ ...config, firebaseConfigRaw: e.target.value })}
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Paste the raw text block the AI should use for Firebase configuration..."
                />
                <p className="text-xs text-gray-500 mt-1">This text is injected into the AI system prompt when backend features are requested.</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
               <h3 className="text-sm font-medium text-gray-700 mb-3">Secret Invite Keys</h3>
               <div className="flex gap-2 mb-3">
                 <input 
                   type="text" 
                   value={newKey}
                   onChange={e => setNewKey(e.target.value)}
                   className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                   placeholder="New key..."
                 />
                 <button onClick={addSecretKey} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                   <Plus size={16} />
                 </button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {config.secretKeys.map(key => (
                   <span key={key} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
                     {key}
                     <button onClick={() => removeSecretKey(key)} className="hover:text-red-500"><Trash2 size={12} /></button>
                   </span>
                 ))}
               </div>
            </div>

            <button 
              onClick={handleConfigUpdate}
              className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <Save size={18} /> Save System Config
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Shield size={20} className="text-indigo-600"/> User Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Credits</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                      {user.isAdmin && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">ADMIN</span>}
                    </td>
                    <td className="py-3 font-mono">
                      {user.credits}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => addCredits(user.id, 5)}
                          className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 text-xs border border-green-200"
                        >
                          +5
                        </button>
                        <button 
                          onClick={() => addCredits(user.id, 20)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs border border-blue-200"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;