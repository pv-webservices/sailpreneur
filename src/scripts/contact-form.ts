// Enquiry form enhancement. Without JavaScript the form still posts to /api/enquiry and the
// function answers 303 → /thank-you/. With JavaScript: inline validation (shared rules), a JSON
// send in the background with a 20s timeout, clear failure messages, and the visitor's answers
// are never cleared until the enquiry has been accepted.
import { ENQUIRY_FIELDS, normaliseEnquiry, validateEnquiry, validateField, type EnquiryField, type FieldErrors } from '../lib/enquiry-validation';

const ENDPOINT = '/api/enquiry';
const THANK_YOU = '/thank-you/';
const TIMEOUT_MS = 20_000;
const DRAFT_KEY = 'akmics-enquiry-draft';
const CONTACT = 'call <a href="tel:+919185282229">+91 9185282229</a>, <a class="js-whatsapp" href="#">message us on WhatsApp</a> or email <a href="mailto:info@cruisejobmentor.com">info@cruisejobmentor.com</a>';

const FAILURES: Record<string, string> = {
  offline: `You appear to be offline. Your answers are still here: reconnect and press Send again, or ${CONTACT}.`,
  timeout: `The server took too long to respond, so we stopped waiting. Your answers are still here: try again in a moment, or ${CONTACT}.`,
  network: `We couldn’t reach the server. Check your connection and try again, or ${CONTACT}.`,
  rate_limited: `You’ve sent several enquiries in a short time. Please wait about ten minutes, or ${CONTACT}.`,
  delivery_failed: `Your enquiry could not be delivered just now. Your answers are still here. Please ${CONTACT}.`,
  not_configured: `Online enquiries are temporarily unavailable. Your answers are still here. Please ${CONTACT}.`,
  default: `Something went wrong and your enquiry was not sent. Your answers are still here. Please try again, or ${CONTACT}.`,
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

type Controls = Record<EnquiryField, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

const readDraft = (): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, string>; } catch { return {}; }
};
const writeDraft = (draft: Record<string, string> | null): void => {
  try { draft ? sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) : sessionStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable: the form still works */ }
};

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form) return;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const whatsapp = form.querySelector<HTMLButtonElement>('.form-whatsapp')!;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  const summary = form.querySelector<HTMLElement>('#form-summary')!;
  const controls = Object.fromEntries(ENQUIRY_FIELDS.map((name) => [name, form.elements.namedItem(name)])) as Controls;
  const allowedDepartments = [...(controls.department as HTMLSelectElement).options].map((option) => option.value).filter(Boolean);
  let attempted = false;

  form.noValidate = true; // our messages replace the browser's bubbles
  (form.elements.namedItem('started') as HTMLInputElement).value = String(Date.now());
  (form.elements.namedItem('page') as HTMLInputElement).value = location.href;
  whatsapp.hidden = false;

  // Restore an unsent draft (e.g. after a reload), then any department requested in the URL.
  const draft = readDraft();
  for (const name of ENQUIRY_FIELDS) {
    const control = controls[name];
    if (draft[name] === undefined) continue;
    if (control instanceof HTMLInputElement && control.type === 'checkbox') control.checked = draft[name] === 'yes';
    else control.value = draft[name];
  }
  const requested = new URLSearchParams(location.search).get('department');
  if (requested && allowedDepartments.includes(requested)) controls.department.value = requested;

  const values = () => {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    return { data, input: normaliseEnquiry(data) };
  };

  function showFieldError(name: EnquiryField, message: string | undefined): void {
    const control = controls[name];
    const slot = form!.querySelector<HTMLElement>(`#${name}-error`)!;
    slot.textContent = message ?? '';
    slot.hidden = !message;
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }

  function showErrors(errors: FieldErrors): void {
    for (const name of ENQUIRY_FIELDS) showFieldError(name, errors[name]);
    const entries = ENQUIRY_FIELDS.filter((name) => errors[name]);
    if (!entries.length) { summary.hidden = true; summary.innerHTML = ''; return; }
    const count = entries.length === 1 ? '1 field needs' : `${entries.length} fields need`;
    summary.innerHTML = `<strong>${count} your attention before we can send your enquiry.</strong><ul>${entries.map((name) => `<li><a href="#${name}">${escapeHtml(errors[name]!)}</a></li>`).join('')}</ul>`;
    summary.hidden = false;
    controls[entries[0]].focus();
  }

  function setStatus(message: string, isError = false): void {
    status.innerHTML = message;
    status.classList.toggle('is-error', isError);
    status.querySelectorAll<HTMLAnchorElement>('.js-whatsapp').forEach((link) => { link.href = whatsappLink(); link.target = '_blank'; link.rel = 'noopener noreferrer'; });
  }

  function whatsappLink(): string {
    const { input } = values();
    const department = (controls.department as HTMLSelectElement).selectedOptions[0];
    const lines = [
      'Hello AKMICS, I would like to enquire about a cruise career.',
      input.name && `Name: ${input.name}`,
      input.phone && `Phone: ${input.phone}`,
      input.email && `Email: ${input.email}`,
      input.profession && `Education / profession: ${input.profession}`,
      input.department && department && `Interested department: ${department.textContent?.trim()}`,
      input.message && `Message: ${input.message}`,
    ].filter(Boolean);
    const base = form!.dataset.whatsapp ?? 'https://wa.me/919185282229';
    return `${base}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  function setBusy(busy: boolean): void {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
  }

  // Keep a draft so nothing typed is lost to a reload or a failed send; validate live after the first attempt.
  form.addEventListener('input', (event) => {
    const { data } = values();
    delete data.website;
    writeDraft(data);
    const name = (event.target as HTMLElement).getAttribute('name') as EnquiryField;
    if (!(ENQUIRY_FIELDS as readonly string[]).includes(name)) return;
    // Once a field is flagged (or after a send attempt), its message updates as the visitor types.
    if (attempted || controls[name].getAttribute('aria-invalid') === 'true') showFieldError(name, validateField(name, values().input, allowedDepartments));
  });

  // Pressing a form button blurs the field first; showing an error then would shift the button
  // between mousedown and mouseup and swallow the click. The submit handler validates everything anyway.
  let pressingButton = false;
  form.addEventListener('pointerdown', (event) => {
    if ((event.target as HTMLElement).closest('button')) { pressingButton = true; window.setTimeout(() => { pressingButton = false; }, 600); }
  });
  form.addEventListener('focusout', (event) => {
    const name = (event.target as HTMLElement).getAttribute('name') as EnquiryField;
    if (pressingButton || !(ENQUIRY_FIELDS as readonly string[]).includes(name)) return;
    if (attempted || (controls[name].value && name !== 'consent')) showFieldError(name, validateField(name, values().input, allowedDepartments));
  });

  // WhatsApp is a human action: exempt from the bot timer and from validation.
  whatsapp.addEventListener('click', () => { window.open(whatsappLink(), '_blank', 'noopener'); });

  // Returning with the Back button restores the page from cache with the button still disabled.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) { setBusy(false); if (!status.classList.contains('is-error')) setStatus(''); }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    attempted = true;
    const { data, input } = values();
    const errors = validateEnquiry(input, allowedDepartments);
    showErrors(errors);
    if (Object.keys(errors).length) { setStatus(''); return; }
    if (!navigator.onLine) { setStatus(FAILURES.offline, true); return; }

    setBusy(true);
    setStatus('Sending your enquiry…');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    let sent = false;
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, consent: input.consent, sentAt: Date.now() }),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: FieldErrors; redirect?: string };
      if (response.ok && result.ok) {
        sent = true;
        writeDraft(null);
        setStatus('Thank you. Your enquiry has been sent.');
        location.assign(result.redirect ?? THANK_YOU);
        return;
      }
      if (result.errors) { showErrors(result.errors); setStatus(''); }
      else setStatus(result.error && Object.hasOwn(FAILURES, result.error) ? FAILURES[result.error] : FAILURES.default, true);
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      setStatus(aborted ? FAILURES.timeout : navigator.onLine ? FAILURES.network : FAILURES.offline, true);
    } finally {
      window.clearTimeout(timer);
      // After a successful send the page is leaving: stay disabled (no double send); pageshow re-enables on Back.
      if (!sent) setBusy(false);
    }
  });
}
