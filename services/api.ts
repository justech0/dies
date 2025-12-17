
import { Property, User, Advisor, Office, LocationData, AdvisorApplication, OfficeApplication } from '../types';
import { 
    MOCK_PROPERTIES, 
    MOCK_ADVISORS, 
    MOCK_OFFICES, 
    MOCK_USERS, 
    TURKEY_LOCATIONS,
    MOCK_ADVISOR_APPLICATIONS,
    MOCK_OFFICE_APPLICATIONS
} from './mockData';

const API_BASE = '/api';
const USE_MOCK_DATA = true; // Set this to false when the PHP backend is ready

// Helper to simulate network delay for realistic loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, 0));

// Helper: Join Advisor info to Property for display consistency
const enrichProperty = (p: Property): Property => {
    const advisor = MOCK_ADVISORS.find(a => a.id === p.advisorId);
    return {
        ...p,
        advisorName: advisor?.name,
        advisorImage: advisor?.image
    };
};

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

  // --- MOCK ADAPTER START ---
  if (USE_MOCK_DATA) {
      const url = new URL(`http://localhost${endpoint}`);
      const path = url.pathname;
      const params = url.searchParams;
      const action = params.get('action');

      if (path.includes('api_auth.php')) {
          if (action === 'login') {
              const body = JSON.parse(options.body as string);
              const user = MOCK_USERS.find(u => u.email === body.email); 
              if (user) return { user, token: `mock-token-${user.id}` } as any;
              throw new Error('Kullanıcı bulunamadı veya şifre hatalı.');
          }
          if (action === 'register') {
               const body = JSON.parse(options.body as string);
               const newUser: User = { id: Math.floor(Math.random() * 10000) + 1000, ...body, role: 'user', type: 'user' };
               MOCK_USERS.push(newUser);
               return { user: newUser, token: `mock-token-${newUser.id}` } as any;
          }
          if (action === 'me') {
              const authHeader = headers['Authorization'];
              if (authHeader) {
                  const id = authHeader.includes('mock-token-') ? authHeader.split('mock-token-')[1] : null;
                  const user = MOCK_USERS.find(u => u.id.toString() === id);
                  if (user) {
                      const advisor = MOCK_ADVISORS.find(a => a.id === user.id);
                      return advisor ? { ...user, ...advisor } : user as any;
                  }
                  return MOCK_USERS[0] as any;
              }
              throw new Error('Unauthorized');
          }
          if (action === 'update_profile') {
              const body = JSON.parse(options.body as string);
              const userIndex = MOCK_USERS.findIndex(u => u.id === body.id);
              if (userIndex > -1) MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...body };
              const advisorIndex = MOCK_ADVISORS.findIndex(a => a.id === body.id);
              if (advisorIndex > -1) MOCK_ADVISORS[advisorIndex] = { ...MOCK_ADVISORS[advisorIndex], ...body };
              return { success: true, user: MOCK_USERS[userIndex] } as any;
          }
          if (action === 'forgot_password') {
              return { success: true, message: 'Mock: Şifre sıfırlama emaili gönderildi.' } as any;
          }
          if (action === 'reset_password') {
              return { success: true, message: 'Mock: Şifre başarıyla sıfırlandı.' } as any;
          }
      }

      if (path.includes('api_properties.php')) {
          if (action === 'list') {
              let props = MOCK_PROPERTIES.map(enrichProperty);
              if (params.get('is_featured')) props = props.slice(0, 6);
              if (params.get('advisorId')) props = props.filter(p => p.advisorId.toString() === params.get('advisorId'));
              return props as any;
          }
          if (action === 'detail') {
              const prop = MOCK_PROPERTIES.find(p => p.id.toString() === params.get('id'));
              if (prop) return enrichProperty(prop) as any;
              throw new Error('İlan bulunamadı');
          }
          if (action === 'create') {
               const body = JSON.parse(options.body as string);
               const newId = Math.floor(Math.random() * 10000);
               MOCK_PROPERTIES.push({ id: newId, ...body, date: new Date().toISOString().split('T')[0] });
               return { success: true, id: newId } as any;
          }
          if (action === 'delete') {
               const idx = MOCK_PROPERTIES.findIndex(p => p.id === JSON.parse(options.body as string).id);
               if (idx > -1) MOCK_PROPERTIES.splice(idx, 1);
               return { success: true } as any;
          }
          if (action === 'update') {
               const body = JSON.parse(options.body as string);
               const idx = MOCK_PROPERTIES.findIndex(p => p.id === body.id);
               if (idx > -1) MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...body };
               return { success: true } as any;
          }
      }
      
      if (path.includes('api_locations.php')) {
          const type = params.get('type');
          if (type === 'cities') return Object.keys(TURKEY_LOCATIONS).map((name, i) => ({ id: i+1, name })) as any;
          if (type === 'districts') {
              const cityName = Object.keys(TURKEY_LOCATIONS)[Number(params.get('city_id')) - 1];
              return cityName ? Object.keys(TURKEY_LOCATIONS[cityName]).map((name, i) => ({ id: i+1, name })) : [] as any;
          }
          if (type === 'neighborhoods') return [{id: 1, name: 'Merkez Mah.'}, {id: 2, name: 'Cumhuriyet Mah.'}] as any; 
      }

      if (path.includes('api_advisors.php')) {
          if (action === 'list') return MOCK_ADVISORS as any;
          if (action === 'detail') return MOCK_ADVISORS.find(a => a.id.toString() === params.get('id')) as any;
      }

      if (path.includes('api_offices.php')) {
          if (action === 'list') return MOCK_OFFICES as any;
          if (action === 'create') {
              const newId = Math.floor(Math.random() * 10000);
              MOCK_OFFICES.push({ id: newId, ...JSON.parse(options.body as string), gallery: [] });
              return { success: true, id: newId } as any;
          }
          if (action === 'update') {
              const body = JSON.parse(options.body as string);
              const idx = MOCK_OFFICES.findIndex(o => o.id === body.id);
              if (idx > -1) MOCK_OFFICES[idx] = { ...MOCK_OFFICES[idx], ...body };
              return { success: true } as any;
          }
          if (action === 'delete') {
              const idx = MOCK_OFFICES.findIndex(o => o.id === JSON.parse(options.body as string).id);
              if (idx > -1) MOCK_OFFICES.splice(idx, 1);
              return { success: true } as any;
          }
      }

      if (path.includes('api_upload.php')) return { urls: ['https://images.unsplash.com/photo-1600596542815-e3289cab6f61?auto=format&fit=crop&q=80&w=800'] } as any;
      
       if (path.includes('api_admin.php')) {
           if (action === 'stats') return { totalUsers: MOCK_USERS.length, activeListings: MOCK_PROPERTIES.length, pendingListings: 2 } as any;
           if (action === 'pending_listings') return MOCK_PROPERTIES.filter(p => p.type === 'pending').map(enrichProperty) as any;
           if (action === 'users') return MOCK_USERS as any;
           if (action === 'applications') return params.get('type') === 'advisor' ? MOCK_ADVISOR_APPLICATIONS : MOCK_OFFICE_APPLICATIONS as any;
           return { success: true } as any;
       }
       
       if (path.includes('api_applications.php')) return { success: true } as any;

      throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => request<{ user: User; token: string }>('/api_auth.php?action=login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => request<{ user: User; token: string }>('/api_auth.php?action=register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/api_auth.php?action=me'),
    updateProfile: (data: any) => request<{ success: boolean, user: User }>('/api_auth.php?action=update_profile', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (email: string) => request<{ success: boolean; message: string }>('/api_auth.php?action=forgot_password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: any) => request<{ success: boolean; message: string }>('/api_auth.php?action=reset_password', { method: 'POST', body: JSON.stringify(data) }),
  },
  locations: {
    getCities: () => request<any[]>('/api_locations.php?type=cities'),
    getDistricts: (cityId: number | string) => request<any[]>(`/api_locations.php?type=districts&city_id=${cityId}`),
    getNeighborhoods: (districtId: number | string) => request<any[]>(`/api_locations.php?type=neighborhoods&district_id=${districtId}`),
  },
  properties: {
    getList: (filters: any = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => { if (filters[key] && filters[key] !== 'Tümü') params.append(key, filters[key]); });
      return request<Property[]>(`/api_properties.php?action=list&${params.toString()}`);
    },
    getDetail: (id: string | number) => request<Property>(`/api_properties.php?action=detail&id=${id}`),
    create: (data: any) => request<{ success: boolean; id: number }>('/api_properties.php?action=create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<{ success: boolean }>('/api_properties.php?action=update', { method: 'POST', body: JSON.stringify({ ...data, id }) }),
    delete: (id: number) => request<{ success: boolean }>('/api_properties.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) }),
  },
  upload: (formData: FormData) => request<{ urls: string[] }>('/api_upload.php', { method: 'POST', body: formData }),
  admin: {
    getStats: () => request<any>('/api_admin.php?action=stats'),
    getPendingListings: () => request<Property[]>('/api_admin.php?action=pending_listings'),
    approveListing: (id: number) => request('/api_admin.php?action=approve_listing', { method: 'POST', body: JSON.stringify({ id }) }),
    rejectListing: (id: number, reason: string) => request('/api_admin.php?action=reject_listing', { method: 'POST', body: JSON.stringify({ id, reason }) }),
    getUsers: () => request<User[]>('/api_admin.php?action=users'),
    changeRole: (userId: number, role: string) => request('/api_admin.php?action=change_role', { method: 'POST', body: JSON.stringify({ user_id: userId, role }) }),
    getAdvisorApplications: () => request<AdvisorApplication[]>('/api_admin.php?action=applications&type=advisor'),
    getOfficeApplications: () => request<OfficeApplication[]>('/api_admin.php?action=applications&type=office'),
    manageApplication: (id: number, type: 'advisor' | 'office', status: string) => request('/api_admin.php?action=manage_application', { method: 'POST', body: JSON.stringify({ id, type, status }) })
  },
  advisors: {
    getList: () => request<Advisor[]>('/api_advisors.php?action=list'),
    getDetail: (id: number) => request<Advisor>(`/api_advisors.php?action=detail&id=${id}`),
  },
  offices: {
    getList: () => request<Office[]>('/api_offices.php?action=list'),
    create: (data: any) => request<{ success: boolean; id: number }>('/api_offices.php?action=create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<{ success: boolean }>('/api_offices.php?action=update', { method: 'POST', body: JSON.stringify({ ...data, id }) }),
    delete: (id: number) => request<{ success: boolean }>('/api_offices.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) })
  },
  applications: {
    submitAdvisor: (data: any) => request('/api_applications.php?action=advisor_application', { method: 'POST', body: JSON.stringify(data) }),
    submitOffice: (data: any) => request('/api_applications.php?action=office_application', { method: 'POST', body: JSON.stringify(data) })
  }
};
