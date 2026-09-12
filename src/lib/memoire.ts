import type { MemoirePost, MemoireMode } from '../types/memoire';
import {
  MEMOIRE_MAX_HANDLE,
  MEMOIRE_MAX_MESSAGE,
  MEMOIRE_MIN_INTERVAL_MS,
} from '../types/memoire';
import { safeStorage } from './storage';

// ── Storage singleton ──────────────────────────────────────────────────
// safeStorage() may return a fresh Map-backed fallback each call in test
// environments. Cache it at module level so reads/writes share state.
const storage = safeStorage();

// ── Test helper ────────────────────────────────────────────────────────
export function _resetMemoireStorage(): void {
  storage.removeItem(STORAGE_KEY);
  storage.removeItem(MEMOIRE_LAST_KEY);
}

export function _getMemoireStorage(): Storage {
  return storage;
}

// ── Env helpers ────────────────────────────────────────────────────────
// Access import.meta.env via index access — Vite types it as ImportMetaEnv
// which has [key: string]: any, so arbitrary VITE_* keys are accessible.
// vi.stubEnv in Vitest mutates import.meta.env in-place, so reading from
// the same object reference always sees the stubbed values.

function getSupabaseUrl(): string | undefined {
  const v: unknown = import.meta.env['VITE_SUPABASE_URL'];
  return typeof v === 'string' ? v : undefined;
}

function getSupabaseKey(): string | undefined {
  const v: unknown = import.meta.env['VITE_SUPABASE_ANON_KEY'];
  return typeof v === 'string' ? v : undefined;
}

const STORAGE_KEY = 'nabilos-memoire';
export const MEMOIRE_LAST_KEY = 'nabilos-memoire-last';

const SEED_POSTS: MemoirePost[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    handle: 'SYSOP',
    message: 'Welcome to the memoire board! Leave your mark.',
    created_at: '1986-03-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    handle: 'Nabil',
    message: 'Retro vibes only. This board runs on Supabase + localStorage.',
    created_at: '1986-06-15T12:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    handle: 'Guest',
    message: 'If you can read this, the fallback is working.',
    created_at: '1986-12-25T08:30:00.000Z',
  },
];

// ── Error type ─────────────────────────────────────────────────────────

export class MemoireError extends Error {
  readonly code: 'RATE_LIMIT' | 'INVALID' | 'NETWORK';
  constructor(code: 'RATE_LIMIT' | 'INVALID' | 'NETWORK', message: string) {
    super(message);
    this.name = 'MemoireError';
    this.code = code;
  }
}

// ── Mode detection ─────────────────────────────────────────────────────

export function getMemoireMode(): MemoireMode {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (url && url.trim() !== '' && key && key.trim() !== '') {
    return 'remote';
  }
  return 'local';
}

// ── Sanitization ───────────────────────────────────────────────────────

function stripControl(s: string): string {
  // Strip control characters except \n and \t.
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function collapseNewlines(s: string): string {
  return s.replace(/\n{3,}/g, '\n\n');
}

// ── Validation ─────────────────────────────────────────────────────────

export function validateHandle(handle: string): string | null {
  const trimmed = handle.trim();
  if (trimmed.length === 0) return 'Handle required';
  if (trimmed.length > MEMOIRE_MAX_HANDLE)
    return `Handle too long (max ${MEMOIRE_MAX_HANDLE})`;
  if (!/^[A-Za-z0-9 _.\-]+$/.test(trimmed))
    return 'Handle may only contain letters, numbers, space, _ . -';
  return null;
}

export function validateMessage(message: string): string | null {
  const collapsed = collapseNewlines(message);
  const trimmed = collapsed.trim();
  if (trimmed.length === 0) return 'Message required';
  if (trimmed.length > MEMOIRE_MAX_MESSAGE)
    return `Message too long (max ${MEMOIRE_MAX_MESSAGE})`;
  return null;
}

function runValidation(cleanHandle: string, cleanMessage: string): void {
  const handleErr = validateHandle(cleanHandle);
  if (handleErr) throw new MemoireError('INVALID', handleErr);
  const msgErr = validateMessage(cleanMessage);
  if (msgErr) throw new MemoireError('INVALID', msgErr);
}

// ── Local storage helpers ──────────────────────────────────────────────

function readLocal(): MemoirePost[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    storage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
    return [...SEED_POSTS];
  }
  try {
    return JSON.parse(raw) as MemoirePost[];
  } catch {
    storage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
    return [...SEED_POSTS];
  }
}

function writeLocal(posts: MemoirePost[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function localCreate(handle: string, message: string): MemoirePost {
  const posts = readLocal();
  const now = new Date().toISOString();
  const id =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const post: MemoirePost = {
    id,
    handle,
    message: collapseNewlines(message).trim(),
    created_at: now,
  };
  posts.unshift(post);
  writeLocal(posts);
  return post;
}

// ── Rate limit ─────────────────────────────────────────────────────────

function checkRateLimit(): void {
  const raw = storage.getItem(MEMOIRE_LAST_KEY);
  if (raw !== null) {
    const last = Number(raw);
    const now = Date.now();
    if (now - last < MEMOIRE_MIN_INTERVAL_MS) {
      throw new MemoireError(
        'RATE_LIMIT',
        'Please wait a moment before posting again.',
      );
    }
  }
}

function recordPostTime(): void {
  storage.setItem(MEMOIRE_LAST_KEY, String(Date.now()));
}

// ── Remote helpers ─────────────────────────────────────────────────────

function remoteEndpoint(): string {
  return `${getSupabaseUrl()}/rest/v1/memoire`;
}

function remoteHeaders(): Record<string, string> {
  return {
    apikey: getSupabaseKey()!,
    Authorization: `Bearer ${getSupabaseKey()!}`,
    'Content-Type': 'application/json',
  };
}

// ── Public API ─────────────────────────────────────────────────────────

export interface MemoireListResult {
  posts: MemoirePost[];
  mode: MemoireMode;
}

export interface MemoireCreateResult {
  post: MemoirePost;
  mode: MemoireMode;
}

export async function listPosts(limit = 50): Promise<MemoireListResult> {
  if (getMemoireMode() === 'local') {
    return { posts: readLocal(), mode: 'local' };
  }

  try {
    const url = `${remoteEndpoint()}?select=id,handle,message,created_at&order=created_at.desc&limit=${limit}`;
    const res = await fetch(url, { headers: remoteHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = (await res.json()) as MemoirePost[];
    return { posts, mode: 'remote' };
  } catch {
    // Graceful fallback to local
    return { posts: readLocal(), mode: 'local' };
  }
}

export async function createPost(
  handle: string,
  message: string,
): Promise<MemoireCreateResult> {
  // Sanitize first: strip control chars, then validate clean values.
  const cleanHandle = stripControl(handle.trim());
  const cleanMessage = collapseNewlines(stripControl(message)).trim();

  // Validate sanitized values before any write
  runValidation(cleanHandle, cleanMessage);

  if (getMemoireMode() === 'remote') {
    try {
      checkRateLimit();
      const res = await fetch(remoteEndpoint(), {
        method: 'POST',
        headers: { ...remoteHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({ handle: cleanHandle, message: cleanMessage }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = (await res.json()) as MemoirePost[];
      const post = rows[0];
      recordPostTime();
      return { post, mode: 'remote' };
    } catch (err) {
      if (err instanceof MemoireError) throw err;
      // Graceful fallback: create locally so the visitor's post still shows
      const post = localCreate(cleanHandle, cleanMessage);
      recordPostTime();
      return { post, mode: 'local' };
    }
  }

  // Pure local mode
  checkRateLimit();
  const post = localCreate(cleanHandle, cleanMessage);
  recordPostTime();
  return { post, mode: 'local' };
}
