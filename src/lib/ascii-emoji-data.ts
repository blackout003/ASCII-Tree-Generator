import { Smile, Cat, Sparkles, Heart, Hand } from 'lucide-react';
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
      { value: ':3', labelKey: 'cute' },
      { value: 'B)', labelKey: 'sunglasses' },
      { value: '>:(', labelKey: 'angry' },
      { value: ':$', labelKey: 'embarrassed' },
      { value: ":')", labelKey: 'happyTears' },
      { value: 'xD', labelKey: 'laughHard' },
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
      { value: '(ノ°益°)ノ', labelKey: 'rage' },
      { value: '(╥﹏╥)', labelKey: 'sob' },
      { value: '(¬‿¬)', labelKey: 'smirk' },
      { value: '\\(°o°)/', labelKey: 'shock' },
      { value: '(*^▽^*)', labelKey: 'delight' },
      { value: '(¬_¬)', labelKey: 'suspicious' },
      { value: 'ᕦ(ò_óˇ)ᕤ', labelKey: 'flex' },
      { value: '(・_・?)', labelKey: 'confused' },
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
      { value: '=^.^=', labelKey: 'cat2' },
      { value: 'U・ᴥ・U', labelKey: 'dog' },
      { value: '<:3 )~~', labelKey: 'mouse' },
      { value: '<コ:彡', labelKey: 'squid' },
    ],
  },
  {
    id: 'love',
    icon: Heart,
    emojis: [
      { value: '(♥‿♥)', labelKey: 'inLove' },
      { value: '( ˘ ³˘)♥', labelKey: 'kissHeart' },
      { value: '(づ￣ ³￣)づ', labelKey: 'blowKiss' },
      { value: '♡ ♥', labelKey: 'hearts' },
      { value: '(つ≧▽≦)つ', labelKey: 'hugLove' },
    ],
  },
  {
    id: 'actions',
    icon: Hand,
    emojis: [
      { value: '\\o/', labelKey: 'armsUp' },
      { value: '( ﾟ▽ﾟ)/', labelKey: 'wave' },
      { value: 'ᕕ( ᐛ )ᕗ', labelKey: 'run' },
      { value: '♪┏(・o･)┛♪', labelKey: 'dance' },
      { value: '┬─┬ノ( º _ ºノ)', labelKey: 'tableBack' },
      { value: "(ง'̀-'́)ง", labelKey: 'fight' },
    ],
  },
];
