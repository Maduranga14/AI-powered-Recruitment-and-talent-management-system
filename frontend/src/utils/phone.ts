export const PHONE_DIGIT_LENGTH = 10;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneNumber(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function getPhoneValidationError(value: string | null | undefined): string | undefined {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  if (!isValidPhoneNumber(trimmed)) {
    return 'Phone number must be exactly 10 digits (numbers only).';
  }
  return undefined;
}
