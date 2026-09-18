import { safeStorage } from './storage';

const storage = safeStorage();

const FALLBACK_KEY = 'nabilos-visitor-count';

function getSupabaseUrl(): string | undefined {
  const v: unknown = import.meta.env['VITE_SUPABASE_URL'];
  return typeof v === 'string' ? v : undefined;
}

function getSupabaseKey(): string | undefined {
  const v: unknown = import.meta.env['VITE_SUPABASE_ANON_KEY'];
  return typeof v === 'string' ? v : undefined;
}

function isRemote(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return !!url && url.trim() !== '' && !!key && key.trim() !== '';
}

function remoteHeaders(): Record<string, string> {
  return {
    apikey: getSupabaseKey()!,
    Authorization: `Bearer ${getSupabaseKey()!}`,
    'Content-Type': 'application/json',
  };
}

async function remoteIncrement(): Promise<number | null> {
  try {
    const url = `${getSupabaseUrl()}/rest/v1/rpc/increment_visitor_count`;
    const res = await fetch(url, {
      method: 'POST',
      headers: remoteHeaders(),
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const count = (await res.json()) as number;
    return count;
  } catch {
    return null;
  }
}

function localRead(): number {
  const raw = storage.getItem(FALLBACK_KEY);
  return raw ? Number(raw) : 42819;
}

function localWrite(count: number): void {
  storage.setItem(FALLBACK_KEY, String(count));
}

export async function getVisitorCount(): Promise<number> {
  if (isRemote()) {
    const count = await remoteIncrement();
    if (count !== null) {
      localWrite(count);
      return count;
    }
  }

  const local = localRead() + 1;
  localWrite(local);
  return local;
}
