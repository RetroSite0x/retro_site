export interface MemoirePost {
  id: string;
  handle: string;
  message: string;
  created_at: string; // ISO 8601 UTC
}

export type MemoireMode = 'remote' | 'local';

export const MEMOIRE_MAX_HANDLE = 24;
export const MEMOIRE_MAX_MESSAGE = 400;
export const MEMOIRE_MIN_INTERVAL_MS = 20000;
