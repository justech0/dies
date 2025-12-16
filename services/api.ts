
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
// REMOVED DELAY FOR SPEED
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
  // Construct headers first to ensure token is present for both Mock and Real fetch
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
      // await delay(400); // DELAY REMOVED
      
      // Parse the "virtual" endpoint URL
      const url = new URL(`http://localhost${endpoint}`);
      const path = url.pathname;
      const params = url.searchParams;
      const action = params.get('action');

      // 1. AUTH endpoints
      if (path.includes('api_auth.php')) {
          if (action === 'login') {
              const body = JSON.parse(options.body as string);
              const user = MOCK_USERS.find(u => u.email === body.email); 
              // For demo: Any password works if email matches
              if (user) {
                  return { user, token: `mock-token-${user.id}` } as any;
              }
              throw new Error('Kullanıcı bulunamadı veya şifre hatalı.');
          }
          if (action === 'register') {
               const body = JSON.parse(options.body as string);
               const newUser: User = { 
                   id: Math.floor(Math.random() * 10000) + 1000, 
                   ...body, 
                   role: 'user', 
                   type: 'user' 
               };
               MOCK_USERS.push(newUser);
               return { user: newUser, token: `mock-token-${newUser.id}` } as any;
          }
          if (action === 'me') {
              const authHeader = headers['Authorization'];
              if (authHeader) {
                  // Extract ID from "Bearer mock-token-ID"
                  const id = authHeader.includes('mock-token-') ? authHeader.split('mock-token-')[1] : null;
                  const user = MOCK_USERS.find(u => u.id.toString() === id);
                  if (user) {
                      // If user is advisor, merge advisor specific fields if needed
                      const advisor = MOCK_ADVISORS.find(a => a.id === user.id);
                      if (advisor) {
                          return { ...user, ...advisor } as any;
                      }
                      return user as any;
                  }
                  
                  // Fallback for demo stability if token format differs
                  return MOCK_USERS[0] as any;
              }
              throw new Error('Unauthorized');
          }
          if (action === 'update_profile') {
              const body = JSON.parse(options.body as string);
              const userId = body.id;
              
              // Update User Table
              const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
              if (userIndex > -1) {
                  MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...body };
              }

              // Update Advisor Table if exists
              const advisorIndex = MOCK_ADVISORS.findIndex(a => a.id === userId);
              if (advisorIndex > -1) {
                  MOCK_ADVISORS[advisorIndex] = { ...MOCK_ADVISORS[advisorIndex], ...body };
              }

              return { success: true, user: MOCK_USERS[userIndex] } as any;
          }
      }

      // 2. PROPERTIES endpoints
      if (path.includes('api_properties.php')) {
          if (action === 'list') {
              let props = MOCK_PROPERTIES.map(enrichProperty);
              
              // Apply Mock Filters
              if (params.get('is_featured')) {
                 props = props.slice(0, 6); // Just return top 6 as featured
              }
              if (params.get('advisorId')) {
                  props = props.filter(p => p.advisorId.toString() === params.get('advisorId'));
              }
              if (params.get('status')) { // Maps to type 'Satılık'/'Kiralık'
                   const status = params.get('status');
                   props = props.filter(p => p.type === status);
              }
              if (params.get('type')) { // Maps to category 'Konut'/'Arsa'
                   const cat = params.get('type');
                   props = props.filter(p => p.category === cat);
              }
              if (params.get('district')) {
                  const d = params.get('district')!.toLowerCase();
                  props = props.filter(p => 
                      p.title.toLowerCase().includes(d) || 
                      p.location.toLowerCase().includes(d) ||
                      p.district?.toLowerCase().includes(d)
                  );
              }
              return props as any;
          }
          if (action === 'detail') {
              const id = params.get('id');
              const prop = MOCK_PROPERTIES.find(p => p.id.toString() === id);
              if (prop) return enrichProperty(prop) as any;
              throw new Error('İlan bulunamadı');
          }
          if (action === 'create') {
               const body = JSON.parse(options.body as string);
               const newId = Math.floor(Math.random() * 10000);
               const newProp = { id: newId, ...body, date: new Date().toISOString().split('T')[0] };
               MOCK_PROPERTIES.push(newProp);
               return { success: true, id: newId } as any;
          }
          if (action === 'delete') {
               const body = JSON.parse(options.body as string);
               const idx = MOCK_PROPERTIES.findIndex(p => p.id === body.id);
               if (idx > -1) MOCK_PROPERTIES.splice(idx, 1);
               return { success: true } as any;
          }
          if (action === 'update') {
               const body = JSON.parse(options.body as string);
               const idx = MOCK_PROPERTIES.findIndex(p => p.id === body.id);
               if (idx > -1) {
                   MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...body };
               }
               return { success: true } as any;
          }
      }
      
      // 3. LOCATIONS endpoints
      if (path.includes('api_locations.php')) {
          const type = params.get('type');
          if (type === 'cities') {
              // Map keys to {id, name}
              return Object.keys(TURKEY_LOCATIONS).map((name, i) => ({ id: i+1, name })) as any;
          }
          if (type === 'districts') {
              const cityId = params.get('city_id');
              // Mock logic: find city by index (id-1)
              const cityName = Object.keys(TURKEY_LOCATIONS)[Number(cityId) - 1];
              if (cityName) {
                   const districts = TURKEY_LOCATIONS[cityName as keyof LocationData];
                   return Object.keys(districts).map((name, i) => ({ id: i+1, name })) as any;
              }
              return [] as any;
          }
          if (type === 'neighborhoods') {
              // Mock neighborhoods (static list for demo as mapping is complex without proper DB)
              return [
                  {id: 1, name: 'Merkez Mah.'}, {id: 2, name: 'Cumhuriyet Mah.'}, 
                  {id: 3, name: 'Yeni Mah.'}, {id: 4, name: 'Kültür Mah.'},
                  {id: 5, name: 'Gültepe Mah.'}, {id: 6, name: 'Bahçelievler Mah.'}
              ] as any; 
          }
      }

      // 4. ADVISORS endpoints
      if (path.includes('api_advisors.php')) {
          if (action === 'list') return MOCK_ADVISORS as any;
          if (action === 'detail') {
              const id = params.get('id');
              return MOCK_ADVISORS.find(a => a.id.toString() === id) as any;
          }
      }

      // 5. OFFICES endpoints
      if (path.includes('api_offices.php')) {
          if (action === 'list') return MOCK_OFFICES as any;
          if (action === 'create') {
              const body = JSON.parse(options.body as string);
              const newId = Math.floor(Math.random() * 10000);
              const newOffice = { id: newId, ...body, gallery: [] };
              MOCK_OFFICES.push(newOffice);
              return { success: true, id: newId } as any;
          }
          if (action === 'update') {
              const body = JSON.parse(options.body as string);
              const idx = MOCK_OFFICES.findIndex(o => o.id === body.id);
              if (idx > -1) {
                  MOCK_OFFICES[idx] = { ...MOCK_OFFICES[idx], ...body };
              }
              return { success: true } as any;
          }
          if (action === 'delete') {
              const body = JSON.parse(options.body as string);
              const idx = MOCK_OFFICES.findIndex(o => o.id === body.id);
              if (idx > -1) MOCK_OFFICES.splice(idx, 1);
              return { success: true } as any;
          }
      }

      // 6. UPLOAD endpoint
      if (path.includes('api_upload.php')) {
          // Return a mock URL for uploaded images
          return { urls: ['https://images.unsplash.com/photo-1600596542815-e3289cab6f61?auto=format&fit=crop&q=80&w=800'] } as any;
      }
      
      // 7. ADMIN endpoint
       if (path.includes('api_admin.php')) {
           if (action === 'stats') {
               return {
                   totalUsers: MOCK_USERS.length,
                   activeListings: MOCK_PROPERTIES.filter(p => p.type !== 'pending').length,
                   pendingListings: MOCK_PROPERTIES.filter(p => p.type === 'pending').length
               } as any;
           }
           if (action === 'pending_listings') {
               return MOCK_PROPERTIES.filter(p => p.type === 'pending').map(enrichProperty) as any;
           }
           if (action === 'users') return MOCK_USERS as any;
           if (action === 'approve_listing' || action === 'reject_listing') {
               const body = JSON.parse(options.body as string);
               const listing = MOCK_PROPERTIES.find(p => p.id === body.id);
               if (listing) {
                   listing.type = action === 'approve_listing' ? 'Satılık' : 'pending'; // Toggle for demo
                   if (action === 'reject_listing') {
                       // In real app, we might delete or set status='rejected'
                       const idx = MOCK_PROPERTIES.findIndex(p => p.id === body.id);
                       if (idx > -1) MOCK_PROPERTIES.splice(idx, 1);
                   }
               }
               return { success: true } as any;
           }
           if (action === 'change_role') {
               const body = JSON.parse(options.body as string);
               const u = MOCK_USERS.find(u => u.id === body.user_id);
               if (u) u.role = body.role;
               return { success: true } as any;
           }
           // New: Get Applications
           if (action === 'applications') {
               const type = params.get('type'); // 'advisor' or 'office'
               if (type === 'advisor') return MOCK_ADVISOR_APPLICATIONS as any;
               if (type === 'office') return MOCK_OFFICE_APPLICATIONS as any;
           }
           // New: Manage Applications
           if (action === 'manage_application') {
               const body = JSON.parse(options.body as string);
               if (body.type === 'advisor') {
                   const app = MOCK_ADVISOR_APPLICATIONS.find(a => a.id === body.id);
                   if (app) app.status = body.status;
               } else {
                   const app = MOCK_OFFICE_APPLICATIONS.find(a => a.id === body.id);
                   if (app) app.status = body.status;
               }
               return { success: true } as any;
           }
       }
       
       // 8. APPLICATIONS endpoint
       if (path.includes('api_applications.php')) {
           const actionName = params.get('action');
           const body = JSON.parse(options.body as string);
           
           if (actionName === 'advisor_application') {
               const newApp = { id: Math.floor(Math.random() * 1000), ...body, status: 'pending', date: new Date().toISOString().split('T')[0] };
               MOCK_ADVISOR_APPLICATIONS.push(newApp);
               return { success: true } as any;
           }
           if (actionName === 'office_application') {
               const newApp = { id: Math.floor(Math.random() * 1000), ...body, status: 'pending', date: new Date().toISOString().split('T')[0] };
               MOCK_OFFICE_APPLICATIONS.push(newApp);
               return { success: true } as any;
           }
       }

      throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }
  // --- MOCK ADAPTER END ---

  // Real Fetch Logic (Will be used when USE_MOCK_DATA is false)
  // Headers are already constructed above
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => request<{ user: User; token: string }>('/api_auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: any) => request<{ user: User; token: string }>('/api_auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    me: () => request<User>('/api_auth.php?action=me'),
    updateProfile: (data: any) => request<{ success: boolean, user: User }>('/api_auth.php?action=update_profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  locations: {
    getCities: () => request<any[]>('/api_locations.php?type=cities'),
    getDistricts: (cityId: number | string) => request<any[]>(`/api_locations.php?type=districts&city_id=${cityId}`),
    getNeighborhoods: (districtId: number | string) => request<any[]>(`/api_locations.php?type=neighborhoods&district_id=${districtId}`),
  },

  properties: {
    getList: (filters: any = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'Tümü' && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      return request<Property[]>(`/api_properties.php?action=list&${params.toString()}`);
    },
    getDetail: (id: string | number) => request<Property>(`/api_properties.php?action=detail&id=${id}`),
    create: (data: any) => request<{ success: boolean; id: number }>('/api_properties.php?action=create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => request<{ success: boolean }>('/api_properties.php?action=update', {
      method: 'POST',
      body: JSON.stringify({ ...data, id }),
    }),
    delete: (id: number) => request<{ success: boolean }>('/api_properties.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
  },

  upload: (formData: FormData) => request<{ urls: string[] }>('/api_upload.php', {
    method: 'POST',
    body: formData,
  }),

  admin: {
    getStats: () => request<any>('/api_admin.php?action=stats'),
    getPendingListings: () => request<Property[]>('/api_admin.php?action=pending_listings'),
    approveListing: (id: number) => request('/api_admin.php?action=approve_listing', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
    rejectListing: (id: number, reason: string) => request('/api_admin.php?action=reject_listing', {
      method: 'POST',
      body: JSON.stringify({ id, reason }),
    }),
    getUsers: () => request<User[]>('/api_admin.php?action=users'),
    changeRole: (userId: number, role: string) => request('/api_admin.php?action=change_role', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    }),
    getAdvisorApplications: () => request<AdvisorApplication[]>('/api_admin.php?action=applications&type=advisor'),
    getOfficeApplications: () => request<OfficeApplication[]>('/api_admin.php?action=applications&type=office'),
    manageApplication: (id: number, type: 'advisor' | 'office', status: string) => request('/api_admin.php?action=manage_application', {
        method: 'POST',
        body: JSON.stringify({ id, type, status })
    })
  },

  advisors: {
    getList: () => request<Advisor[]>('/api_advisors.php?action=list'),
    getDetail: (id: number) => request<Advisor>(`/api_advisors.php?action=detail&id=${id}`),
  },

  offices: {
    getList: () => request<Office[]>('/api_offices.php?action=list'),
    create: (data: any) => request<{ success: boolean; id: number }>('/api_offices.php?action=create', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    update: (id: number, data: any) => request<{ success: boolean }>('/api_offices.php?action=update', {
        method: 'POST',
        body: JSON.stringify({ ...data, id })
    }),
    delete: (id: number) => request<{ success: boolean }>('/api_offices.php?action=delete', {
        method: 'POST',
        body: JSON.stringify({ id })
    })
  },

  applications: {
    submitAdvisor: (data: any) => request('/api_applications.php?action=advisor_application', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitOffice: (data: any) => request('/api_applications.php?action=office_application', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
};
