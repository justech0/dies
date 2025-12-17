import { Property, User, Advisor, Office, AdvisorApplication, OfficeApplication } from '../types';

// Fix: Property 'env' does not exist on type 'ImportMeta'. Using any cast to bypass TypeScript error for Vite environment variables.
const VITE_API_URL = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');
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

  if (response.status === 204) return {} as T;

  const result = await response.json().catch(() => ({ 
    success: false, 
    error: { message: 'Sunucu yanıtı okunamadı.' } 
  }));

  if (!response.ok || result.success === false) {
    const errorMessage = result.error?.message || result.message || `İşlem başarısız (Hata: ${response.status})`;
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
    updateProfile: (data: any) => request<{ user: User }>('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    forgotPassword: (email: string) => request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    resetPassword: (data: any) => request<{ message: string }>('/auth/reset-password', {
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
    create: (data: any) => request<{ id: number }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<any>(`/properties/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request<any>(`/properties/${id}`, {
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
    changeRole: (userId: number, role: string) => request(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
    resetUserPassword: (userId: number) => request<{ generatedPassword: string }>(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    }),
    getAdvisorApplications: () => request<AdvisorApplication[]>('/admin/applications?type=advisor'),
    getOfficeApplications: () => request<OfficeApplication[]>('/admin/applications?type=office'),
    manageApplication: (id: number, status: string) => request(`/admin/applications/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
  },

  advisors: {
    getList: () => request<Advisor[]>('/advisors'),
    getDetail: (id: number) => request<Advisor>(`/advisors/${id}`),
  },

  offices: {
    getList: () => request<Office[]>('/offices'),
    create: (data: any) => request<{ id: number }>('/offices', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: number, data: any) => request<any>(`/offices/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id: number) => request<any>(`/offices/${id}`, {
      method: 'DELETE'
    })
  },

  applications: {
    submitAdvisor: (data: any) => request('/applications/advisor', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitOffice: (data: any) => request('/applications/office', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
};