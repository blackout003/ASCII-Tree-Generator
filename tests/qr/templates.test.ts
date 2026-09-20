import { describe, it, expect } from 'vitest';
import { buildPayload, countChars, DEFAULT_FIELDS } from '@/lib/qr-templates';
import type { QrFields } from '@/lib/qr-types';

const f = (over: Partial<QrFields>): QrFields => ({ ...DEFAULT_FIELDS, ...over });

describe('countChars', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(countChars('a😀é')).toBe(3);
    expect(countChars('')).toBe(0);
  });
});

describe('buildPayload', () => {
  it('text: returns the text as typed, empty when blank', () => {
    expect(buildPayload('text', f({ text: 'hello' }))).toBe('hello');
    expect(buildPayload('text', f({ text: '   ' }))).toBe('');
  });

  it('url: trims, empty when blank', () => {
    expect(buildPayload('url', f({ url: '  https://asciitree.fr  ' }))).toBe('https://asciitree.fr');
    expect(buildPayload('url', f({ url: '' }))).toBe('');
  });

  it('wifi: escapes \\ ; , : " in ssid and password', () => {
    expect(buildPayload('wifi', f({ ssid: 'My;Net', password: 'p:a"ss', security: 'WPA' }))).toBe(
      'WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"ss;;'
    );
  });

  it('wifi: hidden flag, open network ignores the password, empty ssid gives empty payload', () => {
    expect(buildPayload('wifi', f({ ssid: 'Net', password: 'pw', security: 'WPA', hidden: true }))).toBe(
      'WIFI:T:WPA;S:Net;P:pw;H:true;;'
    );
    expect(buildPayload('wifi', f({ ssid: 'Open', password: 'ignored', security: 'nopass' }))).toBe(
      'WIFI:T:nopass;S:Open;;'
    );
    expect(buildPayload('wifi', f({ ssid: '' }))).toBe('');
  });

  it('email: mailto with URL-encoded subject and body', () => {
    expect(buildPayload('email', f({ emailTo: 'a@b.fr' }))).toBe('mailto:a@b.fr');
    expect(buildPayload('email', f({ emailTo: 'a@b.fr', emailSubject: 'Hi there', emailBody: 'a&b' }))).toBe(
      'mailto:a@b.fr?subject=Hi%20there&body=a%26b'
    );
    expect(buildPayload('email', f({ emailTo: '' }))).toBe('');
  });

  it('phone: keeps digits and +, drops everything else', () => {
    expect(buildPayload('phone', f({ phone: '+33 6 12-34.56.78' }))).toBe('tel:+33612345678');
    expect(buildPayload('phone', f({ phone: 'abc' }))).toBe('');
  });

  it('sms: SMSTO with cleaned number and message', () => {
    expect(buildPayload('sms', f({ smsNumber: '06 12 34 56 78', smsMessage: 'Salut' }))).toBe(
      'SMSTO:0612345678:Salut'
    );
    expect(buildPayload('sms', f({ smsNumber: '' }))).toBe('');
  });

  it('vcard: builds a 3.0 card, escapes ; , \\ and skips empty lines', () => {
    expect(
      buildPayload(
        'vcard',
        f({ firstName: 'Ada', lastName: 'Lovelace', org: 'Analytical; Co', vcardPhone: '+44 1', vcardEmail: 'ada@x.org' })
      )
    ).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Lovelace;Ada;;;',
        'FN:Ada Lovelace',
        'ORG:Analytical\\; Co',
        'TEL:+44 1',
        'EMAIL:ada@x.org',
        'END:VCARD',
      ].join('\n')
    );
    expect(buildPayload('vcard', f({ firstName: 'Ada' }))).toBe(
      ['BEGIN:VCARD', 'VERSION:3.0', 'N:;Ada;;;', 'FN:Ada', 'END:VCARD'].join('\n')
    );
    expect(buildPayload('vcard', f({}))).toBe('');
  });
});
