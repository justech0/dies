import { Property, User, Advisor, Office, AdvisorApplication, OfficeApplication } from '../types';

// Use process.env as per GenAI guidelines to fix TS error on import.meta.env
const VITE_API_URL = (process.env as any).VITE_API_URL || '';
const API_BASE = `${VITE_API_URL}/api`;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dies_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = result.error?.message || result.message || `API Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return result.data !== undefined ? result.data : result;
}

export const api = {
  auth: {
    login: (data: any) => request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: any) => request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    me: () => request<User>('/auth/me'),
    updateProfile: (data: any) => request<{ success: boolean, user: User }>('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    forgotPassword: (email: string) => request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    resetPassword: (data: any) => request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  locations: {
    getCities: () => request<any[]>('/locations/cities'),
    getDistricts: (cityId: number | string) => request<any[]>(`/locations/districts?city_id=${cityId}`),
    getNeighborhoods: (districtId: number | string) => request<any[]>(`/locations/neighborhoods?district_id=${districtId}`),
  },

  properties: {
    getList: (filters: any = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== 'Tümü' && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      return request<Property[]>(`/properties?${params.toString()}`);
    },
    getDetail: (id: string | number) => request<Property>(`/properties/${id}`),
    create: (data: any) => request<{ success: boolean; id: number }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<{ success: boolean }>(`/properties/${id}`, {
      method: 'POST', // Handled as PATCH in spec, using POST for easier PHP compatibility if needed
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    }),
  },

  upload: (formData: FormData) => request<{ urls: string[] }>('/upload', {
    method: 'POST',
    body: formData,
  }),

  admin: {
    getStats: () => request<any>('/admin/stats'),
    getPendingListings: () => request<Property[]>('/admin/properties/pending'),
    approveListing: (id: number) => request(`/admin/properties/${id}/approve`, {
      method: 'POST',
    }),
    rejectListing: (id: number, reason: string) => request(`/admin/properties/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
    getUsers: () => request<User[]>('/admin/users'),
    changeRole: (userId: number, role: string) => request(`/admin/users/${userId}/change-role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
    resetUserPassword: (userId: number) => request<{ generatedPassword: string }>(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    }),
    getAdvisorApplications: () => request<AdvisorApplication[]>('/admin/applications?type=advisor'),
    getOfficeApplications: () => request<OfficeApplication[]>('/admin/applications?type=office'),
    manageApplication: (id: number, type: 'advisor' | 'office', status: string) => request(`/admin/applications/${id}`, {
      method: 'POST',
      body: JSON.stringify({ type, status })
    })
  },

  advisors: {
    getList: () => request<Advisor[]>('/advisors'),
    getDetail: (id: number) => request<Advisor>(`/advisors/${id}`),
  },

  offices: {
    getList: () => request<Office[]>('/offices'),
    create: (data: any) => request<{ success: boolean; id: number }>('/offices', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: number, data: any) => request<{ success: boolean }>(`/offices/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id: number) => request<{ success: boolean }>(`/offices/${id}`, {
      method: 'DELETE'
    })
  },

  applications: {
    submitAdvisor: (data: any) => request('/applications?type=advisor', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitOffice: (data: any) => request('/applications?type=office', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
};