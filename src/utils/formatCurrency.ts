export type UiLanguage = 'EN' | 'BN';

/** Format Bangladeshi taka consistently, including localized Bengali digits. */
export const formatTaka = (amount: number, lang: UiLanguage = 'EN', maximumFractionDigits = 0): string => {
  const formatted = new Intl.NumberFormat(lang === 'BN' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
  return `৳${formatted}`;
};

export const formatLocalizedNumber = (amount: number, lang: UiLanguage = 'EN'): string =>
  new Intl.NumberFormat(lang === 'BN' ? 'bn-BD' : 'en-BD', { maximumFractionDigits: 2 })
    .format(Number.isFinite(amount) ? amount : 0);
