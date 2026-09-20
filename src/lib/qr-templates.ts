import { QR_MAX_LENGTH, type QrFields, type QrTemplate } from './qr-types';

export const DEFAULT_FIELDS: QrFields = {
  text: '',
  url: '',
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false,
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsNumber: '',
  smsMessage: '',
  firstName: '',
  lastName: '',
  org: '',
  vcardPhone: '',
  vcardEmail: '',
};

/** Length in characters (code points), so an emoji counts as one. */
export function countChars(s: string): number {
  return Array.from(s).length;
}

/** True when the final encoded string fits the tool's limit (in characters / code points). */
export function isWithinLimit(payload: string): boolean {
  return countChars(payload) <= QR_MAX_LENGTH;
}

const escapeWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
const escapeVcard = (s: string) => s.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
const cleanNumber = (s: string) => s.replace(/[^\d+]/g, '');

/**
 * Builds the exact string that gets encoded in the QR code.
 * Returns '' while the required fields of the template are still empty.
 */
export function buildPayload(template: QrTemplate, f: QrFields): string {
  switch (template) {
    case 'text':
      return f.text.trim() === '' ? '' : f.text;

    case 'url':
      return f.url.trim();

    case 'wifi': {
      if (!f.ssid.trim()) return '';
      const parts = [`T:${f.security}`, `S:${escapeWifi(f.ssid)}`];
      if (f.security !== 'nopass' && f.password) parts.push(`P:${escapeWifi(f.password)}`);
      if (f.hidden) parts.push('H:true');
      return `WIFI:${parts.join(';')};;`;
    }

    case 'email': {
      const to = f.emailTo.trim();
      if (!to) return '';
      const params: string[] = [];
      if (f.emailSubject) params.push(`subject=${encodeURIComponent(f.emailSubject)}`);
      if (f.emailBody) params.push(`body=${encodeURIComponent(f.emailBody)}`);
      return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
    }

    case 'phone': {
      const number = cleanNumber(f.phone);
      return number ? `tel:${number}` : '';
    }

    case 'sms': {
      const number = cleanNumber(f.smsNumber);
      return number ? `SMSTO:${number}:${f.smsMessage}` : '';
    }

    case 'vcard': {
      const first = f.firstName.trim();
      const last = f.lastName.trim();
      if (!first && !last) return '';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVcard(last)};${escapeVcard(first)};;;`,
        `FN:${escapeVcard([first, last].filter(Boolean).join(' '))}`,
      ];
      if (f.org.trim()) lines.push(`ORG:${escapeVcard(f.org.trim())}`);
      if (f.vcardPhone.trim()) lines.push(`TEL:${escapeVcard(f.vcardPhone.trim())}`);
      if (f.vcardEmail.trim()) lines.push(`EMAIL:${escapeVcard(f.vcardEmail.trim())}`);
      lines.push('END:VCARD');
      return lines.join('\r\n');
    }
  }
}
