const API_BASE = import.meta.env.VITE_API_URL ?? '';

function adminHeaders() {
  const token = localStorage.getItem('dd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function userHeaders() {
  const token = localStorage.getItem('dp_user_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function json() { return { 'Content-Type': 'application/json' }; }

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  base: API_BASE,

  // ── Admin auth ──
  login: (email, password) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email, password })
    }).then(handle),

  // ── User auth ──
  userRegister: (name, email, password, phone) =>
    fetch(`${API_BASE}/api/user/register`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ name, email, password, phone })
    }).then(handle),

  userLogin: (email, password) =>
    fetch(`${API_BASE}/api/user/login`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email, password })
    }).then(handle),

  // ── Products (public) ──
  getProducts: (category) =>
    fetch(`${API_BASE}/api/products${category ? `?category=${category}` : ''}`).then(handle),

  getProduct: (id) =>
    fetch(`${API_BASE}/api/products/${id}`).then(handle),

  getProductRating: (id) =>
    fetch(`${API_BASE}/api/products/${id}/rating`).then(handle),

  // ── Products (admin) ──
  getAdminProducts: () =>
    fetch(`${API_BASE}/api/admin/products`, { headers: adminHeaders() }).then(handle),

  createProduct: (formData) =>
    fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST', headers: adminHeaders(), body: formData
    }).then(handle),

  updateProduct: (id, formData) =>
    fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: 'PUT', headers: adminHeaders(), body: formData
    }).then(handle),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: 'DELETE', headers: adminHeaders()
    }).then(handle),

  // ── Orders ──
  createOrder: (data) =>
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { ...json(), ...userHeaders() },
      body: JSON.stringify(data)
    }).then(handle),

  // ── Orders (admin) ──
  getAdminOrders: () =>
    fetch(`${API_BASE}/api/admin/orders`, { headers: adminHeaders() }).then(handle),

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
      method: 'PUT', headers: { ...json(), ...adminHeaders() },
      body: JSON.stringify({ status })
    }).then(handle),

  deleteOrder: (id) =>
    fetch(`${API_BASE}/api/admin/orders/${id}`, {
      method: 'DELETE', headers: adminHeaders()
    }).then(handle),

  // ── Reviews (public) ──
  getReviews: (productId) =>
    fetch(`${API_BASE}/api/reviews${productId ? `?product_id=${productId}` : ''}`).then(handle),

  submitReview: (data) => {
    // data can include files — use FormData when images present
    if (data instanceof FormData) {
      return fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: userHeaders(),
        body: data
      }).then(handle);
    }
    return fetch(`${API_BASE}/api/reviews`, {
      method: 'POST', headers: { ...json(), ...userHeaders() },
      body: JSON.stringify(data)
    }).then(handle);
  },

  markHelpful: (id) =>
    fetch(`${API_BASE}/api/reviews/${id}/helpful`, {
      method: 'POST'
    }).then(handle),

  // ── Reviews (admin) ──
  getAdminReviews: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return fetch(`${API_BASE}/api/admin/reviews${q ? `?${q}` : ''}`, { headers: adminHeaders() }).then(handle);
  },

  getAdminReviewStats: () =>
    fetch(`${API_BASE}/api/admin/reviews/stats`, { headers: adminHeaders() }).then(handle),

  toggleApproveReview: (id) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/approve`, {
      method: 'PUT', headers: adminHeaders()
    }).then(handle),

  setReviewStatus: (id, status) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/status`, {
      method: 'PUT', headers: { ...json(), ...adminHeaders() },
      body: JSON.stringify({ status })
    }).then(handle),

  toggleVerifiedReview: (id) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/verified`, {
      method: 'PUT', headers: adminHeaders()
    }).then(handle),

  toggleFeatureReview: (id) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/feature`, {
      method: 'PUT', headers: adminHeaders()
    }).then(handle),

  togglePinReview: (id) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/pin`, {
      method: 'PUT', headers: adminHeaders()
    }).then(handle),

  replyToReview: (id, reply) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}/reply`, {
      method: 'PUT', headers: { ...json(), ...adminHeaders() },
      body: JSON.stringify({ reply })
    }).then(handle),

  deleteReview: (id) =>
    fetch(`${API_BASE}/api/admin/reviews/${id}`, {
      method: 'DELETE', headers: adminHeaders()
    }).then(handle),

  bulkReviewAction: (ids, action) =>
    fetch(`${API_BASE}/api/admin/reviews/bulk`, {
      method: 'POST', headers: { ...json(), ...adminHeaders() },
      body: JSON.stringify({ ids, action })
    }).then(handle),

  // ── Contact ──
  sendContactMessage: (data) =>
    fetch(`${API_BASE}/api/contact`, {
      method: 'POST', headers: json(),
      body: JSON.stringify(data)
    }).then(handle),

  // ── Site settings ──
  getSettings: () =>
    fetch(`${API_BASE}/api/settings`).then(handle),

  getAdminSettings: () =>
    fetch(`${API_BASE}/api/admin/settings`, { headers: adminHeaders() }).then(handle),

  updateSettings: (formData) =>
    fetch(`${API_BASE}/api/admin/settings`, {
      method: 'PUT', headers: adminHeaders(), body: formData
    }).then(handle),

  // ── Users (admin) ──
  getAdminUsers: () =>
    fetch(`${API_BASE}/api/admin/users`, { headers: adminHeaders() }).then(handle),

  deleteUser: (id) =>
    fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE', headers: adminHeaders()
    }).then(handle),
};
