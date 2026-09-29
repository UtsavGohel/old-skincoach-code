import {
  BarChart3,
  Bot,
  CalendarRange,
  ScanFace,
  Sparkles,
  Zap,
} from 'lucide-react-native';

import type { BillingPlan } from '@/store/subscription.store';
import type { IconComponent } from '@/types/icon';

// Static paywall content (docs/10). No mockup — assembled from docs/10's Subscription
// Screen sections + the PROJECT_CONTEXT Pro feature list. Pricing/benefits would come from
// RevenueCat offerings once real IAP is wired (Phase 19); this stands in until then.

export type PlanContent = {
  plan: BillingPlan;
  label: string;
  price: string;
  cadence: string;
  // Shown only on the highlighted yearly plan.
  savingsBadge?: string;
  subtext?: string;
  highlighted: boolean;
};

// docs/10 Pricing: Monthly $9.99 / Yearly $79.99, "Save 33%", yearly always highlighted.
export const SUBSCRIPTION_PLANS: PlanContent[] = [
  {
    plan: 'yearly',
    label: 'Yearly',
    price: '$79.99',
    cadence: '/year',
    savingsBadge: 'Save 33%',
    subtext: 'Just $6.67/mo · billed annually',
    highlighted: true,
  },
  {
    plan: 'monthly',
    label: 'Monthly',
    price: '$9.99',
    cadence: '/month',
    subtext: 'Billed monthly',
    highlighted: false,
  },
];

// docs/10 Benefits — each an icon + short description.
export const PRO_BENEFITS: { icon: IconComponent; title: string; description: string }[] =
  [
    {
      icon: ScanFace,
      title: 'Unlimited AI Scans',
      description: 'Track your skin as often as you like — no monthly cap.',
    },
    {
      icon: Bot,
      title: 'Unlimited AI Coach',
      description: 'Ask your Skin Coach anything, any time.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analysis & Trends',
      description: 'Deeper insights and long-term progress analytics.',
    },
    {
      icon: CalendarRange,
      title: 'Weekly & Monthly Reports',
      description: 'Personalized recaps delivered on a schedule.',
    },
    {
      icon: Zap,
      title: 'Priority AI Processing',
      description: 'Your scans jump to the front of the queue.',
    },
    {
      icon: Sparkles,
      title: 'Early Feature Access',
      description: 'Be first to try new premium features.',
    },
  ];

// docs/10 Feature Access Matrix — Free vs Pro. PROJECT_CONTEXT wins on Free's scan limit
// (docs/19): "1 AI Scan per Day".
export type ComparisonRow = {
  feature: string;
  free: string;
  pro: string;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'AI Scans', free: '1 / day', pro: 'Unlimited' },
  { feature: 'AI Coach', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Progress Timeline', free: 'Included', pro: 'Included' },
  { feature: 'Routine Tracker', free: 'Included', pro: 'Included' },
  { feature: 'Historical Analysis', free: 'Basic', pro: 'Advanced' },
  { feature: 'Weekly & Monthly Reports', free: '—', pro: 'Included' },
  { feature: 'Priority Processing', free: '—', pro: 'Included' },
  { feature: 'Early Feature Access', free: '—', pro: 'Included' },
];

export type Faq = { question: string; answer: string };

export const SUBSCRIPTION_FAQS: Faq[] = [
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. You can cancel whenever you like — your Pro access stays active until the end of the billing period, then switches back to Free. Your history is always kept.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer:
      'Nothing is deleted. All your scans, progress, and achievements stay — some Pro-only features like advanced reports simply pause until you upgrade again.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Absolutely. SkinCoach is free to use with a daily AI scan, the routine tracker, progress timeline, and a basic AI Coach. Pro removes the limits.',
  },
];
