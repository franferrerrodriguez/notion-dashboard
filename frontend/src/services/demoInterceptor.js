import { mockData } from './mockData';

/**
 * Checks if the application is running in demo mode.
 * @returns {boolean}
 */
export function isDemoMode() {
  return localStorage.getItem('demo_mode') === 'true';
}

/**
 * Simulates a network delay and resolves with the given data.
 * @param {*} data - The mock data to return.
 * @param {number} [delay=300] - Delay in milliseconds.
 * @returns {Promise<*>}
 */
function delayedResponse(data, delay = 300) {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
}

/**
 * Returns a demo response for getById, merging the list-level
 * identification/status into the shared detail template.
 * @param {string} id - The project ID clicked by the user.
 * @returns {Promise<object>}
 */
export function getDemoDetail(id) {
  const projectListInfo = mockData.projects?.data?.find(p => p.id === id);

  if (mockData.detail) {
    return delayedResponse({
      ...mockData.detail,
      id,
      project: {
        ...mockData.detail.project,
        identification: projectListInfo?.identification || mockData.detail.project.identification,
        status: projectListInfo?.status || mockData.detail.project.status,
      },
    });
  }

  return delayedResponse({
    project: projectListInfo || {},
    has_tasks: false,
    has_interactions: false,
    has_deliveries: false,
    has_contacts: false,
  });
}

/**
 * Map of simple demo responses keyed by a logical action name.
 * Each entry returns the exact shape the frontend expects.
 */
const demoResponses = {
  // Lists
  projects:       (_, type) => mockData[type] || { data: [] },
  unread_status:  ()        => mockData.unread,
  client_info:    ()        => mockData.client_info,

  // Detail sub-endpoints
  detail_tasks:        () => mockData.detail_tasks || [],
  detail_interactions: () => mockData.detail_interactions || { content: [] },
  detail_deliveries:   () => mockData.detail_deliveries || [],
  detail_contacts:     () => mockData.detail_contacts || [],

  // Actions
  mark_read:     () => ({ status: 'success' }),
  mark_all_read: () => ({ status: 'success' }),

  // Auth
  login:  () => mockData.login,
  logout: () => {
    localStorage.removeItem('demo_mode');
    return { status: 'success' };
  },
  me:     () => mockData.me,

  // Admin
  settings:   () => mockData.settings,
  users_list: () => mockData.users_list,
};

/**
 * Returns a demo response for a given action, or null if not mapped.
 * @param {string} action - Logical action name (e.g. 'detail_tasks').
 * @param {string} [id] - Optional entity ID.
 * @param {string} [type] - Optional sub-type (used by getAll).
 * @param {number} [delay=300] - Simulated network delay.
 * @returns {Promise<*>|null}
 */
export function getDemoResponse(action, { id, type, delay = 300 } = {}) {
  const handler = demoResponses[action];
  if (!handler) return null;
  return delayedResponse(handler(id, type), delay);
}
