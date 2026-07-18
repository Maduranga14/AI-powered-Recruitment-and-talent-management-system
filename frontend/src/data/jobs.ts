export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  level: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency?: string;
  postedDaysAgo: number;
  category: string;
  skills: string[];
  shortDescription: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicants: number;
  matchScore: number;
  featured?: boolean;
}

const logo = (bg: string, text: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=${bg}&color=fff&bold=true&size=128&format=png`;

export const CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Data & AI',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
];

export const JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Northwind Labs',
    companyLogo: logo('4f46e5', 'Northwind Labs'),
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    type: 'Full-time',
    level: 'Senior',
    salaryMin: 150000,
    salaryMax: 195000,
    postedDaysAgo: 2,
    category: 'Engineering',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Testing'],
    shortDescription:
      'Build delightful, high-performance interfaces for our next-gen analytics suite used by thousands of teams.',
    responsibilities: [
      'Own the frontend architecture of core product surfaces',
      'Collaborate with design to ship polished, accessible UI',
      'Mentor engineers and drive frontend best practices',
      'Improve performance, tooling, and developer experience',
    ],
    requirements: [
      '5+ years building production React applications',
      'Deep TypeScript and modern CSS expertise',
      'Experience with design systems and accessibility',
      'Strong product sense and communication skills',
    ],
    benefits: ['Equity package', 'Unlimited PTO', 'Home office stipend', 'Top-tier health cover'],
    applicants: 48,
    matchScore: 94,
    featured: true,
  },
  {
    id: 'job-2',
    title: 'Product Designer',
    company: 'Bloomly',
    companyLogo: logo('0d9488', 'Bloomly'),
    location: 'Remote (US)',
    workMode: 'Remote',
    type: 'Full-time',
    level: 'Mid',
    salaryMin: 110000,
    salaryMax: 140000,
    postedDaysAgo: 1,
    category: 'Design',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research'],
    shortDescription:
      'Shape end-to-end product experiences for a fast-growing wellness platform loved by millions.',
    responsibilities: [
      'Lead design for major product initiatives',
      'Run research and translate insights into designs',
      'Maintain and evolve our design system',
      'Partner closely with product and engineering',
    ],
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio of shipped work',
      'Fluency in Figma and prototyping tools',
      'Comfort with ambiguity and fast iteration',
    ],
    benefits: ['Fully remote', '4-day summer weeks', 'Learning budget', 'Wellness stipend'],
    applicants: 72,
    matchScore: 81,
    featured: true,
  },
  {
    id: 'job-3',
    title: 'Machine Learning Engineer',
    company: 'Vantage AI',
    companyLogo: logo('7c3aed', 'Vantage AI'),
    location: 'New York, NY',
    workMode: 'On-site',
    type: 'Full-time',
    level: 'Senior',
    salaryMin: 170000,
    salaryMax: 220000,
    postedDaysAgo: 4,
    category: 'Data & AI',
    skills: ['Python', 'PyTorch', 'MLOps', 'LLMs', 'AWS'],
    shortDescription:
      'Design and deploy ML systems that power intelligent decisioning at enterprise scale.',
    responsibilities: [
      'Build and productionize ML models end-to-end',
      'Own data pipelines and model evaluation',
      'Collaborate with research on new capabilities',
      'Optimize inference cost and latency',
    ],
    requirements: [
      '5+ years in applied ML',
      'Strong Python and deep learning fundamentals',
      'Experience deploying models to production',
      'Familiarity with LLMs and vector search',
    ],
    benefits: ['Equity', 'Relocation support', 'Conference budget', 'Premium health'],
    applicants: 35,
    matchScore: 68,
  },
  {
    id: 'job-4',
    title: 'Product Manager, Growth',
    company: 'Cascade',
    companyLogo: logo('db2777', 'Cascade'),
    location: 'Austin, TX',
    workMode: 'Hybrid',
    type: 'Full-time',
    level: 'Mid',
    salaryMin: 130000,
    salaryMax: 165000,
    postedDaysAgo: 6,
    category: 'Product',
    skills: ['Experimentation', 'Analytics', 'SQL', 'Roadmapping'],
    shortDescription:
      'Drive activation and retention through data-informed experiments across the funnel.',
    responsibilities: [
      'Own the growth roadmap and experiment backlog',
      'Define metrics and analyze results',
      'Partner with design, eng, and marketing',
      'Turn insights into shipped improvements',
    ],
    requirements: [
      '3+ years in product management',
      'Track record of growth wins',
      'Strong analytical and SQL skills',
      'Excellent stakeholder communication',
    ],
    benefits: ['Bonus plan', 'Hybrid flexibility', '401k match', 'Parental leave'],
    applicants: 91,
    matchScore: 74,
  },
  {
    id: 'job-5',
    title: 'Data Analyst',
    company: 'Meridian',
    companyLogo: logo('2563eb', 'Meridian'),
    location: 'Remote (Global)',
    workMode: 'Remote',
    type: 'Contract',
    level: 'Entry',
    salaryMin: 70000,
    salaryMax: 95000,
    postedDaysAgo: 3,
    category: 'Data & AI',
    skills: ['SQL', 'Tableau', 'Excel', 'Statistics'],
    shortDescription:
      'Turn messy data into clear stories that guide business decisions across teams.',
    responsibilities: [
      'Build dashboards and recurring reports',
      'Answer ad-hoc analytical questions',
      'Ensure data quality and consistency',
      'Present findings to stakeholders',
    ],
    requirements: [
      '1+ years in analytics',
      'Strong SQL and spreadsheet skills',
      'Experience with a BI tool',
      'Clear written communication',
    ],
    benefits: ['Flexible hours', 'Remote-first', 'Contract-to-hire', 'Learning stipend'],
    applicants: 120,
    matchScore: 62,
  },
  {
    id: 'job-6',
    title: 'Marketing Lead',
    company: 'Hue & Co',
    companyLogo: logo('ea580c', 'Hue Co'),
    location: 'London, UK',
    workMode: 'Hybrid',
    type: 'Full-time',
    level: 'Lead',
    salaryMin: 90000,
    salaryMax: 120000,
    postedDaysAgo: 8,
    category: 'Marketing',
    skills: ['Brand', 'Content', 'SEO', 'Paid Media', 'Leadership'],
    shortDescription:
      'Own the marketing strategy and grow a beloved consumer brand across channels.',
    responsibilities: [
      'Define and execute marketing strategy',
      'Lead a cross-functional marketing team',
      'Own brand, content, and demand generation',
      'Report on performance to leadership',
    ],
    requirements: [
      '6+ years in marketing',
      'Experience leading teams',
      'Full-funnel marketing expertise',
      'Data-driven decision making',
    ],
    benefits: ['Bonus', 'Private health', 'Hybrid working', 'Generous holidays'],
    applicants: 54,
    matchScore: 57,
  },
  {
    id: 'job-7',
    title: 'Backend Engineer (Go)',
    company: 'Northwind Labs',
    companyLogo: logo('4f46e5', 'Northwind Labs'),
    location: 'Remote (US)',
    workMode: 'Remote',
    type: 'Full-time',
    level: 'Mid',
    salaryMin: 135000,
    salaryMax: 170000,
    postedDaysAgo: 5,
    category: 'Engineering',
    skills: ['Go', 'PostgreSQL', 'Kubernetes', 'gRPC', 'AWS'],
    shortDescription: 'Build reliable, scalable services that power our data-intensive platform.',
    responsibilities: [
      'Design and build backend services',
      'Own reliability, observability, and performance',
      'Collaborate on API design',
      'Participate in on-call rotation',
    ],
    requirements: [
      '4+ years backend engineering',
      'Strong Go and distributed systems knowledge',
      'Experience with cloud infrastructure',
      'Pragmatic, quality-focused mindset',
    ],
    benefits: ['Equity', 'Remote-first', 'Home office stipend', 'Health cover'],
    applicants: 40,
    matchScore: 71,
  },
  {
    id: 'job-8',
    title: 'UX Researcher',
    company: 'Bloomly',
    companyLogo: logo('0d9488', 'Bloomly'),
    location: 'Berlin, DE',
    workMode: 'Hybrid',
    type: 'Part-time',
    level: 'Mid',
    salaryMin: 60000,
    salaryMax: 80000,
    postedDaysAgo: 10,
    category: 'Design',
    skills: ['User Research', 'Interviews', 'Usability Testing', 'Synthesis'],
    shortDescription:
      'Uncover deep user insights that shape product direction and design decisions.',
    responsibilities: [
      'Plan and run qualitative and quantitative studies',
      'Synthesize findings into actionable insights',
      'Evangelize research across the org',
      'Build a research repository',
    ],
    requirements: [
      '3+ years in UX research',
      'Mixed-methods research skills',
      'Strong storytelling ability',
      'Fluent English',
    ],
    benefits: ['Flexible schedule', 'Hybrid', 'Learning budget', 'Wellness stipend'],
    applicants: 29,
    matchScore: 66,
  },
];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}

/**
 * Format a salary range for display.
 * - Values >= 1000 are treated as full amounts and abbreviated (150000 → $150k)
 * - Values < 1000 are treated as direct amounts (20 → $20, for small/hourly)
 * - Values <= 0 mean "not provided"
 */
export function formatSalary(min: number, max: number, currency = 'USD'): string {
  if (min <= 0 && max <= 0) return 'Not specified';

  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const fmt = (n: number): string => {
    if (n >= 1000) return `${sym}${Math.round(n / 1000)}k`;
    return `${sym}${n.toLocaleString()}`;
  };

  if (min > 0 && max > 0) return `${fmt(min)} – ${fmt(max)}`;
  if (min > 0) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
}
