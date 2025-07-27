import { browser } from '$app/environment';

export interface RecentAnalysis {
  id: string;
  query: string;
  createdAt: string;
  status?: string;
}

const STORAGE_KEY = 'rant-radar-recent';
const MAX_RECENT = 3;

export function getRecentAnalyses(): RecentAnalysis[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentAnalysis(id: string, query: string): void {
  if (!browser) return;
  
  const recent = getRecentAnalyses();
  const newAnalysis: RecentAnalysis = {
    id,
    query,
    createdAt: new Date().toISOString()
  };
  
  // Remove if already exists (to avoid duplicates)
  const filtered = recent.filter(item => item.id !== id);
  
  // Add to beginning and limit to MAX_RECENT
  const updated = [newAnalysis, ...filtered].slice(0, MAX_RECENT);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function removeRecentAnalysis(id: string): void {
  if (!browser) return;
  
  const recent = getRecentAnalyses();
  const filtered = recent.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
}