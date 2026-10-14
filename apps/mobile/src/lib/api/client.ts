import { API_URL, IS_DEMO } from '../config';
import { ApiError } from './errors';

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ApiRequest {
  method: Method;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  token?: string | null;
}

export type Transport = (req: ApiRequest) => Promise<unknown>;

let tokenProvider: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

/** Lets the auth store supply the session token and react to expired sessions. */
export function configureApiClient(options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  tokenProvider = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

const httpTransport: Transport = async ({ method, path, query, body, token }) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {}))
    if (v !== undefined && v !== '') qs.set(k, String(v));
  const url = `${API_URL}${path}${qs.size ? `?${qs}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      'network',
      'Unable to reach Baymax. Check your connection and try again.',
    );
  }

  if (response.status === 204) return undefined;
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    const err = data?.error ?? {};
    throw new ApiError(
      response.status,
      err.code ?? 'error',
      err.message ?? 'Request failed',
      err.details?.fields ?? {},
    );
  }
  return data;
};

let transport: Transport = httpTransport;
let demoTransportPromise: Promise<Transport> | null = null;

async function getTransport(): Promise<Transport> {
  if (!IS_DEMO) return transport;
  // The demo server is loaded lazily so production bundles pointed at a real API stay lean.
  demoTransportPromise ??= import('../demo/server').then((m) => m.demoTransport);
  return demoTransportPromise;
}

export async function apiRequest<T>(req: Omit<ApiRequest, 'token'>): Promise<T> {
  const send = await getTransport();
  try {
    return (await send({ ...req, token: tokenProvider() })) as T;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && tokenProvider()) onUnauthorized();
    throw error;
  }
}

export const api = {
  get: <T>(path: string, query?: ApiRequest['query']) =>
    apiRequest<T>({ method: 'GET', path, query }),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>({ method: 'POST', path, body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>({ method: 'PATCH', path, body: body ?? {} }),
  delete: <T = void>(path: string) => apiRequest<T>({ method: 'DELETE', path }),
};
