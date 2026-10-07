/** Mask Bangladesh mobile numbers for display while keeping a 4-digit suffix visible. */
export const maskBangladeshPhone = (value: string | null | undefined): string => {
  const digits = String(value || '').replace(/\D/g, '');
  const national = digits.startsWith('880') ? `0${digits.slice(3)}` : digits.length === 10 ? `0${digits}` : digits;
  if (national.length < 7) return national ? '****' : '';
  return `${national.slice(0, 3)}${'*'.repeat(Math.max(1, national.length - 7))}${national.slice(-4)}`;
};

/** Mask NID strings while retaining only a short suffix for account recognition. */
export const maskNationalId = (value: string | null | undefined): string => {
  const raw = String(value || '').trim();
  if (!raw || /x|•|\*/i.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return raw;
  if (digits.length < 5) return '****';
  return `${'*'.repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
};

export const maskPhoneInText = (value: string | null | undefined): string =>
  String(value || '').replace(/(?:\+?880[\s-]?)?0?1[3-9](?:[\s-]?\d){8}/g, (phone) => maskBangladeshPhone(phone));
