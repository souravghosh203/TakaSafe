export interface SecuritySettings {
  dailyLimit: number | null;
  singleTransactionLimit: number | null;
  confirmationThreshold: number | null;
  trustedRecipients: string[];
}

const key = (userId: string) => `takasafe-security-settings:${userId}`;
const sessionTrustedRecipients = new Map<string, string[]>();
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  dailyLimit: null,
  singleTransactionLimit: null,
  confirmationThreshold: null,
  trustedRecipients: [],
};

export function readSecuritySettings(userId: string): SecuritySettings {
  try {
    const value = JSON.parse(localStorage.getItem(key(userId)) || 'null');
    if (!value || typeof value !== 'object') return { ...DEFAULT_SECURITY_SETTINGS, trustedRecipients: sessionTrustedRecipients.get(userId) || [] };
    const limit = (item: unknown) => typeof item === 'number' && Number.isFinite(item) && item > 0 ? item : null;
    // Keep the current demo session's setting functional, but never write raw
    // recipient identifiers to browser storage.
    if (!sessionTrustedRecipients.has(userId) && Array.isArray(value.trustedRecipients)) {
      sessionTrustedRecipients.set(userId, value.trustedRecipients.filter((item: unknown): item is string => typeof item === 'string'));
    }
    const safeSettings = { ...value, trustedRecipients: [] };
    if (Array.isArray(value.trustedRecipients) && value.trustedRecipients.length) {
      localStorage.setItem(key(userId), JSON.stringify(safeSettings));
    }
    return {
      dailyLimit: limit(value.dailyLimit),
      singleTransactionLimit: limit(value.singleTransactionLimit),
      confirmationThreshold: limit(value.confirmationThreshold),
      trustedRecipients: sessionTrustedRecipients.get(userId) || [],
    };
  } catch { return DEFAULT_SECURITY_SETTINGS; }
}

export function writeSecuritySettings(userId: string, settings: SecuritySettings): boolean {
  sessionTrustedRecipients.set(userId, settings.trustedRecipients.filter((item) => typeof item === 'string'));
  try { localStorage.setItem(key(userId), JSON.stringify({ ...settings, trustedRecipients: [] })); return true; }
  catch { return false; }
}
