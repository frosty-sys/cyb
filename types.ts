export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Stored in mock DB
  isAdmin: boolean;
  credits: number;
  lastLoginDate?: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  html: string; // Single file for simplicity as per prompt
  createdAt: number;
  updatedAt: number;
  branch: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isGenerating?: boolean; // If true, show "Generating app..."
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface AppConfig {
  dailyFreeCredits: number;
  firebaseConfigRaw: string; // Raw text admin inputs
  secretKeys: string[]; // List of valid keys
  usedKeys: string[]; // Keys used by users
}

export type ViewState = 'AUTH' | 'DASHBOARD' | 'EDITOR' | 'ADMIN' | 'PROFILE';

export interface SystemStatus {
  cpuLoad: number;
  memoryUsage: number;
  networkLatency: number;
  threatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
  uplinkStability: number;
}