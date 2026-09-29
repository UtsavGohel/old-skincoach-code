import type { NavigatorScreenParams } from '@react-navigation/native';

// docs/18: "Every navigation route must be typed. Never use `any` for navigation."
// Structure follows docs/02's flow: primary stack (Splash→Welcome→Auth→onboarding→
// HomeTabs), with Scan/Results/AICoach/Settings pushed on top rather than being tabs
// themselves (docs/02: "Settings are opened from Profile", "Camera opens from the
// center Scan tab").
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  // No sign-in/sign-up split: SSO and the email sheet both auto-detect new vs
  // returning users, so there's a single "Get Started" entry (docs/19 Phase 21).
  Authentication: undefined;
  // Single onboarding wizard (one question per screen) — replaces the old separate
  // BasicInfo/SkinGoals routes (docs/19 Phase 3: cramped stacked form → focused steps).
  Onboarding: undefined;
  // NavigatorScreenParams so pushed screens can deep-link to a specific tab, e.g.
  // Results' "View Full Progress" → navigate('HomeTabs', { screen: 'Progress' }).
  HomeTabs: NavigatorScreenParams<HomeTabParamList> | undefined;
  ScanGuidelines: undefined;
  // Create/edit the user's morning & night routine (pre-fills from the existing one).
  RoutineEditor: undefined;
  Camera: undefined;
  Analyzing: undefined;
  AnalysisComplete: undefined;
  Results: undefined;
  AICoach: undefined;
  // Ask-AI conversation, opened from the coach hub. initialQuestion pre-fills the first
  // exchange when the user taps a suggested-question chip.
  AICoachChat: { initialQuestion?: string } | undefined;
  Settings: undefined;
  // Dedicated notification preferences (docs/11), reached from the Settings row.
  NotificationSettings: undefined;
  // Before/After scan comparison (Phase 14), reached from Progress.
  BeforeAfter: undefined;
  // Freemium → Pro paywall (docs/10), reached from the Pro upsell CTAs. Success replaces
  // to SubscriptionSuccess.
  Subscription: undefined;
  SubscriptionSuccess: undefined;
};

// docs/03/PROJECT_CONTEXT Bottom Navigation: Home, Progress, Routine, Profile are
// real tab screens. "Scan" is the 5th button in the tab bar but isn't a tab screen
// itself — pressing it pushes ScanGuidelines/Camera onto the parent stack instead
// (see CustomTabBar), matching the mockups' floating-FAB treatment.
export type HomeTabParamList = {
  Home: undefined;
  Progress: undefined;
  Routine: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    // Intentionally empty — this is React Navigation's documented declaration-merging
    // pattern so useNavigation()/etc. are typed globally without passing generics
    // everywhere.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
