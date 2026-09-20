export type QrTemplate = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';
export type QrEcc = 'L' | 'M' | 'Q' | 'H';
export type QrStyle = 'half' | 'blocks' | 'ascii';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

export interface QrFields {
  text: string;
  url: string;
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsNumber: string;
  smsMessage: string;
  firstName: string;
  lastName: string;
  org: string;
  vcardPhone: string;
  vcardEmail: string;
}

/** Keys of QrFields that hold free text (everything except the select and the switch). */
export type QrTextFieldKey = Exclude<keyof QrFields, 'security' | 'hidden'>;

export interface QrOptions {
  style: QrStyle;
  ecc: QrEcc;
  invert: boolean;
}

/** Maximum length of the final encoded string, in characters (code points). */
export const QR_MAX_LENGTH = 300;

/** Width of the blank margin required around a QR code, in modules. Not user-configurable. */
export const QR_QUIET_ZONE = 4;
