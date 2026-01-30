import { User, Project, AppConfig } from '../types';

const DB_KEYS = {
  USERS: 'cyberdoom_users',
  PROJECTS: 'cyberdoom_projects',
  CONFIG: 'cyberdoom_config',
  SESSION: 'cyberdoom_session'
};

// Initial Config
const INITIAL_CONFIG: AppConfig = {
  dailyFreeCredits: 5,
  firebaseConfigRaw: '',
  secretKeys: ['key1p', 'key2r', 'key3l'],
  usedKeys: []
};

// Helper to simulate DB delays
const delay = () => new Promise(r => setTimeout(r, 100));

export const storage = {
  init: () => {
    if (!localStorage.getItem(DB_KEYS.CONFIG)) {
      localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.PROJECTS)) {
      localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify([]));
    }
  },

  getConfig: (): AppConfig => {
    return JSON.parse(localStorage.getItem(DB_KEYS.CONFIG) || JSON.stringify(INITIAL_CONFIG));
  },

  updateConfig: (config: Partial<AppConfig>) => {
    const current = storage.getConfig();
    localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify({ ...current, ...config }));
  },

  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  },

  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  getProjects: (userId?: string): Project[] => {
    const projects = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS) || '[]');
    if (userId) return projects.filter((p: Project) => p.ownerId === userId);
    return projects;
  },

  saveProject: (project: Project) => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
  },

  deleteProject: (id: string) => {
    const projects = storage.getProjects().filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Auth Helpers
  login: (email: string, pwd?: string): User | null => {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.password === pwd);
    if (user) {
      // Daily Credit Reset Check
      const today = new Date().toDateString();
      if (user.lastLoginDate !== today) {
        const config = storage.getConfig();
        user.credits = (user.credits || 0) + config.dailyFreeCredits;
        user.lastLoginDate = today;
        storage.saveUser(user);
      }
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  },

  getSession: (): User | null => {
    return JSON.parse(localStorage.getItem(DB_KEYS.SESSION) || 'null');
  },

  logout: () => {
    localStorage.removeItem(DB_KEYS.SESSION);
  }
};