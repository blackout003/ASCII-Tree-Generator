import { cleanUsername, parseBaseUrl, type BaseUrl } from './services';
import type { BlockWarning } from './types';

export interface CardService {
  username: string;
  base: BaseUrl;
}

/**
 * What a card block needs to build its URLs: a valid GitHub username (the block's
 * own, else the README's) and the self-hosted base URL. Without both the block
 * renders nothing: there is deliberately no public instance to fall back on.
 */
export function resolveCardService(usernameInput: string, fallbackUsername: string, baseUrlInput: string): CardService {
  return {
    username: cleanUsername(usernameInput) || cleanUsername(fallbackUsername),
    base: parseBaseUrl(baseUrlInput),
  };
}

export function cardWarnings(service: string, card: CardService): BlockWarning[] {
  const warnings: BlockWarning[] = [];
  if (card.username === '') warnings.push({ code: 'missingUsername' });
  if (card.base.status === 'empty') warnings.push({ code: 'missingBaseUrl', params: { service } });
  if (card.base.status === 'invalid') warnings.push({ code: 'invalidBaseUrl' });
  return warnings;
}
