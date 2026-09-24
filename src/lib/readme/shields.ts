/** Text of a static Shields badge: `-` and `_` are doubled, spaces become `_`. */
export function shieldsText(text: string): string {
  return encodeURIComponent(text.trim().replace(/_/g, '__').replace(/-/g, '--').replace(/ /g, '_'));
}

export function shieldsBadgeUrl(label: string, message: string, color: string): string {
  return `https://img.shields.io/badge/${shieldsText(label)}-${shieldsText(message)}-${color}`;
}
