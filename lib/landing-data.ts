export type NavLink = {
  label: string;
  href: string;
};

export type HeroStat = {
  label: string;
  value: string;
  icon: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: string;
  bullets: string[];
};

export type Workflow = {
  value: string;
  label: string;
  heading: string;
  description: string;
  metric: {
    value: string;
    caption: string;
  };
  bullets: string[];
};

export type Testimonial = {
  name: string;
  role: string;
  initials: string;
  quote: string;
  metric: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export const defaultSelectedDate = new Date("2025-06-12T00:00:00");

export const heroSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"];

export const heroStats: HeroStat[] = [
  {
    label: "Team adoption in 30 days",
    value: "20%",
    icon: "lucide:users",
  },
  {
    label: "Time saved per rep / week",
    value: "3.5 hrs",
    icon: "lucide:clock",
  },
  {
    label: "Meetings booked each month",
    value: "3",
    icon: "lucide:bar-chart-3",
  },
];

export const features: Feature[] = [
  {
    title: "Smart availability engine",
    description:
      "Syncs every calendar in real-time and honours buffers, focus time, and personal events automatically.",
    icon: "lucide:calendar-clock",
    bullets: [
      "One adaptive link that respects time zones everywhere.",
      "Surface the best slots with round-robin and collective logic.",
      "Instant conflict detection so you never double book again.",
    ],
  },
  {
    title: "AI scheduling concierge",
    description:
      "Let MeetMe handle confirmations, reminders, and rescheduling with a human touch.",
    icon: "lucide:wand-2",
    bullets: [
      "Drafts personalized follow-ups and reminders automatically.",
      "Learns guest preferences for meeting formats and locations.",
      "Escalates VIPs to leaders with just-in-time alerts.",
    ],
  },
  {
    title: "Insights that drive revenue",
    description:
      "Spot patterns that help your team respond faster and close more deals.",
    icon: "lucide:bar-chart-3",
    bullets: [
      "Real-time dashboards for conversion, show rate, and cycle speed.",
      "Push activities and notes back into your CRM automatically.",
      "Compare rep performance with customizable leaderboards.",
    ],
  },
  {
    title: "Human-friendly routing",
    description:
      "Give every prospect and customer the right host in seconds, no spreadsheets needed.",
    icon: "lucide:users",
    bullets: [
      "Round-robin, priority, and collective availability out of the box.",
      "Account matching based on owner, territory, or industry.",
      "Fallback hosts ensure high-priority meetings never stall.",
    ],
  },
  {
    title: "Enterprise-grade reliability",
    description:
      "Security, privacy, and uptime trusted by global go-to-market teams.",
    icon: "lucide:shield-check",
    bullets: [
      "SOC 2 Type II, GDPR, and HIPAA-ready workflows.",
      "Role-based access with SSO and SCIM provisioning.",
      "24/5 support with a 2 minute median response time.",
    ],
  },
  {
    title: "Deep collaboration",
    description:
      "Keep every stakeholder aligned from invite to follow-up, automatically.",
    icon: "lucide:message-square",
    bullets: [
      "Share notes and agendas in Slack, Notion, or email.",
      "Collect pre-call questions with customizable intake forms.",
      "Send recap summaries and next steps with one click.",
    ],
  },
];

export const workflows: Workflow[] = [
  {
    value: "sales",
    label: "Sales teams",
    heading: "Route and book the right rep automatically.",
    description:
      "Qualify leads, assign owners, and deliver the perfect demo handoff without Slack back-and-forth.",
    metric: {
      value: "4.6×",
      caption: "faster speed-to-lead",
    },
    bullets: [
      "Instantly route inbound interest based on territory rules.",
      "Offer pooled availability with round-robin and collective events.",
      "Write calendar briefs by pulling context from your CRM and enrichment.",
    ],
  },
  {
    value: "customer-success",
    label: "Customer success",
    heading: "Keep renewals on track with proactive scheduling.",
    description:
      "Automate QBRs, onboarding check-ins, and renewal milestones so nothing slips through the cracks.",
    metric: {
      value: "98%",
      caption: "QBR completion rate",
    },
    bullets: [
      "Recurring workflows synced with lifecycle stages and health scores.",
      "Smart nudges that reschedule instantly when customers cancel.",
      "Collect agendas and tasks before every executive meeting.",
    ],
  },
  {
    value: "recruiting",
    label: "Recruiting",
    heading: "Coordinate interviews without the manual busywork.",
    description:
      "Give candidates a white-glove experience while automating interviewer pools and feedback loops.",
    metric: {
      value: "65%",
      caption: "less coordinator time",
    },
    bullets: [
      "Pool-based scheduling across interview panels and time zones.",
      "Auto-detect interviewer conflicts, buffers, and blackout dates.",
      "Attach prep packs and collect feedback right after each call.",
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Maya Chen",
    role: "Head of Revenue · Orbitly",
    initials: "MC",
    quote:
      "MeetMe replaced our manual routing spreadsheets and cut speed-to-lead from hours to minutes.",
    metric: "340% increase in meetings booked",
  },
  {
    name: "Luis Romero",
    role: "Director of CS · Cascade",
    initials: "LR",
    quote:
      "Automated QBR cadences freed every CSM from calendar Tetris and kept exec sponsors engaged.",
    metric: "98% of renewals now include an executive touchpoint",
  },
  {
    name: "Isha Patel",
    role: "Talent Lead · Northwind",
    initials: "IP",
    quote:
      "Candidates rave about the experience. Interviewers just show up prepared thanks to the smart briefs.",
    metric: "65% less time spent coordinating interviews",
  },
];

export const faqs: Faq[] = [
  {
    question: "Does MeetMe connect to multiple calendars per user?",
    answer:
      "Yes. Connect unlimited Google, Outlook, and iCloud calendars. We respect working hours, shared calendars, and personal events automatically.",
  },
  {
    question: "How does AI assist with scheduling?",
    answer:
      "Our AI concierge drafts confirmations, reminders, and follow-ups. It learns preferred meeting formats, surfaces prep notes, and escalates VIPs when needed.",
  },
  {
    question: "Is enterprise security available on every plan?",
    answer:
      "SOC 2 Type II, GDPR, SSO, and SCIM are ready out of the box. Configure roles, approvals, and audit logs from a single admin console.",
  },
  {
    question: "Can I embed MeetMe on our website or product?",
    answer:
      "Absolutely. Use no-code embeds, API access, or our React components to launch branded booking experiences anywhere.",
  },
];

export const navLinks: NavLink[] = [
  { label: "Product", href: "#features" },
  { label: "Workflows", href: "#workflows" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#get-started" },
  { label: "Resources", href: "#faq" },
];

export const heroCta = {
  primary: {
    label: "Start free trial",
    href: "#get-started",
    icon: "lucide:arrow-right",
  },
  secondary: {
    label: "Watch live demo",
  },
};
