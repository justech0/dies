
import { Property, User, Advisor, Office, AdvisorApplication, OfficeApplication, Place, LocationItem } from '../types';

const getApiUrl = () => {
  try {
    // @ts-ignore
    return (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
  } catch {
    return '';
  }
};

const VITE_API_URL = getApiUrl();
const API_BASE = VITE_API_URL ? `${VITE_API_URL}/api` : '/api';

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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) return {} as T;

    // API 404 veriyorsa ve bu bir liste isteği ise boş array dön (Hata fırlatıp UI'ı bozma)
    if (response.status === 404) {
      console.warn(`API Not Found (404): ${endpoint}. Sunucu henüz hazır değil veya URL yanlış.`);
      if (endpoint.includes('list') || endpoint.includes('properties') || endpoint.includes('advisors') || endpoint.includes('cities')) {
        return [] as unknown as T;
      }
      throw new Error("İstediğiniz kaynak bulunamadı.");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();
      
      if (!response.ok || result.success === false) {
        const errorMessage = result.error?.message || result.message || `İşlem başarısız (Hata: ${response.status})`;
        throw new Error(errorMessage);
      }
      
      return result.data !== undefined ? result.data : result;
    } else {
      if (!response.ok) throw new Error(`Sunucu Hatası: ${response.status}`);
      return {} as T;
    }
  } catch (error) {
    // Liste çekme isteklerinde hata fırlatmak yerine boş liste dönerek UI'ı koru
    if (endpoint.includes('list') || endpoint.includes('properties') || endpoint.includes('advisors') || endpoint.includes('cities')) {
      console.error("Bağlantı hatası, boş veri dönülüyor:", error);
      return [] as unknown as T;
    }
    throw error;
  }
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
    getCities: () => request<LocationItem[]>('/locations/cities'),
    getDistricts: (cityId: number | string) => request<LocationItem[]>(`/locations/districts?city_id=${cityId}`),
    getNeighborhoods: (districtId: number | string) => request<Place[]>(`/locations/neighborhoods?district_id=${districtId}`),
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
