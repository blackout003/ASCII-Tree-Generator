import { Smile, Cat, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * A single ASCII emoji: the glyph the user copies (`value`) and a `labelKey`
 * pointing at its translated name in the i18n files (`asciiEmoji.labels.<key>`).
 *
 * The glyph itself is language-neutral and lives here; only the human-readable
 * label is translated — same split as {@link MARKDOWN_CATEGORIES}.
 */
export interface AsciiEmoji {
  value: string;
  labelKey: string;
}

export interface AsciiEmojiCategory {
  id: string;
  icon: LucideIcon;
  emojis: AsciiEmoji[];
}

export const ASCII_EMOJI_CATEGORIES: AsciiEmojiCategory[] = [
  {
    id: 'classics',
    icon: Smile,
    emojis: [
      { value: ':)', labelKey: 'happy' },
      { value: ':D', labelKey: 'laugh' },
      { value: ';)', labelKey: 'wink' },
      { value: ':(', labelKey: 'sad' },
      { value: ":'(", labelKey: 'cry' },
      { value: ':P', labelKey: 'tongue' },
      { value: ':/', labelKey: 'unsure' },
      { value: ':O', labelKey: 'surprised' },
      { value: '<3', labelKey: 'heart' },
      { value: '</3', labelKey: 'brokenHeart' },
      { value: ':*', labelKey: 'kiss' },
      { value: ':|', labelKey: 'neutral' },
    ],
  },
  {
    id: 'kaomoji',
    icon: Sparkles,
    emojis: [
      { value: '¯\\_(ツ)_/¯', labelKey: 'shrug' },
      { value: '(╯°□°)╯︵ ┻━┻', labelKey: 'tableFlip' },
      { value: '( ͡° ͜ʖ ͡°)', labelKey: 'lenny' },
      { value: '(⌐■_■)', labelKey: 'cool' },
      { value: 'ಠ_ಠ', labelKey: 'disapproval' },
      { value: '(づ｡◕‿‿◕｡)づ', labelKey: 'hug' },
      { value: '＼(^o^)／', labelKey: 'cheer' },
      { value: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', labelKey: 'sparkle' },
      { value: '(T_T)', labelKey: 'cry2' },
    ],
  },
  {
    id: 'animals',
    icon: Cat,
    emojis: [
      { value: '>^.^<', labelKey: 'cat' },
      { value: 'ʕ•ᴥ•ʔ', labelKey: 'bear' },
      { value: '<°)))><', labelKey: 'fish' },
      { value: '(\\_/)', labelKey: 'bunny' },
    ],
  },
];
