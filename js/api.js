// ============================================================
// API Configuration — đổi BASE_URL thành Railway URL của bạn
// ============================================================
const BASE_URL = 'https://YOUR_RAILWAY_APP.railway.app';

// ============================================================
// Token Helpers
// ============================================================
const TOKEN_KEY = 'admin_token';
const USER_KEY  = 'admin_user';

export const Auth = {
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  token() { return localStorage.getItem(TOKEN_KEY); },
  user()  { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },
};

// ============================================================
// Core fetch wrapper
// ============================================================
async function request(method, path, body = null, isForm = false) {
  const headers = {};
  const token = Auth.token();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) options.body = isForm ? body : JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status === 401) {
    Auth.clear();
    window.location.hash = '#login';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  return data;
}

const get  = (path)        => request('GET',    path);
const post = (path, body, isForm) => request('POST',   path, body, isForm);
const patch= (path, body)  => request('PATCH',  path, body);
const del  = (path)        => request('DELETE', path);

// ============================================================
// API Endpoints
// ============================================================
export const API = {
  // Auth
  auth: {
    login  : (email, password) => post('/auth/login', { email, password }),
    profile: () => get('/auth/profile'),
  },

  // Products
  products: {
    list       : (query = {}) => get('/products?' + new URLSearchParams(query)),
    get        : (id)         => get(`/products/${id}`),
    create     : (data)       => post('/products', data),
    update     : (id, data)   => patch(`/products/${id}`, data),
    delete     : (id)         => del(`/products/${id}`),
    uploadImage: (formData)   => post('/products/upload-image', formData, true),
    updateImage: (id, formData) => request('PATCH', `/products/${id}/image`, formData, true),
  },

  // Categories
  categories: {
    list  : ()          => get('/categories'),
    get   : (id)        => get(`/categories/${id}`),
    create: (data)      => post('/categories', data),
    update: (id, data)  => patch(`/categories/${id}`, data),
    delete: (id)        => del(`/categories/${id}`),
  },

  // Orders
  orders: {
    list        : (userId) => get('/orders' + (userId ? `?userId=${userId}` : '')),
    get         : (id)     => get(`/orders/${id}`),
    updateStatus: (id, status) => patch(`/orders/${id}/status`, { status }),
  },

  // Users
  users: {
    list  : ()          => get('/users'),
    get   : (id)        => get(`/users/${id}`),
    create: (data)      => post('/users', data),
    update: (id, data)  => patch(`/users/${id}`, data),
    delete: (id)        => del(`/users/${id}`),
  },

  // Payments
  payments: {
    getByOrder: (orderId) => get(`/payments/order/${orderId}`),
  },
};
