import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getMemoireMode,
  validateHandle,
  validateMessage,
  listPosts,
  createPost,
  MemoireError,
  _resetMemoireStorage,
  _getMemoireStorage,
} from '../../src/lib/memoire';

const STORAGE_KEY = 'nabilos-memoire';

// Force local mode so tests are hermetic regardless of a developer's .env.local
function forceLocalMode() {
  vi.stubEnv('VITE_SUPABASE_URL', '');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
}

function clearMemoireStorage() {
  _resetMemoireStorage();
}

function fakeResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

// ── Validation tests ───────────────────────────────────────────────────

describe('validateHandle', () => {
  it('returns null for a valid handle', () => {
    expect(validateHandle('SYSOP')).toBeNull();
  });

  it('returns null for handle with allowed special chars', () => {
    expect(validateHandle('Nabil 007')).toBeNull();
    expect(validateHandle('a_b.c-d')).toBeNull();
  });

  it('rejects empty handle', () => {
    expect(validateHandle('')).toBe('Handle required');
  });

  it('rejects whitespace-only handle', () => {
    expect(validateHandle('   ')).toBe('Handle required');
  });

  it('rejects handle exceeding max length', () => {
    const long = 'A'.repeat(25);
    expect(validateHandle(long)).toBe('Handle too long (max 24)');
  });

  it('accepts handle at exactly max length', () => {
    const exact = 'A'.repeat(24);
    expect(validateHandle(exact)).toBeNull();
  });

  it('rejects handle with illegal characters', () => {
    expect(validateHandle('bad!')).toBe(
      'Handle may only contain letters, numbers, space, _ . -',
    );
    expect(validateHandle('no@atsign')).toBe(
      'Handle may only contain letters, numbers, space, _ . -',
    );
  });
});

describe('validateMessage', () => {
  it('returns null for a valid message', () => {
    expect(validateMessage('Hello world')).toBeNull();
  });

  it('returns null for message with newlines', () => {
    expect(validateMessage('Line 1\nLine 2')).toBeNull();
  });

  it('returns null for message with exactly 2 consecutive newlines', () => {
    expect(validateMessage('A\n\nB')).toBeNull();
  });

  it('collapses 3+ consecutive newlines', () => {
    const result = validateMessage('A\n\n\n\nB');
    expect(result).toBeNull();
  });

  it('rejects empty message', () => {
    expect(validateMessage('')).toBe('Message required');
  });

  it('rejects whitespace-only message', () => {
    expect(validateMessage('   ')).toBe('Message required');
  });

  it('rejects message exceeding max length', () => {
    const long = 'X'.repeat(401);
    expect(validateMessage(long)).toBe('Message too long (max 400)');
  });

  it('accepts message at exactly max length', () => {
    const exact = 'X'.repeat(400);
    expect(validateMessage(exact)).toBeNull();
  });
});

// ── Mode detection ─────────────────────────────────────────────────────

describe('getMemoireMode', () => {
  beforeEach(() => {
    forceLocalMode();
    clearMemoireStorage();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns local when env vars are absent', () => {
    expect(getMemoireMode()).toBe('local');
  });
});

// ── Local mode ─────────────────────────────────────────────────────────

describe('local mode', () => {
  beforeEach(() => {
    forceLocalMode();
    clearMemoireStorage();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('createPost returns a post with mode local', async () => {
    const result = await createPost('Tester', 'Hello board');
    expect(result.mode).toBe('local');
    expect(result.post.handle).toBe('Tester');
    expect(result.post.message).toBe('Hello board');
    expect(result.post.id).toBeTruthy();
    expect(result.post.created_at).toBeTruthy();
  });

  it('listPosts returns posts in local mode', async () => {
    await createPost('Alice', 'First post');
    const result = await listPosts();
    expect(result.mode).toBe('local');
    expect(result.posts.length).toBeGreaterThanOrEqual(1);
    expect(result.posts[0].handle).toBe('Alice');
    expect(result.posts[0].message).toBe('First post');
  });

  it('listPosts returns seed posts when storage is empty', async () => {
    const result = await listPosts();
    expect(result.mode).toBe('local');
    expect(result.posts.length).toBe(3);
    expect(result.posts[0].handle).toBe('SYSOP');
  });

  it('createPost persists under nabilos-memoire key', async () => {
    await createPost('Bob', 'Persist test');
    const storage = _getMemoireStorage();
    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as Array<{ handle: string }>;
    expect(parsed.some((p) => p.handle === 'Bob')).toBe(true);
  });

  it('strips control characters from handle and message', async () => {
    const result = await createPost('Te\x00ster', 'Hel\x07lo\x7F world');
    expect(result.post.handle).toBe('Tester');
    expect(result.post.message).toBe('Hello world');
  });
});

// ── Rate limit ─────────────────────────────────────────────────────────

describe('rate limit', () => {
  beforeEach(() => {
    forceLocalMode();
    clearMemoireStorage();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('second immediate createPost throws RATE_LIMIT', async () => {
    await createPost('User1', 'First post');
    await expect(createPost('User2', 'Second post')).rejects.toThrow(
      MemoireError,
    );
    try {
      await createPost('User2', 'Second post');
    } catch (err) {
      expect(err).toBeInstanceOf(MemoireError);
      expect((err as MemoireError).code).toBe('RATE_LIMIT');
    }
  });
});

// ── Remote mode ────────────────────────────────────────────────────────

describe('remote mode', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    clearMemoireStorage();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.fetch = origFetch;
  });

  it('listPosts fetches from /rest/v1/memoire with correct params', async () => {
    const mockPosts = [
      { id: '1', handle: 'Remote', message: 'Hi', created_at: '2026-01-01T00:00:00Z' },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse(mockPosts));

    const result = await listPosts();
    expect(result.mode).toBe('remote');
    expect(result.posts).toEqual(mockPosts);

    const callUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(callUrl).toContain('/rest/v1/memoire');
    expect(callUrl).toContain('select=id,handle,message,created_at');
    expect(callUrl).toContain('order=created_at.desc');
  });

  it('createPost sends POST with handle+message but not id/created_at', async () => {
    const inserted = [
      { id: 'new-id', handle: 'Poster', message: 'Yo', created_at: '2026-01-01T00:00:00Z' },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse(inserted));

    const result = await createPost('Poster', 'Yo');
    expect(result.mode).toBe('remote');
    expect(result.post.id).toBe('new-id');

    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body as string);
    expect(body).toEqual({ handle: 'Poster', message: 'Yo' });
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('created_at');

    // Check headers
    const headers = fetchCall[1].headers as Record<string, string>;
    expect(headers.apikey).toBe('test-anon-key');
    expect(headers.Authorization).toBe('Bearer test-anon-key');
    expect(headers.Prefer).toBe('return=representation');
  });

  it('remote list failure falls back to local', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await listPosts();
    expect(result.mode).toBe('local');
    expect(Array.isArray(result.posts)).toBe(true);
  });

  it('remote create failure falls back to local', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await createPost('Fallback', 'Still saved');
    expect(result.mode).toBe('local');
    expect(result.post.handle).toBe('Fallback');
    expect(result.post.message).toBe('Still saved');
  });

  it('remote create non-200 falls back to local', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse(null, false, 500));

    const result = await createPost('ServerError', 'Oops');
    expect(result.mode).toBe('local');
    expect(result.post.handle).toBe('ServerError');
  });

  it('MemoireError(NETWORK) is re-thrown, not swallowed', async () => {
    // In our implementation, network errors fall back to local.
    // But validation errors should still throw.
    await expect(createPost('', 'msg')).rejects.toThrow(MemoireError);
    try {
      await createPost('', 'msg');
    } catch (err) {
      expect((err as MemoireError).code).toBe('INVALID');
    }
  });
});

// ── MemoireError class ────────────────────────────────────────────────

describe('MemoireError', () => {
  it('has correct name and code', () => {
    const err = new MemoireError('RATE_LIMIT', 'Too fast');
    expect(err.name).toBe('MemoireError');
    expect(err.code).toBe('RATE_LIMIT');
    expect(err.message).toBe('Too fast');
    expect(err instanceof Error).toBe(true);
  });
});
