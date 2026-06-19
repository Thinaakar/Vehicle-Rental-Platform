type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function parseResponse<T>(res: Response): Promise<ApiResult<T>> {
  const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) {
    return { ok: false, error: body.error ?? res.statusText, status: res.status };
  }
  return { ok: true, data: body.data as T };
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function isApiAvailable(): Promise<boolean> {
  const result = await apiClient.get<{ firebase: string }>('/api/health');
  return result.ok && result.data.firebase === 'connected';
}
