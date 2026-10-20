import type { UserProfile, SavedLevelData, UserProgressMap } from '../types/game';

const USERS_STORAGE_KEY = 'systemcraft_users_v1';
const ACTIVE_USER_KEY = 'systemcraft_active_user_v1';
const PROGRESS_PREFIX = 'systemcraft_progress_';

const DEFAULT_USER: UserProfile = {
  id: 'user_default',
  username: 'Lead Architect',
  createdAt: Date.now(),
  avatarColor: '#06b6d4', // cyan-500
};

export const StorageService = {
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        this.saveUser(DEFAULT_USER);
        return [DEFAULT_USER];
      }
      return JSON.parse(data);
    } catch {
      return [DEFAULT_USER];
    }
  },

  getActiveUser(): UserProfile {
    try {
      const users = this.getUsers();
      const activeId = localStorage.getItem(ACTIVE_USER_KEY);
      const found = users.find((u) => u.id === activeId);
      if (found) return found;
      this.setActiveUser(users[0].id);
      return users[0];
    } catch {
      return DEFAULT_USER;
    }
  },

  setActiveUser(userId: string): void {
    try {
      localStorage.setItem(ACTIVE_USER_KEY, userId);
    } catch (e) {
      console.warn('Failed to set active user in localStorage', e);
    }
  },

  saveUser(user: UserProfile): void {
    try {
      const users = this.getUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save user in localStorage', e);
    }
  },

  createUser(username: string): UserProfile {
    const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim() || 'New Architect',
      createdAt: Date.now(),
      avatarColor: randomColor,
    };
    this.saveUser(newUser);
    this.setActiveUser(newUser.id);
    return newUser;
  },

  getUserProgress(userId: string): UserProgressMap {
    try {
      const data = localStorage.getItem(`${PROGRESS_PREFIX}${userId}`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveLevelProgress(
    userId: string,
    questionId: number,
    levelNumber: number,
    levelData: Partial<SavedLevelData>
  ): void {
    try {
      const progress = this.getUserProgress(userId);
      const qKey = String(questionId);
      if (!progress[qKey]) {
        progress[qKey] = {};
      }

      const existing = progress[qKey][levelNumber] || {
        isCompleted: false,
        bestP99: 9999,
        bestCost: 9999,
        nodes: [],
        edges: [],
        updatedAt: Date.now(),
      };

      progress[qKey][levelNumber] = {
        ...existing,
        ...levelData,
        updatedAt: Date.now(),
      };

      localStorage.setItem(`${PROGRESS_PREFIX}${userId}`, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress in localStorage', e);
    }
  },

  getLevelData(
    userId: string,
    questionId: number,
    levelNumber: number
  ): SavedLevelData | null {
    const progress = this.getUserProgress(userId);
    return progress[String(questionId)]?.[levelNumber] || null;
  },
};
