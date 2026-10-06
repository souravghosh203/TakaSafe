export interface SecuritySettings {
  dailyLimit: number | null;
  singleTransactionLimit: number | null;
  confirmationThreshold: number | null;
  trustedRecipients: string[];
}

const key = (userId: string) => `takasafe-security-settings:${userId}`;
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  dailyLimit: null,
  singleTransactionLimit: null,
  confirmationThreshold: null,
  trustedRecipients: [],
};

export function readSecuritySettings(userId: string): SecuritySettings {
  try {
    const value = JSON.parse(localStorage.getItem(key(userId)) || 'null');
    if (!value || typeof value !== 'object') return DEFAULT_SECURITY_SETTINGS;
    const limit = (item: unknown) => typeof item === 'number' && Number.isFinite(item) && item > 0 ? item : null;
    return {
      dailyLimit: limit(value.dailyLimit),
      singleTransactionLimit: limit(value.singleTransactionLimit),
      confirmationThreshold: limit(value.confirmationThreshold),
      trustedRecipients: Array.isArray(value.trustedRecipients) ? value.trustedRecipients.filter((item: unknown): item is string => typeof item === 'string').slice(0, 100) : [],
    };
  } catch { return DEFAULT_SECURITY_SETTINGS; }
}

export function writeSecuritySettings(userId: string, settings: SecuritySettings): boolean {
  try { localStorage.setItem(key(userId), JSON.stringify(settings)); return true; }
  catch { return false; }
}
