import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';
import { Key, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = storage.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } else {
      // Signup Logic
      const config = storage.getConfig();
      if (!config.secretKeys.includes(secretKey)) {
        setError('Invalid Secret Key');
        return;
      }
      
      const users = storage.getUsers();
      if (users.find(u => u.email === email)) {
        setError('Email already registered');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: `user_${Math.random().toString(36).substring(7)}`,
        email,
        password,
        isAdmin: false,
        credits: 5, // Initial free credits
        lastLoginDate: new Date().toDateString()
      };

      storage.saveUser(newUser);
      // Mark key as used if needed, but prompt says "can use more than once" for the default keys. 
      // We'll assume admin generated keys might be one-time, but the prompt specifics say "set these as... can use more than once".
      
      const loggedIn = storage.login(email, password);
      if (loggedIn) onLogin(loggedIn);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">cyberdoom.rf.gd</h1>
          <p className="text-indigo-200 text-sm">Agentic Web Development Platform</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    placeholder="Enter invite key"
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? 'Join now' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;