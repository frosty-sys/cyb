export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface SystemStatus {
  cpuLoad: number;
  memoryUsage: number;
  networkLatency: number;
  threatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
  uplinkStability: number;
}

export enum AppView {
  TERMINAL = 'TERMINAL',
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS'
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}