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

// ── Date shifting utilities ──────────────────────────────────────

/**
 * Calculates the offset in days between the hardcoded reference
 * Monday and the current week's Monday, so all demo dates land
 * in the user's current week.
 */
function getDayOffset() {
  const now = new Date();
  const currentDay = now.getDay();                       // 0=Sun … 6=Sat
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - ((currentDay + 6) % 7)); // roll back to Mon
  currentMonday.setHours(0, 0, 0, 0);

  // The reference Monday from which mock dates were authored
  const refMonday = new Date('2026-03-23T00:00:00');     // Mon 23-Mar-2026
  return Math.round((currentMonday - refMonday) / 86400000);
}

/**
 * Shifts a single ISO date string by `offsetDays`.
 * Preserves the time portion and timezone suffix if present.
 */
function shiftDateString(dateStr, offsetDays) {
  if (!dateStr) return dateStr;
  // date-only: "2026-03-23"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }
  // full ISO: "2026-03-24T12:00:00.000+01:00" or "…Z"
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offsetDays);
  // Keep the original timezone suffix
  const tzMatch = dateStr.match(/[+-]\d{2}:\d{2}$/) || dateStr.match(/Z$/);
  if (tzMatch && !dateStr.endsWith('Z')) {
    return d.toISOString().replace('Z', '').slice(0, 23) + tzMatch[0];
  }
  return d.toISOString();
}

/**
 * Shifts dates in the simplified task list (tasks.data[]).
 * Also injects 'date' (YYYY-MM-DD) and 'time' (HH:mm) for the Calendar component.
 */
function shiftTaskListDates(tasksObj) {
  if (!tasksObj?.data) return tasksObj;
  const offset = getDayOffset();

  return {
    ...tasksObj,
    data: tasksObj.data.map(task => {
      const shiftedStart = task.due_date ? shiftDateString(task.due_date.start, offset) : null;
      const shiftedEnd = task.due_date?.end ? shiftDateString(task.due_date.end, offset) : null;
      
      // Extract HH:mm from the original start date if it contains a time portion
      const timeMatch = task.due_date?.start?.match(/T(\d{2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : null;

      return {
        ...task,
        due_date: task.due_date ? {
          ...task.due_date,
          start: shiftedStart,
          end: shiftedEnd,
        } : null,
        status: {
          ...task.status,
          priority: task.priority || task.status?.priority,
        },
        date: shiftedStart ? shiftedStart.slice(0, 10) : null,
        time: time,
      };
    }),
  };
}

/**
 * Shifts dates in detail_tasks (Notion page format).
 * Also injects 'date' (YYYY-MM-DD) and 'time' (HH:mm) for the Calendar component.
 */
function shiftDetailTaskDates(tasks) {
  if (!tasks?.length) return tasks;
  const offset = getDayOffset();

  return tasks.map(task => {
    const props = { ...task.properties };
    const fechaKey = 'Fecha límite';
    let shiftedStart = null;

    if (props[fechaKey]?.date?.start) {
      shiftedStart = shiftDateString(props[fechaKey].date.start, offset);
      props[fechaKey] = {
        ...props[fechaKey],
        date: {
          ...props[fechaKey].date,
          start: shiftedStart,
          end: props[fechaKey].date.end ? shiftDateString(props[fechaKey].date.end, offset) : null,
        },
      };
    }
    
    // Extract HH:mm from the original start date if it contains a time portion
    const originalStart = props[fechaKey]?.date?.start;
    const timeMatch = originalStart?.match(/T(\d{2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : null;

    return { 
      ...task, 
      properties: props,
      status: {
        ...task.status,
        priority: task.priority || task.status?.priority,
      },
      date: shiftedStart ? shiftedStart.slice(0, 10) : null,
      time: time,
    };
  });
}

// ── Core interceptor ─────────────────────────────────────────────

/**
 * Returns a demo response for getById, merging the list-level
 * identification/status into the shared detail template.
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
  // Lists — tasks get date-shifted
  projects:       (_, type) => type === 'tasks'
    ? shiftTaskListDates(mockData.tasks || { data: [] })
    : (mockData[type] || { data: [] }),
  unread_status:  ()        => mockData.unread,
  client_info:    ()        => mockData.client_info,

  // Detail sub-endpoints — detail_tasks get date-shifted
  detail_tasks:        () => shiftDetailTaskDates(mockData.detail_tasks) || [],
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
