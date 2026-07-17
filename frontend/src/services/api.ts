const BASE_URL = 'http://localhost:5073/api';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  organizationName?: string;
  expiresAt: string;
}

export interface InviteResponse {
  message: string;
  inviteLink: string;
  token: string;
  expiresAt: string;
}

export interface InviteInfo {
  invitedEmail: string;
  organizationName: string;
  expiresAt: string;
}

export interface PendingRecruiter {
  id: string;
  fullName: string;
  email: string;
  organizationName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tp_token');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const authApi = {
  // Candidate
  login: (payload: { email: string; password: string }) =>
    request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Recruiter self-registration (returns message only, no token)
  registerRecruiter: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
  }) =>
    request<{ message: string }>('/auth/register-recruiter', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Hiring Manager invite flow
  inviteHiringManager: (payload: { email: string }) =>
    request<InviteResponse>('/auth/invite-hiring-manager', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  validateInvite: (token: string) =>
    request<InviteInfo>(`/auth/validate-invite?token=${encodeURIComponent(token)}`),

  registerHiringManager: (payload: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<ApiResponse<AuthResponse>>('/auth/register-hiring-manager', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  organizationName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminApi = {
  getPendingRecruiters: () =>
    request<PendingRecruiter[]>('/admin/pending-recruiters'),

  approveRecruiter: (id: string) =>
    request<{ message: string }>(`/admin/recruiters/${id}/approve`, {
      method: 'PUT',
    }),

  rejectRecruiter: (id: string) =>
    request<{ message: string }>(`/admin/recruiters/${id}/reject`, {
      method: 'PUT',
    }),

  getUsers: (role?: string, page = 1, pageSize = 100) => {
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
    return request<PagedResult<BackendUser>>(`/admin/users?page=${page}&pageSize=${pageSize}${roleParam}`);
  },
};

export const recruiterApi = {
  inviteHiringManager: (payload: { email: string }) =>
    authApi.inviteHiringManager(payload),
};
