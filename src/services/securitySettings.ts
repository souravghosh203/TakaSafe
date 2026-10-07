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
    // Recipient identifiers stay in runtime memory only; remove any cleartext
    // entries written by earlier demo builds during the first read.
    const safeSettings = { ...value, trustedRecipients: [] };
    if (Array.isArray(value.trustedRecipients) && value.trustedRecipients.length) {
      localStorage.setItem(key(userId), JSON.stringify(safeSettings));
    }
    return {
      dailyLimit: limit(value.dailyLimit),
      singleTransactionLimit: limit(value.singleTransactionLimit),
      confirmationThreshold: limit(value.confirmationThreshold),
      trustedRecipients: [],
    };
  } catch { return DEFAULT_SECURITY_SETTINGS; }
}

export function writeSecuritySettings(userId: string, settings: SecuritySettings): boolean {
  try { localStorage.setItem(key(userId), JSON.stringify({ ...settings, trustedRecipients: [] })); return true; }
  catch { return false; }
}
