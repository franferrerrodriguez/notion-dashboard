const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

export const projectService = {
  async getAll(clientId = null, type = 'projects', signal, viewUserId = null) {
    let url = `${BASE_URL}/index.php?action=list&type=${type}`;
    if (viewUserId) url += `&viewUserId=${viewUserId}`;
    else if (clientId) url += `&clientId=${clientId}`;

    const response = await fetch(url, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch ${type}`);
    return await response.json();
  },

  async getById(id, signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail&id=${id}`, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch project ${id}`);
    return await response.json();
  },

  async getTasks(id, signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_tasks&id=${id}`, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch project tasks ${id}`);
    return await response.json();
  },

  async getInteractions(id, signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_interactions&id=${id}`, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch project interactions ${id}`);
    return await response.json();
  },

  async getDeliveries(id, signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_deliveries&id=${id}`, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch project deliveries ${id}`);
    return await response.json();
  },

  async getContacts(id, signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=detail_contacts&id=${id}`, { ...fetchConfig, signal });
    if (!response.ok) throw new Error(`Failed to fetch project contacts ${id}`);
    return await response.json();
  },

  async getClientOptions(signal) {
    const response = await fetch(`${BASE_URL}/index.php?action=client_options`, { ...fetchConfig, signal });
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

  async getUnreadStatus(clientId, signal, viewUserId = null) {
    let url = `${BASE_URL}/index.php?action=unread_status`;
    if (viewUserId) url += `&viewUserId=${encodeURIComponent(viewUserId)}`;
    else if (clientId) url += `&client_id=${encodeURIComponent(clientId)}`;
    const response = await fetch(url, { ...fetchConfig, signal });
    if (!response.ok) throw new Error('Failed to fetch unread status');
    return await response.json();
  },

  async getClientInfo(clientId, signal, viewUserId = null) {
    let url = `${BASE_URL}/index.php?action=client_info`;
    if (viewUserId) url += `&viewUserId=${encodeURIComponent(viewUserId)}`;
    else if (clientId) url += `&client_id=${encodeURIComponent(clientId)}`;
    const response = await fetch(url, { ...fetchConfig, signal });
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

export const appService = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/index.php?action=apps_all`, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch apps');
    return await response.json();
  },

  async getForUser(userId, externalClientId = null, viewUserId = null) {
    let url = `${BASE_URL}/index.php?action=apps_user&user_id=${userId}`;
    if (viewUserId) {
      url += `&viewUserId=${viewUserId}`;
    } else if (externalClientId) {
      url += `&external_client_id=${externalClientId}`;
    }
    const response = await fetch(url, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch user apps');
    return await response.json();
  },
};

export const fileService = {
  async getForUser(userId, externalClientId = null, viewUserId = null) {
    let url = `${BASE_URL}/index.php?action=files_user&user_id=${userId}`;
    if (viewUserId) {
      url += `&viewUserId=${viewUserId}`;
    } else if (externalClientId) {
      url += `&external_client_id=${externalClientId}`;
    }
    const response = await fetch(url, fetchConfig);
    if (!response.ok) throw new Error('Failed to fetch user files');
    return await response.json();
  },

  async upload(userId, file, category = 'General') {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch(`${BASE_URL}/index.php?action=files_upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.json();
  },

  async delete(fileId) {
    const response = await fetch(`${BASE_URL}/index.php?action=files_delete&id=${fileId}`, {
      ...fetchConfig,
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return await response.json();
  },

  getDownloadUrl(fileId) {
    return `${BASE_URL}/index.php?action=files_download&id=${fileId}`;
  },
};
