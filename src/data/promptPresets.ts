import { PromptPreset, MasterPromptSection } from '../types';

export const SAMPLE_IDEAS: PromptPreset[] = [
  {
    id: 'it-solutions',
    title: 'Cinematic IT Solutions',
    tag: 'Hardware & Cloud',
    idea: 'Create a premium cinematic IT solutions website with an exploding gaming PC hero animation.',
  },
  {
    id: 'robotics-ai',
    title: 'Autonomous Robotics Launch',
    tag: 'Deep Tech',
    idea: 'A high-end product reveal for an autonomous humanoid robotics platform with interactive exploded kinematics, dark carbon materials, and low-latency control telemetry.',
  },
  {
    id: 'fintech-liquidity',
    title: 'Institutional FinTech Protocol',
    tag: 'Financial Systems',
    idea: 'A minimalist institutional liquidity network with real-time order-flow visualization, monospace typography, ultra-clean financial charts, and zero-distraction dark mode.',
  },
  {
    id: 'architecture-studio',
    title: 'Minimalist Architecture Studio',
    tag: 'Design & Spatial',
    idea: 'An editorial portfolio for an avant-garde architectural atelier featuring horizontal scroll galleries, raw concrete textures, Swiss grid typography, and muted monochrome imagery.',
  },
];

export const DEFAULT_MASTER_SECTIONS: MasterPromptSection[] = [
  {
    num: '01',
    title: 'PROJECT / CREATIVE DIRECTION',
    content:
      'Build a premier, tier-one website for an elite technology enterprise. The aesthetic tone must evoke cinematic technical supremacy: pitch-black obsidian backgrounds, precision-engineered geometric alignment, cold electric-blue illumination, and physical hardware realism without visual noise.',
  },
  {
    num: '02',
    title: 'EXPERIENCE GOAL',
    content:
      'Establish immediate technical authority. Deliver instant zero-friction navigation with seamless transitions between macro architectural overviews and micro component breakdowns.',
  },
  {
    num: '03',
    title: 'VISUAL LANGUAGE',
    content:
      'Deep onyx (#000000) base, 1px frosted hairline dividers (rgba(255,255,255,0.12)), subtle diffuse cyan/blue accents (#0088FF / #00D4FF), anti-aliased monospace telemetry callouts, and restrained typographic hierarchy.',
  },
  {
    num: '04',
    title: 'PAGE / INFORMATION ARCHITECTURE',
    content:
      'Single-page cinematic narrative flow: Pinned minimal nav → Exploded Hardware Hero Stage → Architecture Core Specs → Interactive System Diagnostics → Real-Time Telemetry Matrix → Technical Documentation & Contact.',
  },
  {
    num: '05',
    title: 'HERO',
    content:
      'Fullscreen cinematic stage featuring an interactive 3D / video exploded gaming workstation with floating anodized heatsinks, liquid cooling tubes, and GPU silicone dies dispersing along the Z-axis on cursor drag or scroll.',
  },
  {
    num: '06',
    title: 'SECTIONS',
    content:
      'Modular technical documentation units: Hardware Benchmark Comparison, Custom Waterloop Thermal Dynamics, Cloud Telemetry Integration, and Direct Enterprise Deployment Specs.',
  },
  {
    num: '07',
    title: 'TYPOGRAPHY',
    content:
      'Dual-font pairing: Refined geometric display face (Sora / Monument Extended) at 200/300 weights for hero display, paired with a calibrated developer monospace (JetBrains Mono / SF Mono) at 400 weight for data readouts.',
  },
  {
    num: '08',
    title: 'COLOR / SURFACE SYSTEM',
    content:
      'Base: #000000 | Secondary: #040814 | Accents: #0088FF, #38BDF8 | Text: Primary #FFFFFF (100%), Secondary rgba(255,255,255,0.65), Muted rgba(255,255,255,0.40) | Surfaces: 4%–8% white tint with 16px blur.',
  },
  {
    num: '09',
    title: 'MOTION / INTERACTION',
    content:
      'Physics-based damping (cubic-bezier(0.16, 1, 0.3, 1)). Cursor proximity glow on hairline borders. Scroll-linked component dispersion. Snappy 180ms hover transitions on primary action controls.',
  },
  {
    num: '10',
    title: 'TECHNICAL IMPLEMENTATION',
    content:
      'Production React 18+ with TypeScript, Vite bundler, Tailwind CSS utility architecture, Lucide icons, and responsive ResizeObserver canvas container management.',
  },
  {
    num: '11',
    title: 'RESPONSIVE BEHAVIOR',
    content:
      'Desktop: Asymmetric split-screen hero with 3D canvas stage on left and high-legibility readout on right. Mobile (<768px): Vertical stacked sequence, sticky telemetry drawer, and touch-optimized 48px touch targets.',
  },
  {
    num: '12',
    title: 'ACCESSIBILITY / PERFORMANCE',
    content:
      'WCAG AA compliance with 4.5:1 text contrast ratios, prefers-reduced-motion media query guards for 3D/video layers, zero layout shift (CLS < 0.05), and sub-1.2s First Contentful Paint.',
  },
];

export function generatePromptForIdea(idea: string): MasterPromptSection[] {
  const trimmed = idea.trim();
  if (!trimmed) return DEFAULT_MASTER_SECTIONS;

  return [
    {
      num: '01',
      title: 'PROJECT / CREATIVE DIRECTION',
      content: `Translate the concept "${trimmed}" into a production-grade digital experience. Deliver an uncompromising, high-end technical aesthetic tailored to modern web standards with deep atmosphere, crisp typography, and disciplined visual restraint.`,
    },
    {
      num: '02',
      title: 'EXPERIENCE GOAL',
      content: `Hook the visitor within 3 seconds through immediate visual clarity and tangible interactive feedback. Prioritize fast comprehension, smooth motion transitions, and transparent technical credibility.`,
    },
    {
      num: '03',
      title: 'VISUAL LANGUAGE',
      content: `Deep cinematic tones with precise hairline borders (1px rgba(255,255,255,0.12)), subtle luminous cyan/blue highlights, generous negative space, and strict typographic alignment without visual clutter.`,
    },
    {
      num: '04',
      title: 'PAGE / INFORMATION ARCHITECTURE',
      content: `Structured linear progression: Transparent Navigation → Narrative Hero Anchor → Core System Transformation → Interactive Proof / Capability Breakdown → Technical Specifications → Seamless Action Closing.`,
    },
    {
      num: '05',
      title: 'HERO',
      content: `Impactful visual anchor interpreting "${trimmed}". Prominent visual focal point positioned with spacious typography, technical status chips, and an immediate primary conversion vector.`,
    },
    {
      num: '06',
      title: 'SECTIONS',
      content: `High-signal modular sections detailing capabilities, architectural mechanics, real-world workflows, and integration endpoints with zero generic marketing fluff.`,
    },
    {
      num: '07',
      title: 'TYPOGRAPHY',
      content: `Pair an ultra-clean display heading typeface (200–400 weights) with a high-legibility monospace or technical body face. Maintain strict 1.5–1.7 line height and bounded 65–75ch character widths.`,
    },
    {
      num: '08',
      title: 'COLOR / SURFACE SYSTEM',
      content: `Pitch black / deep navy canvas (#000000, #030712), electric blue energy accents (#0088FF), balanced white typographic hierarchy (100% / 65% / 40%), and subtle frosted borders.`,
    },
    {
      num: '09',
      title: 'MOTION / INTERACTION',
      content: `Subtle energy pulses, smooth spring curves (cubic-bezier(0.16, 1, 0.3, 1)), cursor-reactive subtle highlights, and lightweight hover states that reinforce tactile responsiveness.`,
    },
    {
      num: '10',
      title: 'TECHNICAL IMPLEMENTATION',
      content: `React 18+, TypeScript, Tailwind CSS, modular component decomposition, standard semantic HTML5 landmarks, and server-side ready execution without runtime crashes.`,
    },
    {
      num: '11',
      title: 'RESPONSIVE BEHAVIOR',
      content: `Fluid scaling across desktop (2560px down to 1024px), tablet split-views (1024px to 768px), and stacked single-column mobile layouts with accessible touch targets.`,
    },
    {
      num: '12',
      title: 'ACCESSIBILITY / PERFORMANCE',
      content: `Full keyboard navigation, semantic ARIA roles, WCAG AA color contrast, prefers-reduced-motion fallbacks, optimized asset streaming, and sub-100ms interaction latency.`,
    },
  ];
}
