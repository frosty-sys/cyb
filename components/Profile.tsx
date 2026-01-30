import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [adminCode, setAdminCode] = useState('');

  const handleUpdate = () => {
    const updated = { ...user, username };
    storage.saveUser(updated);
    storage.login(user.email, user.password); // update session
    onUpdate(updated);
    alert('Profile updated');
  };

  const handleUpgrade = () => {
    if (adminCode === 'Vasudev@2012') {
      const updated = { ...user, isAdmin: true };
      storage.saveUser(updated);
      onUpdate(updated);
      alert('Upgraded to Admin!');
    } else {
      alert('Invalid Admin Code');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Account Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input type="text" value={user.email} disabled className="w-full p-2 bg-gray-100 rounded border border-gray-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <button onClick={handleUpdate} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
        <h3 className="text-lg font-semibold mb-2 text-indigo-900">Subscription & Credits</h3>
        <p className="text-indigo-700 mb-4">You have <span className="font-bold text-xl">{user.credits}</span> credits available.</p>
        <p className="text-sm text-indigo-600 mb-4">You receive 5 free credits daily.</p>
        
        {!user.isAdmin && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <label className="block text-sm text-indigo-800 mb-1">Enter Admin Code to Upgrade</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
                className="flex-1 p-2 rounded border border-indigo-200"
                placeholder="Admin Password"
              />
              <button onClick={handleUpgrade} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;