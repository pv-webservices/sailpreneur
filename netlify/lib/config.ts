// Mail and security settings for the enquiry function. Every secret comes from the host's
// environment variables (Netlify: Site configuration → Environment variables); nothing is hard-coded.

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
}

const REQUIRED = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_TO', 'MAIL_FROM'] as const;

export type Env = Record<string, string | undefined>;

/** Returns the mail configuration, or the names of the missing variables. */
export function readMailConfig(env: Env): { config: MailConfig } | { missing: string[] } {
  const missing: string[] = REQUIRED.filter((key) => !env[key]?.trim());
  const port = Number(env.SMTP_PORT);
  if (env.SMTP_PORT && !Number.isInteger(port)) missing.push('SMTP_PORT (not a number)');
  if (missing.length) return { missing };
  return {
    config: {
      host: env.SMTP_HOST!.trim(),
      port,
      // 465 = implicit TLS; 587 = STARTTLS (nodemailer upgrades automatically when secure is false).
      secure: port === 465,
      user: env.SMTP_USER!.trim(),
      pass: env.SMTP_PASS!,
      to: env.MAIL_TO!.trim(),
      from: env.MAIL_FROM!.trim(),
    },
  };
}

const DEFAULT_ORIGINS = ['https://cruisejobmentor.com', 'https://www.cruisejobmentor.com', 'https://sailpreneur.netlify.app'];
// Deploy previews and branch deploys: https://<id>--sailpreneur.netlify.app; local development on any port.
const PATTERN_ORIGINS = [/^https:\/\/[a-z0-9-]+--sailpreneur\.netlify\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

/** ALLOWED_ORIGINS (comma-separated) adds to the defaults, e.g. a future domain. */
export function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  const extra = (env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra].includes(origin) || PATTERN_ORIGINS.some((pattern) => pattern.test(origin));
}
