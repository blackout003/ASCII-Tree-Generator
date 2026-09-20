'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Trash2 } from '@/components/icons';
import {
  QR_MAX_LENGTH,
  type QrFields,
  type QrTemplate,
  type QrTextFieldKey,
  type WifiSecurity,
} from '@/lib/qr-types';

const TEMPLATES: QrTemplate[] = ['url', 'text', 'wifi', 'email', 'phone', 'sms', 'vcard'];

interface QrInputProps {
  template: QrTemplate;
  fields: QrFields;
  charCount: number;
  onTemplateChange: (template: QrTemplate) => void;
  onFieldsChange: (fields: QrFields) => void;
  onClear: () => void;
}

export function QrInput({
  template,
  fields,
  charCount,
  onTemplateChange,
  onFieldsChange,
  onClear,
}: QrInputProps) {
  const t = useTranslations('qrGenerator');
  const tooLong = charCount > QR_MAX_LENGTH;

  const textField = (
    key: QrTextFieldKey,
    labelKey: string,
    opts: { type?: string; placeholder?: string } = {}
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`qr-${key}`}>{t(`fields.${labelKey}`)}</Label>
      <Input
        id={`qr-${key}`}
        type={opts.type ?? 'text'}
        value={fields[key]}
        placeholder={opts.placeholder}
        onChange={(e) => onFieldsChange({ ...fields, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-template">{t('input.templateLabel')}</Label>
          <Select value={template} onValueChange={(v) => onTemplateChange(v as QrTemplate)}>
            <SelectTrigger id="qr-template" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`templates.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {template === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="qr-text">{t('fields.text')}</Label>
            <Textarea
              id="qr-text"
              value={fields.text}
              placeholder={t('fields.textPlaceholder')}
              onChange={(e) => onFieldsChange({ ...fields, text: e.target.value })}
              className="font-mono min-h-[100px] resize-y"
            />
          </div>
        )}

        {template === 'url' &&
          textField('url', 'url', { type: 'url', placeholder: t('fields.urlPlaceholder') })}

        {template === 'wifi' && (
          <>
            {textField('ssid', 'ssid')}
            <div className="space-y-2">
              <Label htmlFor="qr-security">{t('fields.security')}</Label>
              <Select
                value={fields.security}
                onValueChange={(v) => onFieldsChange({ ...fields, security: v as WifiSecurity })}
              >
                <SelectTrigger id="qr-security" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">{t('fields.securityWpa')}</SelectItem>
                  <SelectItem value="WEP">{t('fields.securityWep')}</SelectItem>
                  <SelectItem value="nopass">{t('fields.securityNone')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fields.security !== 'nopass' && textField('password', 'password')}
            <div className="flex items-center justify-between">
              <Label htmlFor="qr-hidden">{t('fields.hidden')}</Label>
              <Switch
                id="qr-hidden"
                checked={fields.hidden}
                onCheckedChange={(v) => onFieldsChange({ ...fields, hidden: v })}
              />
            </div>
          </>
        )}

        {template === 'email' && (
          <>
            {textField('emailTo', 'emailTo', { type: 'email' })}
            {textField('emailSubject', 'emailSubject')}
            <div className="space-y-2">
              <Label htmlFor="qr-emailBody">{t('fields.emailBody')}</Label>
              <Textarea
                id="qr-emailBody"
                value={fields.emailBody}
                onChange={(e) => onFieldsChange({ ...fields, emailBody: e.target.value })}
                className="min-h-[80px] resize-y"
              />
            </div>
          </>
        )}

        {template === 'phone' && textField('phone', 'phone', { type: 'tel' })}

        {template === 'sms' && (
          <>
            {textField('smsNumber', 'smsNumber', { type: 'tel' })}
            <div className="space-y-2">
              <Label htmlFor="qr-smsMessage">{t('fields.smsMessage')}</Label>
              <Textarea
                id="qr-smsMessage"
                value={fields.smsMessage}
                onChange={(e) => onFieldsChange({ ...fields, smsMessage: e.target.value })}
                className="min-h-[80px] resize-y"
              />
            </div>
          </>
        )}

        {template === 'vcard' && (
          <>
            {textField('firstName', 'firstName')}
            {textField('lastName', 'lastName')}
            {textField('org', 'org')}
            {textField('vcardPhone', 'vcardPhone', { type: 'tel' })}
            {textField('vcardEmail', 'vcardEmail', { type: 'email' })}
          </>
        )}

        <div className="text-sm">
          <span className={tooLong ? 'text-destructive' : 'text-muted-foreground'}>
            {t('input.counter', { count: charCount, max: QR_MAX_LENGTH })}
          </span>
          {tooLong && (
            <p role="alert" className="mt-1 text-destructive">
              {t('input.tooLong', { count: charCount, max: QR_MAX_LENGTH })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
