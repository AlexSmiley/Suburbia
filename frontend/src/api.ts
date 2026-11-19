export interface PostcodeRecord {
  postcode: string;
  name: string[];
}

export interface RangeResult {
  suburbs: string[];
  totalCharacters: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const suburbiaApi = {
  byState(state: string) {
    return request<PostcodeRecord[]>(`/${encodeURIComponent(state)}`);
  },
  byPostcodeRange(from: string, to: string) {
    return request<unknown>(`/${encodeURIComponent(from)}/${encodeURIComponent(to)}`);
  },
  save(records: PostcodeRecord[]) {
    return request<PostcodeRecord[]>("/postcodes", {
      method: "POST",
      body: JSON.stringify(records)
    });
  }
};

export function parseRangeResult(raw: unknown): RangeResult {
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Record<string, unknown>;
  const suburbsValue = parsed["suburb names:"] ?? parsed["suburb names"] ?? [];
  const suburbs = Array.isArray(suburbsValue)
    ? suburbsValue.map(String)
    : [];
  const total = Number(parsed["total chars"] ?? parsed["total characters"] ?? 0);
  return { suburbs, totalCharacters: Number.isFinite(total) ? total : 0 };
}
