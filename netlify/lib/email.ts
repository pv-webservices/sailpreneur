// Builds the enquiry email: branded HTML table + plain text, sent from the academy's own mailbox
// with the visitor's name as the display name and their address as Reply-To.
import type { EnquiryInput } from '../../src/lib/enquiry-validation.ts';

export const SITE_LABEL = 'AKMICS Website';
const TIME_ZONE = 'Asia/Kolkata';

export interface EnquiryContext {
  formType: string;
  departmentName: string;
  pageUrl: string;
  submittedAt: Date;
  flagged: boolean;
}

export interface MailMessage {
  from: { name: string; address: string };
  to: string;
  replyTo: { name: string; address: string };
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
}

const SUSPICIOUS = [/\bviagra\b/i, /\bcasino\b/i, /\bcrypto(currency)?\b/i, /\bbitcoin\b/i, /\bforex\b/i, /\bloan offer\b/i, /\bseo (services|agency)\b/i, /\bbacklinks?\b/i, /\bporn/i, /\bbetting\b/i, /\bguest post\b/i, /\bweb ?design (services|agency)\b/i];
const MAX_LINKS = 2;

/** Spam-like content is flagged in the subject, never dropped, so a genuine enquiry is never lost. */
export function looksSuspicious(input: EnquiryInput): boolean {
  const text = `${input.name} ${input.profession} ${input.message}`;
  const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0;
  return links > MAX_LINKS || SUSPICIOUS.some((pattern) => pattern.test(text));
}

/** Header values must be single-line: CR/LF and other control characters would allow header injection. */
export function headerSafe(value: string, max = 120): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function formatIndiaTime(date: Date): string {
  return `${new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, dateStyle: 'full', timeStyle: 'short' }).format(date)} IST`;
}

export function composeEnquiryEmail(input: EnquiryInput, context: EnquiryContext, mail: { to: string; from: string }): MailMessage {
  const name = headerSafe(input.name, 80);
  const topic = headerSafe(context.departmentName || 'General cruise career enquiry', 80);
  const subject = `${context.flagged ? '[Possible spam] ' : ''}New enquiry from ${name}: ${topic}`;
  const when = formatIndiaTime(context.submittedAt);
  const rows: [string, string][] = [
    ['Form', context.formType],
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Education / profession', input.profession],
    ['Interested department', context.departmentName || 'Still exploring'],
    ['Message', input.message],
    ['Consent', 'Agreed to the privacy policy and to be contacted'],
    ['Submitted', when],
    ['Page', context.pageUrl || 'Not supplied'],
  ];

  const text = [
    `New enquiry from ${SITE_LABEL}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    `Reply to this email to answer ${name} directly.`,
  ].join('\n');

  const cell = 'padding:12px 16px;border-bottom:1px solid #e8dfcc;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;';
  const tableRows = rows.map(([label, value]) =>
    `<tr><th scope="row" align="left" style="${cell}width:34%;color:#5d6877;font-weight:600;">${escapeHtml(label)}</th>` +
    `<td style="${cell}color:#0d1b2c;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#f6f1e7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8dfcc;">
<tr><td style="padding:22px 24px;background:#071a30;font-family:Georgia,serif;color:#e7d19c;font-size:22px;">AKMICS Sailpreneur Academy</td></tr>
<tr><td style="padding:20px 24px 8px;font-family:Arial,Helvetica,sans-serif;color:#0d1b2c;font-size:17px;">${context.flagged ? '<strong style="color:#a33;">Possible spam: please check before replying.</strong><br>' : ''}New enquiry from <strong>${escapeHtml(name)}</strong></td></tr>
<tr><td style="padding:8px 8px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tableRows}</table></td></tr>
<tr><td style="padding:16px 24px 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5d6877;">Press Reply to answer ${escapeHtml(name)} at ${escapeHtml(input.email)}. Sent by the enquiry form on cruisejobmentor.com.</td></tr>
</table></body></html>`;

  return {
    from: { name: `${name} via ${SITE_LABEL}`, address: mail.from },
    to: mail.to,
    replyTo: { name, address: headerSafe(input.email, 254) },
    subject,
    text,
    html,
    headers: { 'X-Enquiry-Form': headerSafe(context.formType, 60) },
  };
}
