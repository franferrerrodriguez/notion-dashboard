import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService, authService, userService } from '../api';

// Example of service testing with mocks
describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches settings successfully', async () => {
    const mockSettings = { notion_database_id: '123' };

    const mockResponse = { status: 'success', data: mockSettings };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await settingsService.get();
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('action=settings_get'),
      expect.any(Object)
    );
  });

  it('throws error when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(settingsService.get()).rejects.toThrow();
  });
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('performs login successfully', async () => {
    const mockUser = { email: 'test@example.com', role: 'Admin' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: mockUser }),
    });

    const result = await authService.login('test@example.com', 'password');
    expect(result.status).toBe('success');
    expect(result.data).toEqual(mockUser);
  });

  it('handles login failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(authService.login('wrong@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('performs logout successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' }),
    });

    const result = await authService.logout();
    expect(result.status).toBe('success');
  });
});

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches users list', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: mockUsers }),
    });

    const result = await userService.getAll();
    expect(result.data).toEqual(mockUsers);
  });

  it('deletes a user', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' }),
    });

    const result = await userService.delete(1);
    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('action=users_delete&id=1'),
      expect.any(Object)
    );
  });
});
