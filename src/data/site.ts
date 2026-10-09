// Single source of truth for business content. Facts below come from the client's
// supplied materials (logo card, founder posters, "Parents Trust AKMICS", "Why Join AKMICS",
// and the four success-story posters in /public). Do not add unverified claims here.

export const brand = {
  name: 'AKMICS',
  academy: 'Sailpreneur Academy',
  company: 'Ankur Kumar Mishra Institute of Cruise Studies Pvt. Ltd.',
  tagline: 'Navigating Careers, Anchoring Futures',
  logoLine: 'Navigate Your Dream Cruise Career',
  address: '43, D.A.V. PG College Road, Dehradun, Uttarakhand',
  phones: ['+91 9185282229', '+91 9309469593'],
  instagram: [
    { handle: '@akmics.official', url: 'https://www.instagram.com/akmics.official/' },
    { handle: '@ankur.sailpreneur.academy', url: 'https://www.instagram.com/ankur.sailpreneur.academy/' },
  ],
};

export const tel = (phone: string): string => `tel:${phone.replace(/\s/g, '')}`;
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`;

export const nav: [string, string][] = [
  ['/', 'Home'],
  ['/about/', 'About'],
  ['/mentorship-program/', 'Programs'],
  ['/career-pathways/', 'Careers'],
  ['/success-stories/', 'Success Stories'],
  ['/our-mentor/', 'Our Mentor'],
  ['/expert-panel/', 'Experts'],
  ['/contact/', 'Contact'],
];

// Founder facts from "Meet Your Mentor — Ankur Mishra" and "Why Join AKMICS?" posters.
export const stats = [
  { value: 12, suffix: '', label: 'Years at sea', note: 'Real cruise experience' },
  { value: 50, suffix: '', label: 'Countries travelled', note: 'On cruise ships, as crew' },
  { value: 65, suffix: '', label: 'Islands explored', note: 'Not a tourist — this was work' },
  { value: 35, suffix: '+', label: 'Years expert panel', note: 'Hospitality & industry mentors' },
  { value: 20, suffix: '+', label: 'Careers launched', note: 'Students now working at sea' },
];

export const journey = [
  { name: 'Discover', icon: 'compass', text: 'Explore roles, understand departments and set your goals.', detail: 'Explore the cruise industry, its departments and the kind of work that interests you. Discuss your background with a mentor in a personal profile assessment and identify the questions you need to answer before choosing a pathway.', takeaway: 'A clearer career direction.' },
  { name: 'Prepare', icon: 'document', text: 'Build skills, get guidance and create your career plan.', detail: 'Bring your education and experience together in a professional, role-focused CV. Work on communication, presentation and a practical preparation plan for your chosen department.', takeaway: 'A professional profile you can explain with confidence.' },
  { name: 'Develop', icon: 'book', text: 'CV, application, documents and industry knowledge.', detail: 'Build hospitality knowledge, USPH hygiene awareness, language skills and confidence. Understand service standards and how working with an international team differs from your current environment.', takeaway: 'A focused plan for improving your skills.' },
  { name: 'Interview', icon: 'chat', text: 'Master interviews with expert coaching and mock sessions.', detail: 'Prepare for role-related questions and practise through realistic mock interviews with our expert panel. Use feedback to improve the clarity, relevance and professionalism of your answers.', takeaway: 'Sharper answers and real interview readiness.' },
  { name: 'Get Ready', icon: 'shield', text: 'STCW, CDC, visa guidance, medical and final documentation.', detail: 'Understand the STCW, CDC, medical and visa steps and organise your joining documents. Follow the requirements of your recruiter, employer and authorised providers with a mentor alongside you.', takeaway: 'Documents organised and next steps understood.' },
  { name: 'Step Onboard', icon: 'ship', text: 'Understand the joining process and begin your journey.', detail: 'Prepare for the transition to shipboard life with a pre-embarkation briefing: shared accommodation, routines, teamwork, safety expectations and adapting to a multicultural workplace.', takeaway: 'A confident start to life at sea.' },
  { name: 'Grow', icon: 'star', text: 'Gain experience, earn promotions and build a global career.', detail: 'Reflect on feedback, maintain professional standards and develop leadership skills. AKMICS stays in touch with lifetime alumni guidance as you build a long-term career in cruise operations.', takeaway: 'Lifetime support for continued growth.' },
];

export const services = [
  { slug: 'cruise-career-roadmap', name: 'Cruise Career Roadmap', icon: 'compass', image: 'journey-ocean', label: 'Find your direction', text: 'Personalised career planning and a profile assessment to match your goals.', topics: ['Profile assessment of your skills and experience', 'Explore cruise departments and role expectations', 'A step-by-step preparation plan for your chosen pathway'], outcome: 'A clear, personal direction for your cruise career.', category: '01 · Career direction' },
  { slug: 'cv-application-guidance', name: 'CV & Application Guidance', icon: 'document', image: null, label: 'Tell your professional story', text: 'Professional CV crafting and application support for cruise roles.', topics: ['Structure your education, experience and skills', 'Tailor your profile to your target department', 'Prepare to explain your experience and application'], outcome: 'An international-standard CV that represents you accurately.', category: '02 · Professional profile' },
  { slug: 'interview-preparation', name: 'Interview Preparation', icon: 'chat', image: 'mentorship-session', label: 'Confidence comes from preparation', text: 'Mock interviews and expert feedback from our 35+ years expert panel.', topics: ['Understand common cruise interview themes', 'Practise concise, relevant answers in realistic mock interviews', 'Confidence training and personalised feedback'], outcome: 'Real interview readiness — the step our students credit most.', category: '03 · Interview mastery' },
  { slug: 'visa-guidance', name: 'Visa Guidance', icon: 'globe', image: null, label: 'Understand the process', text: 'Step-by-step guidance through the visa process for cruise employment.', topics: ['Understand employment-related travel documentation', 'Organise your documents and questions for each stage', 'Follow the current instructions of the relevant authority'], outcome: 'A prepared, organised visa process. Approval rests with the issuing authority.', category: '04 · Joining preparation' },
  { slug: 'documentation-joining-guidance', name: 'Documentation & Joining Guidance', icon: 'folder', image: null, label: 'Prepare with clarity', text: 'Complete document preparation, verification support and joining guidance.', topics: ['Build and verify your document checklist, including CDC', 'Understand medical and joining expectations', 'Pre-embarkation briefing before you join your ship'], outcome: 'Documents in order and a calm, organised joining process.', category: '05 · Joining preparation' },
  { slug: 'stcw-maritime-knowledge', name: 'STCW & Maritime Knowledge', icon: 'shield', image: 'dept-deck', label: 'Know the shipboard context', text: 'STCW certification guidance and essential maritime safety knowledge.', topics: ['Understand STCW safety training and why it matters', 'Learn how requirements differ across roles', 'Get connected with the right authorised training providers'], outcome: 'Clarity on maritime requirements. Certificates are issued by authorised providers.', category: '06 · Maritime knowledge' },
  { slug: 'usph-shipboard-hygiene', name: 'USPH & Hygiene Knowledge', icon: 'sparkle', image: 'dept-galley', label: 'Understand service standards', text: 'Health, safety and onboard hygiene standards for shipboard hospitality.', topics: ['Build awareness of USPH shipboard hygiene expectations', 'Understand safe food and service practices', 'Connect hygiene knowledge with your department'], outcome: 'A strong foundation in the standards every cruise department follows.', category: '07 · Hospitality knowledge' },
  { slug: 'hospitality-knowledge', name: 'Food & Beverage / Hospitality', icon: 'glass', image: 'dept-fnb', label: 'Build your service foundation', text: 'Practical hospitality training and F&B skill development.', topics: ['Food & Beverage and hospitality fundamentals', 'Guest service, etiquette and teamwork', 'Department-focused interview preparation'], outcome: 'The service knowledge international cruise guests expect.', category: '08 · Hospitality knowledge' },
  { slug: 'life-onboard', name: 'Understanding Life Onboard', icon: 'ship', image: 'ship-atrium', label: 'Look beyond the destination', text: 'Real insights about onboard life, routines and crew culture.', topics: ['Shipboard routines, shared cabins and crew life', 'Working in a multicultural team', 'Adaptability and professional expectations at sea'], outcome: 'A realistic, first-hand perspective on living and working onboard.', category: '09 · Life at sea' },
  { slug: 'personal-development', name: 'Personal Development', icon: 'user', image: null, label: 'Grow into your next chapter', text: 'Grooming, communication and confidence building.', topics: ['Professional grooming and presentation', 'Clear, confident communication', 'Build confidence through preparation and feedback'], outcome: 'The confidence and professional mindset recruiters notice.', category: '10 · Personal growth' },
  { slug: 'career-growth', name: 'Career Growth & Promotion Guidance', icon: 'trend', image: null, label: 'Think beyond your first role', text: 'Long-term career planning and progression after you join.', topics: ['Reflect on feedback and learning needs', 'Develop leadership and communication skills', 'Plan your long-term growth with alumni support'], outcome: 'A plan for growth, with lifetime alumni guidance. Promotions are decided by the employer.', category: '11 · Long-term development' },
];

export const experts = [
  { slug: 'ashish-sharma', name: 'Ashish Sharma', role: 'Cruise Ship Food & Beverage Director', image: 'expert-ashish', focus: 'Cruise hospitality & F&B', text: 'Cruise hospitality, Food & Beverage operations, service standards, shipboard professionalism and leadership.', contribution: 'Connects hospitality preparation with the service standards and teamwork of a shipboard Food & Beverage environment.' },
  { slug: 'sanjay-mamgain', name: 'Sanjay Mamgain', role: 'Hospitality Professional & Academic Mentor', image: 'expert-sanjay', focus: 'Hospitality & career development', text: 'Hospitality fundamentals, Food & Beverage, academic guidance and career development.', contribution: 'Strengthens the hospitality foundations that support interview preparation and professional growth.' },
  { slug: 'anirudh-prakash-mishra', name: 'Anirudh Prakash Mishra', role: 'Hospitality & Academic Expert', image: 'expert-anirudh', focus: 'Hotel operations & leadership', text: 'Hospitality management, rooms division, hotel operations, leadership and professional standards.', contribution: 'Helps candidates connect their hospitality knowledge with the expectations of professional hotel and rooms operations.' },
  { slug: 'kalyani-mishra', name: 'Kalyani Mishra', role: 'French Language Mentor', image: 'expert-kalyani', focus: 'French & guest communication', text: 'French communication, hospitality vocabulary, pronunciation and guest interactions.', contribution: 'Supports language preparation and clearer communication in guest-facing hospitality situations.' },
  { slug: 'mudita-mittal', name: 'Mudita Mittal', role: 'Personal Development & Career Coach', image: 'expert-mudita', focus: 'Confidence & professional mindset', text: 'Confidence, career planning, personal development, communication and professional mindset.', contribution: 'Helps candidates reflect on their goals and strengthen the confidence and communication behind professional preparation.' },
];

export const departments = [
  { slug: 'hotel', name: 'Hotel Department', image: 'dept-hotel', short: 'Guest services, front office, concierge and more.', roles: 'Front office, guest relations, concierge and hospitality functions', text: 'Guest-facing teams help passengers navigate their stay and feel welcome. Communication, attention to detail and a calm approach are the foundations.', prepare: 'Practise guest-service situations, professional communication and how to present your hospitality experience.' },
  { slug: 'food-beverage', name: 'Food & Beverage', image: 'dept-fnb', short: 'Restaurant, bar, banquet and culinary services.', roles: 'Restaurant, bar, banquet and hospitality service roles', text: 'F&B teams combine service knowledge, teamwork and guest interaction — from restaurants to bars. Relevant service experience and hygiene knowledge give candidates an edge.', prepare: 'Service standards, F&B fundamentals and department-focused mock interviews with our F&B expert.' },
  { slug: 'housekeeping', name: 'Housekeeping', image: 'dept-housekeeping', short: 'Maintaining luxury and comfort at sea.', roles: 'Stateroom, accommodation and public-area operations', text: 'Housekeeping teams keep guest staterooms and shared spaces immaculate. Organisation, consistency and care are central to the department.', prepare: 'Service routines, USPH hygiene expectations and communication within an operational team.' },
  { slug: 'galley', name: 'Galley / Culinary', image: 'dept-galley', short: 'Work in world-class kitchens with global chefs.', roles: 'Kitchen operations and culinary roles, from commis upward', text: 'Galley teams work in a fast, coordinated culinary environment. Requirements depend on the role and may include culinary education or practical kitchen experience.', prepare: 'Your culinary background, kitchen teamwork, hygiene awareness and role-specific interview preparation.' },
  { slug: 'deck', name: 'Deck Department', image: 'dept-deck', short: 'Navigation, safety and ship operations.', roles: 'Deck-related roles, subject to maritime qualifications', text: 'Deck roles involve navigation, safety and ship operations and require specific maritime training such as STCW. We help you understand exactly what each role requires.', prepare: 'Clarify your current qualifications and plan the certifications required with authorised training providers.' },
];

export interface Story {
  slug: string; name: string; from: string; headline: string; department: string; cruiseLine: string;
  image: string | null; points: string[]; quote?: string; meta?: string;
}

// Transcribed from the client's success-story posters. Salary figures are intentionally not republished.
export const stories: Story[] = [
  { slug: 'sahil', name: 'Sahil', from: 'Delhi', headline: 'Barista → Bartender at Sea', department: 'F&B · Bar Department', cruiseLine: 'Norwegian Cruise Line', image: 'student-sahil', points: ['Was rejected 3 times — didn’t give up. Learned. Improved. Succeeded.', 'AKMICS interview mastery: mock interviews, resume coaching, confidence training', 'Now onboard Norwegian Cruise Line as a Bartender'], quote: 'AKMICS changed my preparation completely. The mock interviews felt real — now I’m serving guests across the Mediterranean!', meta: 'Sahil, Delhi · Hired Nov 2024' },
  { slug: 'anjali', name: 'Anjali Rawat', from: 'Dehradun', headline: 'Fresh Graduate → Deck Crew', department: 'Deck Department', cruiseLine: 'Princess Cruises', image: 'student-anjali', points: ['Trained from zero, just after completing Hotel Management', 'No experience → now a cruise professional', 'Now onboard Princess Cruises — world tour started'], meta: 'Guided by Ankur Kumar Mishra' },
  { slug: 'amit', name: 'Amit Kumar', from: 'Himachal', headline: 'Village Boy → International Chef', department: 'Galley · Commis', cruiseLine: 'MSC Cruises', image: 'student-amit', points: ['No one guided him — just a dream from the mountains of Himachal', 'AKMICS helped with CDC, STCW, medical and the visa process', 'Now working on MSC Cruises as Commis'], quote: 'Coming from a small village, I thought working on an international cruise was impossible. AKMICS guided me step by step — from CDC to STCW to my visa. Today I am living my dream, cooking for guests from around the world. Forever grateful!', meta: 'Amit Kumar, Himachal' },
  { slug: 'rohit', name: 'Rohit', from: 'Dehradun', headline: 'From Zero → Cruise Hero', department: 'Hotel Management Graduate', cruiseLine: 'Carnival Cruise Line', image: null, points: ['CV building and interview coaching', 'STCW certification and visa assistance', 'Now onboard Carnival Cruise Line'], quote: 'Was confused about cruise jobs. AKMICS guided me step-by-step — from CV building, interview preparation, STCW certification, to visa processing. Now I’m onboard the Carnival Cruise Line, living the dream at sea!', meta: 'Rohit, Dehradun' },
];

// From the "Parents Trust AKMICS" and "Why Join AKMICS?" posters.
export const trust = [
  { icon: 'wheel', title: 'Real Sea Experience', text: '12 years onboard cruise ships — guidance from someone who has actually done it.' },
  { icon: 'handshake', title: 'Transparent Guidance', text: 'Honest advice and a clear roadmap for your (or your child’s) career.' },
  { icon: 'users', title: 'Expert Panel Support', text: '35+ years of combined experience from seasoned hospitality mentors.' },
  { icon: 'award', title: 'Proven Track Record', text: '20+ careers launched with students now working on international cruise lines.' },
  { icon: 'infinity', title: 'Lifetime Support', text: 'Alumni guidance and career support that continues after you join.' },
  { icon: 'shield', title: 'No Fake Promises', text: 'Ethical counselling. We prepare you thoroughly — recruiters make the final call.' },
];

export const faqs: [string, string][] = [
  ['What is cruise career mentorship?', 'It is structured guidance to help you understand cruise careers and prepare professionally. AKMICS covers career direction, CV preparation, interviews, hospitality and USPH knowledge, STCW/CDC/visa documentation guidance and personal development.'],
  ['Who is the mentorship designed for?', 'Students, fresh graduates, hotel-management graduates, hospitality employees and anyone exploring a cruise career. Parents are welcome to join the first conversation.'],
  ['Can freshers apply?', 'Yes. Several AKMICS students started with no experience. Eligibility for a specific job still depends on the employer, department and role requirements.'],
  ['Does AKMICS guarantee a cruise job?', 'No — and we believe honesty matters. AKMICS prepares you thoroughly and supports you through the process, but recruitment decisions belong to employers and recruiters.'],
  ['How does interview preparation work?', 'You practise realistic mock interviews with our expert panel, receive feedback on your answers and presentation, and work on confidence and communication until you are ready.'],
  ['Does AKMICS issue maritime certificates?', 'No. We guide you on STCW, CDC and medical requirements and help you through the process; the certificates themselves are issued by authorised training providers and authorities.'],
  ['Do you help with the visa process?', 'Yes, we guide you step by step through visa preparation and documentation. Visa decisions are made by the relevant issuing authority.'],
  ['What documents may be required?', 'Typically a passport, CDC, STCW certificates, a medical certificate and a visa — but requirements vary by role, employer and joining arrangements. We help you build the right checklist.'],
  ['How do I find out about fees and duration?', 'Call or visit the academy in Dehradun for the current program fee, duration, batch dates, inclusions and payment terms.'],
  ['Can experienced hospitality professionals join?', 'Yes. Hospitality professionals can enrol for department-focused preparation, interview practice and career-growth guidance.'],
];

export const routeTitles: Record<string, string> = {
  about: 'About AKMICS', 'our-mentor': 'Meet Your Mentor', 'mentorship-program': 'Cruise Career Programs', 'career-pathways': 'Cruise Career Departments', 'expert-panel': 'Meet Our Expert Panel', 'success-stories': 'Success Stories', 'cruise-career-journey': 'Your Cruise Career Journey', faq: 'Frequently Asked Questions', contact: 'Start Your Cruise Journey', 'privacy-policy': 'Privacy Policy', 'terms-and-conditions': 'Terms & Conditions',
};
