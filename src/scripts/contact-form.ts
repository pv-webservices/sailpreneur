// Enquiry form: validates input, then either posts to a configured HTTPS endpoint
// (PUBLIC_FORM_ENDPOINT) or opens the visitor's email app with the enquiry addressed to the academy.
const FIELDS = ['name', 'phone', 'email', 'profession', 'department', 'message'] as const;
const LABELS: Record<(typeof FIELDS)[number], string> = { name: 'Name', phone: 'Phone', email: 'Email', profession: 'Education / profession', department: 'Interested department', message: 'Message' };
const PHONE_DIGITS = { min: 7, max: 15 };
const TIMEOUT_MS = 15000;

/** Form providers differ: some acknowledge with `true`, others (e.g. FormSubmit) with the string "true". */
function isConfirmed(result: unknown): boolean {
  if (typeof result !== 'object' || result === null) return false;
  const success = (result as { success?: unknown }).success;
  return success === true || success === 'true';
}

function mailtoHref(address: string, data: FormData, department: HTMLSelectElement | null): string {
  const departmentName = department?.selectedOptions[0]?.textContent?.trim();
  const value = (key: (typeof FIELDS)[number]) =>
    key === 'department' ? departmentName || 'Still exploring' : String(data.get(key) || '').trim() || 'Not supplied';
  const body = FIELDS.map((key) => `${LABELS[key]}: ${value(key)}`).join('\n');
  const subject = `Cruise career enquiry — ${value('name')}`;
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form) return;
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
  const status = form.querySelector<HTMLElement>('#form-status');
  const phone = form.querySelector<HTMLInputElement>('#phone');
  const department = form.querySelector<HTMLSelectElement>('#department');
  if (!button || !status || !phone) return;
  button.disabled = false;

  const requested = new URLSearchParams(location.search).get('department');
  if (department && requested && [...department.options].some((option) => option.value === requested)) department.value = requested;

  phone.addEventListener('input', () => phone.setCustomValidity(''));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= PHONE_DIGITS.min && digits.length <= PHONE_DIGITS.max ? '' : 'Enter a phone number containing 7–15 digits.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('website')) { status.textContent = 'Please leave the website field empty.'; return; }
    const { endpoint, email } = form.dataset;

    if (!endpoint) {
      if (!email) { status.textContent = 'Please call our team to make your enquiry.'; return; }
      location.href = mailtoHref(email, data, department);
      status.textContent = `Your email app should now be open with your enquiry addressed to ${email}. Press send to deliver it — if nothing opened, email us directly or call +91 9185282229.`;
      return;
    }

    button.disabled = true;
    status.textContent = 'Sending your enquiry…';
    try {
      if (!endpoint.startsWith('https://')) throw new Error('Invalid endpoint');
      const body = new URLSearchParams();
      data.forEach((value, key) => body.set(key, String(value)));
      const response = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      const result: unknown = await response.json();
      if (!response.ok || !isConfirmed(result)) throw new Error('Submission not confirmed');
      status.textContent = 'Thank you — your enquiry has been received. Our team will contact you soon.';
      form.reset();
    } catch {
      status.textContent = `We could not confirm delivery. Please email ${email ?? 'us'} or call our team — your information is still in the form.`;
    } finally {
      button.disabled = false;
    }
  });
}
