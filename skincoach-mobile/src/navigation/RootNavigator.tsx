import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AICoachChatScreen } from '@/screens/AICoach/AICoachChatScreen';
import { AICoachScreen } from '@/screens/AICoach';
import { AnalysisCompleteScreen } from '@/screens/AnalysisComplete';
import { AnalyzingScreen } from '@/screens/Analyzing';
import { BeforeAfterScreen } from '@/screens/BeforeAfter';
import { AuthenticationScreen } from '@/screens/Authentication';
import { CameraScreen } from '@/screens/Camera';
import { NotificationSettingsScreen } from '@/screens/NotificationSettings';
import { OnboardingScreen } from '@/screens/Onboarding';
import { ResultsScreen } from '@/screens/Results';
import { RoutineEditorScreen } from '@/screens/RoutineEditor';
import { ScanGuidelinesScreen } from '@/screens/ScanGuidelines';
import { SettingsScreen } from '@/screens/Settings';
import { SplashScreen } from '@/screens/Splash';
import { SubscriptionScreen, SubscriptionSuccessScreen } from '@/screens/Subscription';
import { WelcomeScreen } from '@/screens/Welcome';

import { HomeTabNavigator } from './HomeTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// docs/02 Primary/First-Time/Returning User Flow: Splash -> Welcome -> Auth ->
// Onboarding (single wizard) -> Home (tabs). Scan/Results/AICoach/Settings are pushed
// on top of the tabs rather than being tabs themselves. Real auth-state-driven initial
// routing (skip Welcome/onboarding for returning users) lands with the Clerk pass —
// this is just the shape of the stack.
export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Authentication" component={AuthenticationScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="HomeTabs" component={HomeTabNavigator} />
      <Stack.Screen name="ScanGuidelines" component={ScanGuidelinesScreen} />
      <Stack.Screen name="RoutineEditor" component={RoutineEditorScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
      <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="BeforeAfter" component={BeforeAfterScreen} />
      <Stack.Screen name="AICoach" component={AICoachScreen} />
      <Stack.Screen name="AICoachChat" component={AICoachChatScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="SubscriptionSuccess" component={SubscriptionSuccessScreen} />
    </Stack.Navigator>
  );
}
