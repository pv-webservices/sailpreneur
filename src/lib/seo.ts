// Structured data and title helpers shared by every page. Facts come from src/data/site.ts only.
import { brand, plans } from '../data/site';
import { media } from './media';

export const SITE_NAME = 'AKMICS Sailpreneur Academy';
const TITLE_MAX = 65;

/** "<page> | AKMICS Sailpreneur Academy", falling back to the short brand when that would exceed 65 characters. */
export function pageTitle(title: string, home = false): string {
  if (home) return `${SITE_NAME} | ${title}`.length <= TITLE_MAX ? `${SITE_NAME} | ${title}` : title;
  for (const suffix of [` | ${SITE_NAME}`, ' | AKMICS']) {
    if (title.length + suffix.length <= TITLE_MAX) return title + suffix;
  }
  return title;
}

export type Crumb = [path: string, label: string];
type Schema = Record<string, unknown>;

const id = (site: URL, fragment: string) => new URL(fragment, site).href;
const abs = (site: URL, path: string) => new URL(path, site).href;

export function organization(site: URL): Schema {
  const logo = media('logo-card');
  const prices = plans.map((plan) => plan.price);
  return {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': id(site, '/#organization'),
    name: SITE_NAME,
    alternateName: [brand.name, brand.academy],
    legalName: brand.company,
    slogan: brand.tagline,
    description: 'Online cruise career mentorship, interview preparation and joining guidance for international cruise ship careers.',
    url: abs(site, '/'),
    logo: { '@type': 'ImageObject', '@id': id(site, '/#logo'), url: abs(site, logo.src), width: logo.width, height: logo.height, caption: SITE_NAME },
    image: abs(site, '/images/brand/og-default.jpg'),
    telephone: brand.phones[0].replace(/\s/g, ''),
    email: brand.email,
    priceRange: `${prices[0]} – ${prices[prices.length - 1]}`,
    address: { '@type': 'PostalAddress', streetAddress: 'D.A.V. PG College Road', addressLocality: 'Dehradun', addressRegion: 'Uttarakhand', addressCountry: 'IN' },
    contactPoint: brand.phones.map((phone) => ({ '@type': 'ContactPoint', telephone: phone.replace(/\s/g, ''), contactType: 'admissions', email: brand.email })),
    founder: { '@id': id(site, '/our-mentor/#person') },
    sameAs: [...brand.instagram.map((account) => account.url), brand.facebook],
  };
}

export function website(site: URL): Schema {
  return { '@type': 'WebSite', '@id': id(site, '/#website'), url: abs(site, '/'), name: SITE_NAME, inLanguage: 'en-IN', publisher: { '@id': id(site, '/#organization') } };
}

export function founder(site: URL): Schema {
  return {
    '@type': 'Person', '@id': id(site, '/our-mentor/#person'), name: 'Ankur Kumar Mishra', url: abs(site, '/our-mentor/'),
    jobTitle: 'Founder & Cruise Career Mentor', image: abs(site, media('ankur-portrait').src),
    worksFor: { '@id': id(site, '/#organization') },
  };
}

export function breadcrumbList(site: URL, crumbs: Crumb[]): Schema {
  return {
    '@type': 'BreadcrumbList', '@id': id(site, `${crumbs[crumbs.length - 1][0]}#breadcrumb`),
    itemListElement: crumbs.map(([path, label], i) => ({ '@type': 'ListItem', position: i + 1, name: label, item: abs(site, path) })),
  };
}

export function webPage(site: URL, path: string, name: string, description: string, crumbs: Crumb[] | undefined, type = 'WebPage'): Schema {
  return {
    '@type': type, '@id': id(site, `${path}#webpage`), url: abs(site, path), name, description, inLanguage: 'en-IN',
    isPartOf: { '@id': id(site, '/#website') }, about: { '@id': id(site, '/#organization') },
    ...(crumbs ? { breadcrumb: { '@id': id(site, `${path}#breadcrumb`) } } : {}),
  };
}

export function faqPage(site: URL, path: string, faqs: [string, string][]): Schema {
  return {
    '@type': 'FAQPage', '@id': id(site, `${path}#faq`),
    mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  };
}

export function service(site: URL, path: string, name: string, description: string): Schema {
  return { '@type': 'Service', '@id': id(site, `${path}#service`), name, description, serviceType: 'Cruise career mentorship', url: abs(site, path), provider: { '@id': id(site, '/#organization') } };
}

export function person(site: URL, path: string, name: string, jobTitle: string, image: string, description: string): Schema {
  return { '@type': 'Person', '@id': id(site, `${path}#person`), name, jobTitle, description, image: abs(site, image), url: abs(site, path), affiliation: { '@id': id(site, '/#organization') } };
}

/** JSON-LD safe for inline <script>: "<" is escaped so content can never close the tag. */
export function jsonLd(graph: Schema[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
