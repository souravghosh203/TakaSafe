import { maskPhoneInText } from '../utils/maskSensitive';

export type NotificationType = 'TRANSACTION' | 'SECURITY' | 'ACCOUNT' | 'SYSTEM';

export interface TakaSafeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  relatedEntityId?: string;
}

const storageKey = (userId: string) => `takasafe-notifications:${userId}`;

export function readNotifications(userId: string): TakaSafeNotification[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
    if (!Array.isArray(parsed)) return [];
    const safe = parsed.slice(0, 100).map((item) => ({
      ...item,
      message: typeof item?.message === 'string' ? maskPhoneInText(item.message) : '',
    }));
    localStorage.setItem(storageKey(userId), JSON.stringify(safe));
    return safe;
  } catch { return []; }
}

export function createNotification(userId: string, notification: Omit<TakaSafeNotification, 'id' | 'createdAt' | 'isRead'> & Partial<Pick<TakaSafeNotification, 'id' | 'createdAt' | 'isRead'>>) {
  if (!userId) return;
  const current = readNotifications(userId);
  if (notification.relatedEntityId && current.some((item) => item.relatedEntityId === notification.relatedEntityId && item.type === notification.type)) return;
  const next: TakaSafeNotification = {
    ...notification,
    id: notification.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    createdAt: notification.createdAt || new Date().toISOString(),
    isRead: notification.isRead ?? false,
  };
  try { localStorage.setItem(storageKey(userId), JSON.stringify([next, ...current].slice(0, 100))); } catch { /* In-memory UI will refresh on the event. */ }
  window.dispatchEvent(new CustomEvent('takasafe-notifications-changed', { detail: { userId, action: 'created' } }));
}

export function updateNotifications(userId: string, transform: (items: TakaSafeNotification[]) => TakaSafeNotification[]) {
  const next = transform(readNotifications(userId));
  try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* Keep current view responsive if storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent('takasafe-notifications-changed', { detail: { userId } }));
}
