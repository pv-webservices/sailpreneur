// Single source of truth for business content. Facts below come from the client's
// supplied materials (logo card, founder posters, "Parents Trust AKMICS", "Why Join AKMICS",
// and the four success-story posters in /public). Do not add unverified claims here.

export const brand = {
  name: 'AKMICS',
  academy: 'Sailpreneur Academy',
  company: 'Ankur Kumar Mishra Institute of Cruise Studies Pvt. Ltd.',
  tagline: 'Navigating Careers, Anchoring Futures',
  logoLine: 'Navigate Your Dream Cruise Career',
  address: 'D.A.V. PG College Road, Dehradun, Uttarakhand',
  phones: ['+91 9185282229', '+91 9309469593'],
  email: 'info@cruisejobmentor.com',
  instagram: [
    { handle: '@sailpreneur', url: 'https://www.instagram.com/sailpreneur/' },
  ],
  facebook: 'https://www.facebook.com/share/1HrdNGdyno/?mibextid=wwXIfr',
};

export const tel = (phone: string): string => `tel:${phone.replace(/\s/g, '')}`;

/** WhatsApp chat with the academy's primary number, optionally pre-filled. */
export const WHATSAPP_NUMBER = '919185282229';
export const whatsappHref = (text = ''): string => `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

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
  { value: 11, suffix: '+', icon: 'wheel', label: 'Years at sea', note: 'Real cruise experience' },
  { value: 50, suffix: '+', icon: 'globe', label: 'Countries travelled', note: 'On cruise ships, as crew' },
  { value: 65, suffix: '+', icon: 'map', label: 'Islands explored', note: 'Not a tourist — this was work' },
  { value: 35, suffix: '+', icon: 'users', label: 'Years expert panel', note: 'Hospitality & industry mentors' },
  { value: 20, suffix: '+', icon: 'award', label: 'Careers launched', note: 'Students now working at sea' },
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
  { slug: 'food-beverage', name: 'F&B Service & Operations', icon: 'glass', image: 'dept-fnb', label: 'Build your service foundation', text: 'Practical F&B training and skill development.', topics: ['Food & Beverage service fundamentals', 'Guest service, etiquette and teamwork', 'Department-focused interview preparation'], outcome: 'The service knowledge international cruise guests expect.', category: '07 · Food & Beverage' },
  { slug: 'front-office', name: 'Guest Relations & Front Desk', icon: 'users', image: 'dept-hotel', label: 'Be the first welcome onboard', text: 'Guest services, reception and concierge skills', topics: ['Guest relations, reception and concierge operations', 'Handling guest queries, requests and concerns professionally', 'Communication, grooming and front-desk interview preparation'], outcome: 'The guest-service confidence front office teams look for.', category: '08 · Front Office' },
  { slug: 'housekeeping', name: 'Housekeeping Operations & Standards', icon: 'star', image: 'dept-housekeeping', label: 'Maintain luxury and comfort at sea', text: 'Stateroom care and public-area standards', topics: ['Stateroom and accommodation care routines', 'Public-area cleanliness and USPH hygiene expectations', 'Teamwork, time management and housekeeping interview preparation'], outcome: 'A clear understanding of the standards that keep a cruise ship immaculate.', category: '09 · Housekeeping' },
  { slug: 'culinary', name: 'Culinary | Galley', icon: 'ship', image: 'dept-galley', label: 'Cook for the world at sea', text: 'Galley operations, food production, kitchen coordination with F&B', topics: ['Galley operations and kitchen roles, from commis upward', 'Food safety, hygiene and USPH galley standards', 'Your culinary background and role-specific interview preparation'], outcome: 'Readiness for the fast, coordinated culinary environment of a cruise galley.', category: '10 · Culinary' },
  { slug: 'deck-security', name: 'Deck & Security Department', icon: 'shield', image: 'program-deck-security', fallbackImage: 'dept-deck', label: 'Keep the ship safe at sea', text: 'Ensuring safe navigation and security while at sea.', topics: ['Navigation, seamanship and mooring', 'Deck operations onboard', 'Shipboard security and safety protocols'], outcome: 'A clear understanding of deck and security roles and what each one requires. Maritime certificates are issued by authorised providers.', category: '11 · Deck & Security' },
  { slug: 'spa-wellness', name: 'Wellness & Beautician Department', icon: 'sparkle', image: 'program-spa-wellness', label: 'Bring wellness to sea', text: 'Spa therapies, salon, beautician, fitness, wellness services for guests and crew.', topics: ['Spa therapies onboard', 'Salon and beautician services', 'Wellness services and guest care'], outcome: 'A focused path into the spa, salon and wellness teams of a cruise ship.', category: '12 · Wellness' },
  { slug: 'usph-shipboard-hygiene', name: 'USPH & Hygiene Knowledge', icon: 'sparkle', image: null, label: 'Understand service standards', text: 'Health, safety and onboard hygiene standards for shipboard hospitality.', topics: ['Build awareness of USPH shipboard hygiene expectations', 'Understand safe food and service practices', 'Connect hygiene knowledge with your department'], outcome: 'A strong foundation in the standards every cruise department follows.', category: '13 · Hygiene & safety' },
  { slug: 'life-onboard', name: 'Understanding Life Onboard', icon: 'ship', image: 'ship-atrium', label: 'Look beyond the destination', text: 'Real insights about onboard life, routines and crew culture.', topics: ['Shipboard routines, shared cabins and crew life', 'Working in a multicultural team', 'Adaptability and professional expectations at sea'], outcome: 'A realistic, first-hand perspective on living and working onboard.', category: '14 · Life at sea' },
  { slug: 'personal-development', name: 'Personal Development', icon: 'user', image: null, label: 'Grow into your next chapter', text: 'Grooming, communication and confidence building.', topics: ['Professional grooming and presentation', 'Clear, confident communication', 'Build confidence through preparation and feedback'], outcome: 'The confidence and professional mindset recruiters notice.', category: '15 · Personal growth' },
  { slug: 'career-growth', name: 'Career Growth & Promotion Guidance', icon: 'trend', image: null, label: 'Think beyond your first role', text: 'Long-term career planning and progression after you join.', topics: ['Reflect on feedback and learning needs', 'Develop leadership and communication skills', 'Plan your long-term growth with alumni support'], outcome: 'A plan for growth, with lifetime alumni guidance. Promotions are decided by the employer.', category: '16 · Long-term development' },
];

export interface Expert {
  slug: string; name: string; role: string; image: string; focus: string;
  /** Years of industry experience, shown as a badge. Null until the client confirms a figure. */
  years: number | null;
  headline: string; text: string; story: string[]; gives: string;
}

// Profiles as supplied by the client for the Expert Panel page.
export const experts: Expert[] = [
  { slug: 'ashish-sharma', name: 'Ashish Sharma', role: 'Food & Beverage Director, International Cruise Line', image: 'expert-ashish', focus: 'Cruise F&B & leadership', years: 25,
    headline: 'The man who sailed from Taj to the world’s biggest cruise ships.',
    text: 'From the kitchens and halls of Taj Hotels to Food & Beverage Director with one of the world’s biggest cruise brands.',
    story: ['His story started in the kitchens and halls of Taj Hotels — where hospitality is not a job, but a culture. From there, he sailed across oceans, working with multiple cruise liners, and today serves as Food & Beverage Director with one of the biggest cruise brands in the world.', 'He has seen what it takes to go from a 5-star hotel in India to a 5-star floating city at sea. When he teaches you F&B, he is not teaching theory — he is sharing what actually works on board when 6,000 guests are dining.'],
    gives: 'Real cruise F&B standards, leadership at sea, and how Taj hospitality can take you to global cruise lines.' },
  { slug: 'sanjay-mamgain', name: 'Sanjay Mamgain', role: 'Hospitality Professional & F&B Academic Mentor', image: 'expert-sanjay', focus: 'F&B · industry & classroom', years: 30,
    headline: '30 years of hospitality — on the floor and in the classroom.',
    text: 'Three decades in top hotel operations and hospitality education, specialising in Food & Beverage.',
    story: ['30 years. That’s how long he has lived hospitality. He has worked in top hotel operations and then dedicated his life to teaching it. He is the bridge between industry and education.', 'He knows both sides — what hotels and ships want, and why students fail to get it. His specialisation in Food & Beverage is not just about service; it’s about understanding quality, cost and guest psychology.'],
    gives: 'Academic clarity with industry reality — the F&B knowledge that recruiters actually test in interviews.' },
  { slug: 'anirudh-prakash', name: 'Anirudh Prakash', role: 'Former General Manager · IHM Trainer · NCVT Expert', image: 'expert-anirudh', focus: 'All 4 hotel departments', years: 35,
    headline: '35 years, 4 departments, countless General Manager chairs.',
    text: 'Former General Manager and IHM trainer with experience across Front Office, Housekeeping, F&B and Culinary.',
    story: ['If hospitality had a legend, it would be him. 35 years of experience covering all four major departments — Front Office, Housekeeping, Food & Beverage and Culinary. He has led hotels as General Manager and has trained thousands at the Institute of Hotel Management (IHM). He is an NCVT Expert, a certified professor and an assessor.', 'He has seen the industry change for three decades. He knows what never changes.'],
    gives: '360-degree hospitality. No matter which department you dream of, he has led it — learn the complete picture, not just one piece.' },
  { slug: 'kalyani', name: 'Kalyani', role: 'French Language Expert & Business Development Manager', image: 'expert-kalyani', focus: 'French for cruise careers', years: 8,
    headline: 'Where French meets hospitality — and your career takes off.',
    text: 'A French Institute-trained language expert and Business Development Manager with one of India’s best brands.',
    story: ['She is not just a French expert — she is a Business Development Manager with one of India’s best brands, trained at a French institute. She brings something no one else in cruise training offers.', 'On international cruise ships, knowing French is not extra — it’s an advantage that puts you in guest-facing, premium positions. She teaches you how to use hospitality, French and English together to earn better, grow faster and be remembered by guests.'],
    gives: 'The language edge. Learn how French can become your salary growth hack on board.' },
  { slug: 'mudita-mittal', name: 'Mudita Mittal', role: 'HR Expert — US Staffing & Cruise HR', image: 'expert-mudita', focus: 'Resume, English & interviews', years: 15,
    headline: 'The HR who has been on both sides of the interview table.',
    text: '15 years in US Staffing and Cruise HR — she knows why one resume is rejected in six seconds and another gets the call.',
    story: ['15 years in HR — US Staffing and Cruise HR. She has hired for cruises; she has rejected, and she has selected. She knows exactly why a resume goes into the dustbin in six seconds and why another one gets a call.', 'She doesn’t just teach English. She teaches you how to speak, how to present, how to build a resume that cruise recruiters trust, and the right step-by-step process so you don’t get scammed by fake agents.'],
    gives: 'Your personality, your resume, your spoken English and your complete career roadmap — guided by a real HR insider.' },
];

// From the client's "Choose Your Voyage — Fee Structure" poster.
export const plans = [
  { id: 'starter', badge: 'Starter', price: '₹9,999', name: 'Starter Sailor Program', tagline: 'Step-by-step guidance for beginners — everything you need to start.', featured: false,
    features: ['Step-by-step cruise career roadmap', 'Complete document guidance — CDC | Passport | STCW', 'Professional resume & cover letter building', 'Interview preparation & mock Q&A', 'Personality & grooming development', 'VISA process guidance', 'Genuine information — no fake promises', 'Lifetime community access', 'Study materials & resources'] },
  { id: 'complete', badge: 'Most Popular', price: '₹11,999', name: 'Complete Sailpreneur Program', tagline: 'Everything in Starter + advanced career support.', featured: true,
    features: ['Advanced interview Q&A preparation', 'Direct recruiter connect & placement support', '1:1 mentorship with Ankur Kumar Mishra', 'USPH training complete guide', 'STCW | SID | PCC | CDC full process support', 'VISA | Medical | LOE complete process', 'Offer letter verification support — fraud protection', 'Lifetime guidance & job updates', 'Resume blast to top cruise recruiters', 'Onboard life | salary & promotion guidance'] },
];

export const departments = [
  { slug: 'hotel', program: 'front-office', name: 'Hotel Department', image: 'dept-hotel', short: 'Guest services, front office, concierge and more.', roles: 'Front office, guest relations, concierge and hospitality functions', text: 'Guest-facing teams help passengers navigate their stay and feel welcome. Communication, attention to detail and a calm approach are the foundations.', prepare: 'Practise guest-service situations, professional communication and how to present your hospitality experience.' },
  { slug: 'food-beverage', program: 'food-beverage', name: 'Food & Beverage', image: 'dept-fnb', short: 'Restaurant, bar, banquet and culinary services.', roles: 'Restaurant, bar, banquet and hospitality service roles', text: 'F&B teams combine service knowledge, teamwork and guest interaction — from restaurants to bars. Relevant service experience and hygiene knowledge give candidates an edge.', prepare: 'Service standards, F&B fundamentals and department-focused mock interviews with our F&B expert.' },
  { slug: 'housekeeping', program: 'housekeeping', name: 'Housekeeping', image: 'dept-housekeeping', short: 'Maintaining luxury and comfort at sea.', roles: 'Stateroom, accommodation and public-area operations', text: 'Housekeeping teams keep guest staterooms and shared spaces immaculate. Organisation, consistency and care are central to the department.', prepare: 'Service routines, USPH hygiene expectations and communication within an operational team.' },
  { slug: 'galley', program: 'culinary', name: 'Galley / Culinary', image: 'dept-galley', short: 'Work in world-class kitchens with global chefs.', roles: 'Kitchen operations and culinary roles, from commis upward', text: 'Galley teams work in a fast, coordinated culinary environment. Requirements depend on the role and may include culinary education or practical kitchen experience.', prepare: 'Your culinary background, kitchen teamwork, hygiene awareness and role-specific interview preparation.' },
  { slug: 'deck', program: 'deck-security', name: 'Deck Department', image: 'dept-deck', short: 'Navigation, safety and ship operations.', roles: 'Deck-related roles, subject to maritime qualifications', text: 'Deck roles involve navigation, safety and ship operations and require specific maritime training such as STCW. We help you understand exactly what each role requires.', prepare: 'Clarify your current qualifications and plan the certifications required with authorised training providers.' },
  { slug: 'security', program: 'deck-security', name: 'Security Department', image: 'program-deck-security', short: 'Keeping guests, crew and the ship safe and secure.', roles: 'Security officers, gangway and access control, screening and safety-support roles', text: 'Security teams protect guests, crew and the vessel — from access control at the gangway to patrols, screening and emergency response. Alertness, discipline and clear communication are essential, and a security or service background helps.', prepare: 'Understand shipboard security and safety protocols, the certifications each role needs, and practise role-specific interview questions.' },
  { slug: 'spa-wellness', program: 'spa-wellness', name: 'Wellness & Beautician Department', image: 'program-spa-wellness', short: 'Relaxation, beauty and wellness services at sea.', roles: 'Spa therapists, beauticians, salon stylists and wellness or fitness roles', text: 'Spa and wellness teams deliver relaxation, beauty and fitness experiences in a premium, guest-facing setting. Recognised training or practical experience in your speciality is usually expected.', prepare: 'Present your spa, salon or wellness skills professionally, understand onboard guest-care standards and prepare for department-focused interviews.' },
];

export interface Story {
  slug: string; name: string; from: string; headline: string; department: string; cruiseLine: string;
  image: string | null; imageAlt?: string; points: string[]; quote?: string;
}

// Transcribed from the client's success-story posters. Salary figures are intentionally not republished.
export const stories: Story[] = [
  { slug: 'sahil', name: 'Sahil', from: 'Delhi', headline: 'Barista → Bartender at Sea', department: 'F&B · Bar Department', cruiseLine: 'Norwegian Cruise Line', image: 'student-sahil', points: ['Was rejected 3 times — didn’t give up. Learned. Improved. Succeeded.', 'AKMICS interview mastery: mock interviews, resume coaching, confidence training', 'Now onboard Norwegian Cruise Line as a Bartender'], quote: 'AKMICS changed my preparation completely. The mock interviews felt real — now I’m serving guests across the Mediterranean!' },
  { slug: 'anjali', name: 'Anjali Rawat', from: 'Dehradun', headline: 'Fresh Graduate → Deck Crew', department: 'Deck Department', cruiseLine: 'Princess Cruises', image: 'student-anjali', points: ['Trained from zero, just after completing Hotel Management', 'No experience → now a cruise professional', 'Now onboard Princess Cruises — world tour started'], quote: 'I joined AKMICS straight after Hotel Management with zero experience. Step by step, they prepared me for every stage — today I’m sailing the world with Princess Cruises!' },
  { slug: 'amit', name: 'Amit Kumar', from: 'Himachal', headline: 'Village Boy → International Chef', department: 'Galley · Commis', cruiseLine: 'MSC Cruises', image: 'student-amit', points: ['No one guided him — just a dream from the mountains of Himachal', 'AKMICS helped with CDC, STCW, medical and the visa process', 'Now working on MSC Cruises as Commis'], quote: 'Coming from a small village, I thought working on an international cruise was impossible. AKMICS guided me step by step — from CDC to STCW to my visa. Today I am living my dream, cooking for guests from around the world. Forever grateful!' },
  { slug: 'rohit', name: 'Rohit', from: 'Dehradun', headline: 'From Zero → Cruise Hero', department: 'Hotel Management Graduate', cruiseLine: 'Carnival Cruise Line', image: 'student-rohit', points: ['CV building and interview coaching', 'STCW certification and visa assistance', 'Now onboard Carnival Cruise Line'], quote: 'Was confused about cruise jobs. AKMICS guided me step-by-step — from CV building, interview preparation, STCW certification, to visa processing. Now I’m onboard the Carnival Cruise Line, living the dream at sea!' },
];

// From the "Parents Trust AKMICS" and "Why Join AKMICS?" posters.
export const trust = [
  { icon: 'wheel', title: 'Real Sea Experience', text: '11+ years onboard cruise ships — guidance from someone who has actually done it.' },
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
  ['How do I find out about fees and duration?', 'AKMICS offers two fully online programs: the Starter Sailor Program (₹9,999) and the Complete Sailpreneur Program (₹11,999). Call or message the academy for batch dates and payment terms.'],
  ['Can experienced hospitality professionals join?', 'Yes. Hospitality professionals can enrol for department-focused preparation, interview practice and career-growth guidance.'],
];

export const routeTitles: Record<string, string> = {
  about: 'About AKMICS', 'our-mentor': 'Meet Your Mentor', 'mentorship-program': 'Cruise Career Programs', 'career-pathways': 'Cruise Career Departments', 'expert-panel': 'Meet Our Expert Panel', 'success-stories': 'Success Stories', 'cruise-career-journey': 'Your Cruise Career Journey', faq: 'Frequently Asked Questions', contact: 'Start Your Cruise Journey', 'privacy-policy': 'Privacy Policy', 'terms-and-conditions': 'Terms & Conditions',
};
