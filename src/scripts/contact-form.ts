// Enquiry form: validates input, then either posts to a configured HTTPS endpoint
// (PUBLIC_FORM_ENDPOINT) or prepares a local text download when no endpoint exists.
const FIELDS = ['name', 'phone', 'email', 'profession', 'department', 'message'] as const;
const PHONE_DIGITS = { min: 7, max: 15 };
const TIMEOUT_MS = 15000;

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form) return;
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
  const status = form.querySelector<HTMLElement>('#form-status');
  const download = form.querySelector<HTMLAnchorElement>('#download-enquiry');
  const phone = form.querySelector<HTMLInputElement>('#phone');
  const department = form.querySelector<HTMLSelectElement>('#department');
  if (!button || !status || !download || !phone) return;
  button.disabled = false;

  const requested = new URLSearchParams(location.search).get('department');
  if (department && requested && [...department.options].some((option) => option.value === requested)) department.value = requested;

  phone.addEventListener('input', () => phone.setCustomValidity(''));
  let enquiryUrl: string | undefined;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= PHONE_DIGITS.min && digits.length <= PHONE_DIGITS.max ? '' : 'Enter a phone number containing 7–15 digits.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('website')) { status.textContent = 'Please leave the website field empty.'; return; }
    const endpoint = form.dataset.endpoint;

    if (!endpoint) {
      const text = ['AKMICS mentorship enquiry', ...FIELDS.map((key) => `${key}: ${String(data.get(key) || 'Not supplied')}`)].join('\n');
      if (enquiryUrl) URL.revokeObjectURL(enquiryUrl);
      enquiryUrl = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      download.href = enquiryUrl;
      download.hidden = false;
      status.textContent = 'Your enquiry is ready to download. It has not been sent — call +91 9185282229 or +91 9309469593 to discuss your goals.';
      return;
    }

    button.disabled = true;
    download.hidden = true;
    status.textContent = 'Sending your enquiry…';
    try {
      if (!endpoint.startsWith('https://')) throw new Error('Invalid endpoint');
      const body = new URLSearchParams();
      data.forEach((value, key) => body.set(key, String(value)));
      const response = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      const result: unknown = await response.json();
      const confirmed = typeof result === 'object' && result !== null && (result as { success?: unknown }).success === true;
      if (!response.ok || !confirmed) throw new Error('Submission not confirmed');
      status.textContent = 'Thank you — your enquiry has been received. Our team will contact you soon.';
      form.reset();
    } catch {
      status.textContent = 'We could not confirm delivery. Please call our team — your information is still in the form.';
    } finally {
      button.disabled = false;
    }
  });
}
