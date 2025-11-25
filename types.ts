
export interface Delegate {
  id: string;
  name: string;
  allotment: string;
  committee: string;
  class?: string;
  status: 'Allocated' | 'Pending' | 'Waitlist' | 'Head Delegate';
  team: string; // New grouping key for Tabs (e.g., Team A, Team B)
}

export interface MunData {
  conferenceName: string;
  delegates: Delegate[];
}

export enum AppState {
  LANDING = 'LANDING',
  APP = 'APP', // Chat or Table view is managed within APP
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  munData?: MunData;
  lastModified: number;
}

export interface AIResponse {
  type: 'chat' | 'data';
  message?: string;
  data?: MunData;
}

export type ThemeColor = 'blue' | 'purple' | 'emerald' | 'orange';

export interface AppSettings {
  theme: ThemeColor;
}
