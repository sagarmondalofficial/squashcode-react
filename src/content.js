// All home-page copy lives here so it can be edited without touching layout code.

export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Results', href: '#results' },
  { label: 'FAQ', href: '#faq' },
]

export const hero = {
  eyebrow: 'Digital marketing for real estate',
  title: 'We turn skylines into',
  highlight: 'sold‑out launches.',
  sub: 'Performance ads, high-intent lead funnels and CRM automation for developers, brokers and channel partners — built to fill site visits, not just dashboards.',
  primary: { label: 'Book a free audit', href: '#contact' },
  secondary: { label: 'See how we work', href: '#process' },
}

export const marquee = [
  'Meta Ads',
  'Google Ads',
  'Real Estate SEO',
  'Project Launches',
  'Lead Qualification',
  'CRM Automation',
  'WhatsApp Funnels',
  'Landing Pages',
  '3D Walkthroughs',
  'Retargeting',
]

export const manifesto =
  "Property isn't sold on clicks. It's sold on site visits. We engineer the whole journey — from the first scroll‑stopping ad to the moment a qualified buyer walks into your sales lounge."

export const services = [
  {
    icon: 'target',
    title: 'Performance Ads',
    body: 'Meta and Google campaigns built around project USPs, micro-markets and buyer intent — scaled on cost per site visit, not vanity reach.',
    tags: ['Meta', 'Google', 'YouTube'],
  },
  {
    icon: 'funnel',
    title: 'Lead Funnels',
    body: 'Fast, mobile-first landing pages and instant forms with qualification questions that filter window-shoppers before they reach sales.',
    tags: ['Landing pages', 'Lead forms', 'A/B tests'],
  },
  {
    icon: 'bolt',
    title: 'CRM & Automation',
    body: 'Every lead lands in your CRM in seconds, gets a WhatsApp follow-up instantly and is routed to the right closer automatically.',
    tags: ['CRM', 'WhatsApp', 'Routing'],
  },
  {
    icon: 'rocket',
    title: 'Project Launches',
    body: 'Pre-launch teasers, EOI drives and launch-week bursts planned together, so demand peaks exactly when inventory opens.',
    tags: ['Pre-launch', 'EOI', 'Launch burst'],
  },
  {
    icon: 'search',
    title: 'SEO & Content',
    body: 'Locality pages, project content and Google Business profiles that capture buyers already searching in your micro-market.',
    tags: ['Local SEO', 'GBP', 'Content'],
  },
  {
    icon: 'cube',
    title: 'Creative & 3D',
    body: 'Scroll-stopping ad creatives, reels and interactive 3D walkthroughs that sell the lifestyle before the first brick is laid.',
    tags: ['Reels', 'Static', '3D tours'],
  },
]

export const process = [
  {
    step: '01',
    title: 'Audit & Market Map',
    body: 'We study your project, pricing, competition and micro-market to find the buyer segments most likely to convert — and where they spend time online.',
    points: ['Competitor ad teardown', 'Buyer persona mapping', 'Tracking & CRM audit'],
  },
  {
    step: '02',
    title: 'Launch the Engine',
    body: 'Campaigns, creatives and landing pages go live together, wired end-to-end so every rupee and every lead is tracked from click to call.',
    points: ['Full-funnel campaign setup', 'Creative testing matrix', 'Conversion tracking'],
  },
  {
    step: '03',
    title: 'Qualify & Nurture',
    body: 'Instant WhatsApp responses, lead scoring and automated reminders keep interest warm until the buyer is ready to visit.',
    points: ['Instant first response', 'Lead scoring', 'Drip & reminder flows'],
  },
  {
    step: '04',
    title: 'Optimise to Site Visits',
    body: 'We feed sales outcomes back into the ad platforms and double down on what books visits — then scale it.',
    points: ['Offline conversion sync', 'Weekly optimisation', 'Transparent reporting'],
  },
]

// Figures taken from the April 2026 campaign data in the previous dashboard.
// Replace with your latest numbers before going live.
export const results = {
  title: 'Numbers that sales teams feel.',
  sub: 'One month, three channels, one goal: more qualified conversations for the sales floor.',
  stats: [
    { value: 792, prefix: '', suffix: '', label: 'Leads generated in a single month' },
    { value: 94, prefix: '₹', suffix: '', label: 'Cost per lead on Meta Ads' },
    { value: 4.77, prefix: '', suffix: '%', decimals: 2, label: 'Click-through rate on Meta' },
    { value: 3, prefix: '', suffix: '', label: 'Channels working as one funnel' },
  ],
}

export const faq = [
  {
    q: 'Do you only work with real estate?',
    a: 'Yes. We focus entirely on real estate — developers, brokers, channel partners and property marketplaces. That focus means our playbooks, creatives and benchmarks are built for how property is actually bought.',
  },
  {
    q: 'How soon will we start seeing leads?',
    a: 'Campaigns usually start generating leads within the first few days of going live. The first two to three weeks are spent learning which audiences and creatives drive site visits, then we scale what works.',
  },
  {
    q: 'What ad budget do we need?',
    a: 'It depends on your project size, ticket price and city. On the audit call we map your inventory and sales targets to a realistic budget and expected cost per lead.',
  },
  {
    q: 'Do you handle creatives and landing pages?',
    a: 'Yes. Ad creatives, reels, landing pages and lead forms are all produced in-house so we can test and iterate quickly without waiting on multiple vendors.',
  },
  {
    q: 'How do you report on performance?',
    a: 'You get a live dashboard plus a weekly review covering spend, leads, cost per lead, qualified leads and site visits — tied back to the campaigns that produced them.',
  },
]

export const contact = {
  title: "Let's sell out your next launch.",
  sub: 'Tell us about your project. We will come back with a free audit of your current marketing and a launch plan.',
  budgets: ['Under ₹1L / month', '₹1L – ₹3L / month', '₹3L – ₹10L / month', '₹10L+ / month'],
}
