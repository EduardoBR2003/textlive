import type {
  CreateSessionResponse,
  VerifySessionResponse,
  JoinSessionResponse,
  Session,
} from '@/types/session';
import { SessionPermission } from '@/types/session';

const API_BASE = '/api/sessions';

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const sessionApi = {
  createSession(data?: {
    password?: string;
    permission?: SessionPermission;
    deviceLimit?: number;
  }): Promise<CreateSessionResponse> {
    return request<CreateSessionResponse>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  verifySession(slug: string): Promise<VerifySessionResponse> {
    return request<VerifySessionResponse>(`${API_BASE}/${encodeURIComponent(slug)}/verify`);
  },

  getSession(slug: string): Promise<Session> {
    return request<Session>(`${API_BASE}/${encodeURIComponent(slug)}`);
  },

  joinSession(
    slug: string,
    data: { deviceId: string; password?: string },
  ): Promise<JoinSessionResponse> {
    return request<JoinSessionResponse>(
      `${API_BASE}/${encodeURIComponent(slug)}/join`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  },

  updateContent(slug: string, data: { content: string; ownerToken: string }) {
    return request<{ slug: string; content: string; updatedAt: string }>(
      `${API_BASE}/${encodeURIComponent(slug)}/content`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  updatePermissions(
    slug: string,
    data: {
      permission?: SessionPermission;
      deviceLimit?: number;
      ownerToken: string;
    },
  ) {
    return request<{ slug: string; permission: string; deviceLimit: number }>(
      `${API_BASE}/${encodeURIComponent(slug)}/permissions`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  updatePassword(
    slug: string,
    data: { password?: string | null; ownerToken: string },
  ) {
    return request<{ slug: string; hasPassword: boolean }>(
      `${API_BASE}/${encodeURIComponent(slug)}/password`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  deleteSession(slug: string, ownerToken: string): Promise<void> {
    return request<void>(`${API_BASE}/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      body: JSON.stringify({ ownerToken }),
    });
  },

  verifyOwner(slug: string, ownerToken: string): Promise<{ valid: boolean }> {
    return request<{ valid: boolean }>(
      `${API_BASE}/${encodeURIComponent(slug)}/owner/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ ownerToken }),
      },
    );
  },

  getDeviceCount(slug: string): Promise<{ count: number }> {
    return request<{ count: number }>(
      `${API_BASE}/${encodeURIComponent(slug)}/devices`,
    );
  },
};
