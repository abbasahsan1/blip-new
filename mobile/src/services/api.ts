import { getToken } from './auth';

export const API_BASE_URL = 'https://blipp-backend-latest.onrender.com';

export interface Blipp {
  id: string;
  creator_id: string;
  creator_username: string;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface FeedResponse {
  items: Blipp[];
  next_cursor: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  code: string;
  message: string;
  request_id?: string;
}

export class ApiRequestError extends Error {
  code: string;
  requestId?: string;
  status: number;

  constructor(status: number, error: ApiError) {
    super(error.message || 'API request failed');
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = error.code || `${status}`;
    this.requestId = error.request_id;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errBody: any;
    try {
      errBody = await res.json();
    } catch {
      errBody = { error: { code: `${res.status}`, message: res.statusText } };
    }
    const errObj = errBody.error || {
      code: `${res.status}`,
      message: typeof errBody.detail === 'string' ? errBody.detail : JSON.stringify(errBody.detail || 'Request failed'),
    };
    throw new ApiRequestError(res.status, errObj);
  }
  return (await res.json()) as T;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function signupApi(
  email: string,
  username: string,
  pass: string
): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.append('email', email.trim().toLowerCase());
  form.append('username', username.trim());
  form.append('password', pass);

  const res = await fetch(`${API_BASE_URL}/v1/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  return handleResponse<TokenResponse>(res);
}

export async function loginApi(
  email: string,
  pass: string
): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.append('email', email.trim().toLowerCase());
  form.append('password', pass);

  const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  return handleResponse<TokenResponse>(res);
}

// ── Feed ───────────────────────────────────────────────────────────────────

export async function fetchFeedApi(
  cursor?: string | null,
  limit: number = 20
): Promise<FeedResponse> {
  let url = `${API_BASE_URL}/v1/feed?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<FeedResponse>(res);
}

export async function fetchBlippDetailApi(blippId: string): Promise<Blipp> {
  const res = await fetch(`${API_BASE_URL}/v1/blipps/${blippId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<Blipp>(res);
}

// ── Upload ─────────────────────────────────────────────────────────────────

import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export async function uploadBlippApi(
  title: string,
  file: { uri: string; name: string; type?: string }
): Promise<Blipp> {
  const token = await getToken();
  if (!token) {
    throw new ApiRequestError(401, {
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to upload audio clips',
    });
  }

  if (Platform.OS !== 'web') {
    const res = await FileSystem.uploadAsync(`${API_BASE_URL}/v1/uploads`, file.uri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      parameters: {
        title: title.trim(),
      },
      mimeType: file.type || 'audio/mpeg',
    });

    if (res.status < 200 || res.status >= 300) {
      let errBody: any;
      try {
        errBody = JSON.parse(res.body);
      } catch {
        errBody = { error: { code: `${res.status}`, message: res.body || 'Upload failed' } };
      }
      const errObj = errBody.error || {
        code: `${res.status}`,
        message:
          typeof errBody.detail === 'string'
            ? errBody.detail
            : JSON.stringify(errBody.detail || 'Upload failed'),
      };
      throw new ApiRequestError(res.status, errObj);
    }

    return JSON.parse(res.body) as Blipp;
  } else {
    // Web fallback using standard Web Blob
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('file', blob, file.name || 'audio.mp3');

    const res = await fetch(`${API_BASE_URL}/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse<Blipp>(res);
  }
}

