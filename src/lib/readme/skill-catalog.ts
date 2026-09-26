// Icon ids come from the official skill-icons list (https://github.com/tandpfun/skill-icons).
// Note Python is `py`. Labels are proper names and are not translated.

export interface Skill {
  id: string;
  label: string;
}

export type SkillGroupKey = 'languages' | 'frontend' | 'backend' | 'data' | 'cloud' | 'tools';

export interface SkillGroup {
  key: SkillGroupKey;
  skills: readonly Skill[];
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    key: 'languages',
    skills: [
      { id: 'js', label: 'JavaScript' },
      { id: 'ts', label: 'TypeScript' },
      { id: 'py', label: 'Python' },
      { id: 'java', label: 'Java' },
      { id: 'go', label: 'Go' },
      { id: 'rust', label: 'Rust' },
      { id: 'c', label: 'C' },
      { id: 'cpp', label: 'C++' },
      { id: 'cs', label: 'C#' },
      { id: 'php', label: 'PHP' },
      { id: 'ruby', label: 'Ruby' },
      { id: 'kotlin', label: 'Kotlin' },
      { id: 'swift', label: 'Swift' },
      { id: 'dart', label: 'Dart' },
      { id: 'bash', label: 'Bash' },
      { id: 'lua', label: 'Lua' },
    ],
  },
  {
    key: 'frontend',
    skills: [
      { id: 'html', label: 'HTML' },
      { id: 'css', label: 'CSS' },
      { id: 'sass', label: 'Sass' },
      { id: 'tailwind', label: 'Tailwind CSS' },
      { id: 'react', label: 'React' },
      { id: 'vue', label: 'Vue' },
      { id: 'angular', label: 'Angular' },
      { id: 'svelte', label: 'Svelte' },
      { id: 'nextjs', label: 'Next.js' },
      { id: 'nuxtjs', label: 'Nuxt' },
      { id: 'astro', label: 'Astro' },
      { id: 'vite', label: 'Vite' },
      { id: 'webpack', label: 'Webpack' },
      { id: 'redux', label: 'Redux' },
      { id: 'threejs', label: 'Three.js' },
    ],
  },
  {
    key: 'backend',
    skills: [
      { id: 'nodejs', label: 'Node.js' },
      { id: 'express', label: 'Express' },
      { id: 'nestjs', label: 'NestJS' },
      { id: 'django', label: 'Django' },
      { id: 'flask', label: 'Flask' },
      { id: 'fastapi', label: 'FastAPI' },
      { id: 'spring', label: 'Spring' },
      { id: 'laravel', label: 'Laravel' },
      { id: 'rails', label: 'Rails' },
      { id: 'graphql', label: 'GraphQL' },
      { id: 'prisma', label: 'Prisma' },
    ],
  },
  {
    key: 'data',
    skills: [
      { id: 'postgres', label: 'PostgreSQL' },
      { id: 'mysql', label: 'MySQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'redis', label: 'Redis' },
      { id: 'sqlite', label: 'SQLite' },
      { id: 'firebase', label: 'Firebase' },
      { id: 'supabase', label: 'Supabase' },
    ],
  },
  {
    key: 'cloud',
    skills: [
      { id: 'docker', label: 'Docker' },
      { id: 'kubernetes', label: 'Kubernetes' },
      { id: 'aws', label: 'AWS' },
      { id: 'azure', label: 'Azure' },
      { id: 'gcp', label: 'Google Cloud' },
      { id: 'vercel', label: 'Vercel' },
      { id: 'netlify', label: 'Netlify' },
      { id: 'terraform', label: 'Terraform' },
      { id: 'nginx', label: 'NGINX' },
      { id: 'linux', label: 'Linux' },
      { id: 'ubuntu', label: 'Ubuntu' },
    ],
  },
  {
    key: 'tools',
    skills: [
      { id: 'git', label: 'Git' },
      { id: 'github', label: 'GitHub' },
      { id: 'gitlab', label: 'GitLab' },
      { id: 'vscode', label: 'VS Code' },
      { id: 'vim', label: 'Vim' },
      { id: 'figma', label: 'Figma' },
      { id: 'npm', label: 'npm' },
      { id: 'yarn', label: 'Yarn' },
      { id: 'pnpm', label: 'pnpm' },
      { id: 'bun', label: 'Bun' },
      { id: 'deno', label: 'Deno' },
      { id: 'jest', label: 'Jest' },
      { id: 'cypress', label: 'Cypress' },
      { id: 'flutter', label: 'Flutter' },
      { id: 'androidstudio', label: 'Android Studio' },
      { id: 'unity', label: 'Unity' },
      { id: 'godot', label: 'Godot' },
      { id: 'arduino', label: 'Arduino' },
      { id: 'raspberrypi', label: 'Raspberry Pi' },
      { id: 'wordpress', label: 'WordPress' },
    ],
  },
];

export const SKILL_IDS: string[] = SKILL_GROUPS.flatMap((group) => group.skills.map((skill) => skill.id));

const LABELS = new Map(SKILL_GROUPS.flatMap((group) => group.skills.map((skill) => [skill.id, skill.label] as const)));

export function isSkillId(value: string): boolean {
  return LABELS.has(value);
}

export function skillLabel(id: string): string {
  return LABELS.get(id) ?? id;
}
