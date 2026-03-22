const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

export const projectService = {
  async getAll(clientId = null, type = 'projects') {
    let url = `${BASE_URL}/index.php?action=list&type=${type}`;
    if (clientId) url += `&clientId=${clientId}`;
    
    const response = await fetch(url, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch ${type}`);
    const data = await response.json();
    return data;
  },

  async getById(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail&id=${id}`, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch project ${id}`);
    return await response.json();
  },
  async getTasks(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_tasks&id=${id}`, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch project tasks ${id}`);
    return await response.json();
  },
  async getInteractions(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_interactions&id=${id}`, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch project interactions ${id}`);
    return await response.json();
  },
  async getDeliveries(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_deliveries&id=${id}`, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch project deliveries ${id}`);
    return await response.json();
  },
  async getContacts(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_contacts&id=${id}`, fetchConfig);
    if (!response.ok) throw new Error(`Failed to fetch project contacts ${id}`);
    return await response.json();
  },

  async getClientOptions() {
    const response = await fetch(`${BASE_URL}/index.php?action=client_options`, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch client options');
    return await response.json();
  },
  async markRead(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=mark_read&id=${encodeURIComponent(id)}`, {
      ...fetchConfig,
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Failed to mark as read ${id}`);
    return await response.json();
  },
  async markAllRead() {
    const response = await fetch(`${BASE_URL}/index.php?action=mark_all_read`, {
      ...fetchConfig,
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return await response.json();
  },
  async getUnreadStatus(clientId) {
    const url = `${BASE_URL}/index.php?action=unread_status${clientId ? `&client_id=${encodeURIComponent(clientId)}` : ''}`;
    const response = await fetch(url, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch unread status');
    return await response.json();
  },
  async getClientInfo(clientId) {
    const url = `${BASE_URL}/index.php?action=client_info${clientId ? `&client_id=${encodeURIComponent(clientId)}` : ''}`;
    const response = await fetch(url, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch client info');
    return await response.json();
  },
};

export const authService = {
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/index.php?action=login`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
  },

  async logout() {
    const response = await fetch(`${BASE_URL}/index.php?action=logout`, {
      ...fetchConfig,
      method: 'POST',
    });
    return await response.json();
  },

  async me() {
    const response = await fetch(`${BASE_URL}/index.php?action=me`, fetchConfig);
    if (!response.ok) throw new Error('Not authenticated');
    return await response.json();
  },

  async updatePassword(password) {
    const response = await fetch(`${BASE_URL}/index.php?action=profile_update_password`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error('Failed to update password');
    return await response.json();
  },
};

export const settingsService = {
  async get() {
    const response = await fetch(`${BASE_URL}/index.php?action=settings_get`, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  },
  async save(settings) {
    const response = await fetch(`${BASE_URL}/index.php?action=settings_save`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to save settings');
    return await response.json();
  },
};

export const userService = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/index.php?action=users_list`, fetchConfig);
    if (!response.ok) throw new Error('Forbidden');
    return await response.json();
  },

  async create(userData) {
    const response = await fetch(`${BASE_URL}/index.php?action=users_create`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  async update(id, userData) {
    const response = await fetch(`${BASE_URL}/index.php?action=users_update&id=${id}`, {
      ...fetchConfig,
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  async delete(id) {
    const response = await fetch(`${BASE_URL}/index.php?action=users_delete&id=${id}`, {
      ...fetchConfig,
      method: 'DELETE',
    });
    return await response.json();
  },
};
