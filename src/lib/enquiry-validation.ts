// Enquiry form rules, shared by the browser (src/scripts/contact-form.ts) and the
// Netlify Function (netlify/lib/enquiry.ts) so both sides always agree.
// Lengths are checked by hand: the browser's validity.tooShort does not fire for autofilled
// or script-set values, and the server cannot trust the browser at all.

// Same order as the form, so the error summary and "focus the first invalid field" follow the page.
export const ENQUIRY_FIELDS = ['name', 'phone', 'email', 'profession', 'department', 'message', 'consent'] as const;
export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { min: 6, max: 254 },
  phoneDigits: { min: 10, max: 15 },
  phoneChars: { max: 20 },
  profession: { min: 2, max: 160 },
  department: { max: 60 },
  message: { min: 10, max: 2000 },
} as const;

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  profession: string;
  department: string;
  message: string;
  consent: boolean;
}

export type FieldErrors = Partial<Record<EnquiryField, string>>;

// Deliberately simple: one "@", no spaces or header-significant characters, and a dotted domain.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_CHARS = /^[+0-9 ()\-.]+$/;
// Control characters (including CR/LF) are never valid in single-line fields.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;

export const MESSAGES = {
  name: `Enter your full name (at least ${LIMITS.name.min} characters).`,
  nameLong: `Your name must be ${LIMITS.name.max} characters or fewer.`,
  email: 'Enter a valid email address, like name@example.com.',
  phone: `Enter a phone number with ${LIMITS.phoneDigits.min} to ${LIMITS.phoneDigits.max} digits. Include the country code if you are outside India.`,
  profession: 'Tell us your education or current profession.',
  professionLong: `Keep this under ${LIMITS.profession.max} characters.`,
  department: 'Choose a department from the list.',
  message: `Tell us a little more: at least ${LIMITS.message.min} characters.`,
  messageLong: `Keep your message under ${LIMITS.message.max.toLocaleString('en-IN')} characters.`,
  consent: 'Please confirm you have read the privacy policy and agree to be contacted.',
} as const;

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Coerce untrusted input (FormData entries or parsed JSON) into the enquiry shape. */
export function normaliseEnquiry(raw: Record<string, unknown>): EnquiryInput {
  const consent = raw.consent;
  return {
    name: clean(raw.name).replace(/\s+/g, ' '),
    email: clean(raw.email),
    phone: clean(raw.phone),
    profession: clean(raw.profession).replace(/\s+/g, ' '),
    department: clean(raw.department),
    message: clean(raw.message).replace(/\r\n?/g, '\n'),
    consent: consent === true || (typeof consent === 'string' && ['on', 'true', 'yes', '1'].includes(consent.toLowerCase())),
  };
}

export const phoneDigits = (phone: string): number => phone.replace(/\D/g, '').length;

/** Validate one field; returns an error message or undefined. `allowedDepartments` is checked only when given. */
export function validateField(field: EnquiryField, input: EnquiryInput, allowedDepartments?: readonly string[]): string | undefined {
  switch (field) {
    case 'name':
      if (input.name.length < LIMITS.name.min || CONTROL.test(input.name)) return MESSAGES.name;
      if (input.name.length > LIMITS.name.max) return MESSAGES.nameLong;
      return undefined;
    case 'email':
      return input.email.length < LIMITS.email.min || input.email.length > LIMITS.email.max || !EMAIL_PATTERN.test(input.email) ? MESSAGES.email : undefined;
    case 'phone': {
      const digits = phoneDigits(input.phone);
      return !PHONE_CHARS.test(input.phone) || input.phone.length > LIMITS.phoneChars.max || digits < LIMITS.phoneDigits.min || digits > LIMITS.phoneDigits.max ? MESSAGES.phone : undefined;
    }
    case 'profession':
      if (input.profession.length < LIMITS.profession.min || CONTROL.test(input.profession)) return MESSAGES.profession;
      if (input.profession.length > LIMITS.profession.max) return MESSAGES.professionLong;
      return undefined;
    case 'department':
      if (!input.department) return undefined;
      if (input.department.length > LIMITS.department.max) return MESSAGES.department;
      return allowedDepartments && !allowedDepartments.includes(input.department) ? MESSAGES.department : undefined;
    case 'message':
      if (input.message.length < LIMITS.message.min) return MESSAGES.message;
      if (input.message.length > LIMITS.message.max) return MESSAGES.messageLong;
      return undefined;
    case 'consent':
      return input.consent ? undefined : MESSAGES.consent;
  }
}

export function validateEnquiry(input: EnquiryInput, allowedDepartments?: readonly string[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of ENQUIRY_FIELDS) {
    const error = validateField(field, input, allowedDepartments);
    if (error) errors[field] = error;
  }
  return errors;
}
