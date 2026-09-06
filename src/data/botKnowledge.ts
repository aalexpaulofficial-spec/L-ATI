/**
 * LIGHTNING AI BOT — Product Knowledge Base & Question Answering Engine.
 *
 * Frontend-only intelligent knowledge assistant for LIGHTNING ATI.
 * Adheres strictly to project-provided facts, without inventing unsupported claims.
 */

export interface DefaultQuestion {
  id: string;
  question: string;
  answer: string;
}

export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    id: 'founder',
    question: 'Who is the Founder/CEO of Lightning ATI?',
    answer:
      'A. Alex Paul is the Founder/CEO of LIGHTNING ATI (Artificial Thinking Intelligence). From CHRIST University, Kengeri Campus, Bengaluru, India, he built the first model in the world for ATI.\n\nLIGHTNING ATI brings the power to create sophisticated websites, including 3D and cinematic experiences, from a single detailed prompt based on your idea.',
  },
  {
    id: 'what-is-ati',
    question: 'What is LIGHTNING ATI?',
    answer:
      'LIGHTNING ATI stands for Artificial Thinking Intelligence. It transforms a simple website idea into a detailed master prompt that defines the creative direction, visual language, layout, interaction, motion, responsive behavior and technical implementation required to build the experience.\n\nIDEA\n→ UNDERSTANDING\n→ CREATIVE DIRECTION\n→ MASTER PROMPT\n→ WEBSITE',
  },
  {
    id: 'how-to-use',
    question: 'How do I use LIGHTNING ATI?',
    answer:
      'Using LIGHTNING ATI is simple. Describe the website you want to create in the idea box — explain the purpose, style, pages, interactions, animations, 3D elements, audience or anything else you imagine. Then select Generate Master Prompt. LIGHTNING ATI understands your idea and turns it into a detailed master prompt that can be used with modern AI development platforms.\n\nYou do not need to know how to write a technical prompt. Start with your idea and describe it naturally.',
  },
];

interface KnowledgeEntry {
  patterns: RegExp[];
  answer: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // 01: Founder / CEO
  {
    patterns: [
      /\b(founder|ceo|alex|paul|alex paul|christ university|kengeri|who made|who built|who created|author|creator)\b/i,
    ],
    answer:
      'A. Alex Paul is the Founder/CEO of LIGHTNING ATI (Artificial Thinking Intelligence). From CHRIST University, Kengeri Campus, Bengaluru, India, he built the first model in the world for ATI.\n\nLIGHTNING ATI brings the power to create sophisticated websites, including 3D and cinematic experiences, from a single detailed prompt based on your idea.',
  },

  // 02: What is LIGHTNING ATI / ATI definition
  {
    patterns: [
      /\b(what is lightning ati|what does lightning ati do|what is ati|artificial thinking intelligence|explain lightning ati|about lightning ati)\b/i,
      /\b(what is lightning|what is lightning-1)\b/i,
    ],
    answer:
      'LIGHTNING ATI stands for Artificial Thinking Intelligence. It transforms a simple website idea into a detailed master prompt that defines the creative direction, visual language, layout, interaction, motion, responsive behavior and technical implementation required to build the experience.\n\nIDEA\n→ UNDERSTANDING\n→ CREATIVE DIRECTION\n→ MASTER PROMPT\n→ WEBSITE',
  },

  // 03: How to create a website / how to use
  {
    patterns: [
      /\b(how do i use|how to use|how do i create a website|how to create a website|how to build a website|how do i start|getting started|how it works|tutorial|steps)\b/i,
    ],
    answer:
      'Using LIGHTNING ATI is simple. Describe the website you want to create in the idea box — explain the purpose, style, pages, interactions, animations, 3D elements, audience or anything else you imagine. Then select Generate Master Prompt. LIGHTNING ATI understands your idea and turns it into a detailed master prompt that can be used with modern AI development platforms.\n\nYou do not need to know how to write a technical prompt. Start with your idea and describe it naturally.',
  },

  // 04: What should I write / input advice / how detailed
  {
    patterns: [
      /\b(what should i write|what to write|what to include|how detailed|idea description|what should i include in my website idea|describe my idea)\b/i,
    ],
    answer:
      'Write your idea naturally, just as you would explain it to a designer or developer. You can start with something simple like: "Create a premium cinematic website for an AI robotics company." You can also include colors, sections, animations, interactions, target audience and visual references if you have them.\n\nThere is no strict format — whether brief or extensive, LIGHTNING ATI expands your concept into a complete production direction.',
  },

  // 05: Do I need to know prompting / prompting knowledge
  {
    patterns: [
      /\b(do i need to know prompt|do i need prompting|can i describe my idea normally|natural language|prompt engineering|technical prompt|knowledge of prompting)\b/i,
    ],
    answer:
      'No. You do not need to know prompt engineering. LIGHTNING ATI is designed to take a normal website idea and develop it into a structured master prompt. Start with your idea and describe it naturally.',
  },

  // 06: What happens after clicking Generate Master Prompt
  {
    patterns: [
      /\b(what happens when i click|what happens after|after generate master prompt|click generate|generate master prompt button)\b/i,
    ],
    answer:
      'LIGHTNING ATI processes your idea and generates a detailed master prompt describing the creative direction, visual system, structure, interactions, motion, responsive behavior and technical implementation for the website.',
  },

  // 07: What is a master prompt
  {
    patterns: [
      /\b(what is a master prompt|master prompt meaning|define master prompt|prompt structure)\b/i,
    ],
    answer:
      'A master prompt is a comprehensive, production-grade specification for an entire digital experience. Instead of a vague description, it articulates design tokens, layout hierarchy, interactive components, animation curves, 3D scene parameters, and technical architecture ready for modern AI code generators and development teams.',
  },

  // 08: 3D websites / 3D interactions
  {
    patterns: [
      /\b(3d|three\.js|threejs|webgl|3d website|3d interaction|3d elements|3d scene|camera movement|lighting)\b/i,
    ],
    answer:
      'Yes. Describe the 3D experience you want — including objects, camera movement, lighting, interactions, scroll behavior and atmosphere — and LIGHTNING ATI can incorporate those requirements into the generated master prompt.',
  },

  // 09: Cinematic websites / animations
  {
    patterns: [
      /\b(cinematic|cinematic website|animation|animations|motion|micro-interactions|scroll transitions|visual direction)\b/i,
    ],
    answer:
      'Yes. LIGHTNING ATI specializes in cinematic digital experiences. You can describe fluid camera pans, scroll-triggered transitions, atmospheric lighting, subtle glow effects, and micro-interactions. The resulting master prompt will specify the timing, easing curves, and visual layering needed to bring your cinematic vision to life.',
  },

  // 10: Specific website types: AI, Portfolio, E-commerce, SaaS
  {
    patterns: [
      /\b(portfolio|e-commerce|ecommerce|saas|ai website|agency|landing page|startup website|store|blog)\b/i,
    ],
    answer:
      'Yes. LIGHTNING ATI supports any category of web experience — including SaaS landing pages, creative portfolios, e-commerce storefronts, AI product interfaces, agency showcases, and enterprise platforms. Simply specify the business type, aesthetic tone, and target audience in your idea.',
  },

  // 11: Platforms that can use the master prompt
  {
    patterns: [
      /\b(what platforms|which platforms|where can i use|where to paste|cursor|bolt|v0|lovable|claude|chatgpt|replit|tools)\b/i,
    ],
    answer:
      'The generated master prompt is optimized for leading AI development platforms and code generators, including Cursor, Bolt.new, v0, Lovable, Claude, ChatGPT, Replit, or for direct handoff to frontend engineering teams building with React, Vite, Next.js, and Three.js.',
  },

  // 12: What to do after receiving the master prompt
  {
    patterns: [
      /\b(what should i do after|what to do next|how to use the prompt|where do i put the prompt|copy prompt|next step)\b/i,
    ],
    answer:
      'Once your master prompt is generated, click the Copy button to copy it to your clipboard. Then paste it into your preferred AI development tool (such as Cursor, Bolt.new, v0, or Claude) or share it with your development team. The prompt contains all the creative and technical parameters required to generate the complete website.',
  },

  // 13: Offline / PWA / Free download
  {
    patterns: [
      /\b(offline|download|free download|install|pwa|app)\b/i,
    ],
    answer:
      'LIGHTNING ATI is available as a web app and can be installed directly to your device (desktop, tablet, or mobile) by clicking the "Free download" button in the top navigation. Once installed, it works offline seamlessly.',
  },
];

/**
 * Intelligent response matcher.
 * Matches user query against knowledge base, or provides a graceful scoped fallback.
 */
export function getBotResponse(userQuery: string): string {
  const query = userQuery.trim();
  if (!query) {
    return "Please ask a question about LIGHTNING ATI or how to turn your idea into a website.";
  }

  // Exact match with default questions first
  for (const item of DEFAULT_QUESTIONS) {
    if (query.toLowerCase() === item.question.toLowerCase()) {
      return item.answer;
    }
  }

  // Pattern matching
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(query)) {
        return entry.answer;
      }
    }
  }

  // Polite, scoped fallback for unrelated or unrecognized questions
  return (
    'I am LIGHTNING AI, your dedicated guide for LIGHTNING ATI and website creation.\n\n' +
    'I can assist you with:\n' +
    '• How LIGHTNING ATI transforms your idea into a master prompt\n' +
    '• Writing website ideas, including 3D and cinematic experiences\n' +
    '• Understanding how to use the generated prompt on modern AI platforms\n' +
    '• Navigating the LIGHTNING ATI platform\n\n' +
    'How can I help you with your website project?'
  );
}
