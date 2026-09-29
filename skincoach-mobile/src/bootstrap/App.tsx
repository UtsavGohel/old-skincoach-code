import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { buildNavigationTheme } from '@/navigation/navigationTheme';
import { AppProviders } from '@/providers/AppProviders';
import { fontsToLoad } from '@/theme/typography';
import { useTheme } from '@/hooks/useTheme';

// Keep the native splash screen up until fonts have loaded and the first frame has
// laid out. Doing this at module scope, before the component ever mounts, avoids a
// blank-frame flash on cold start.
void SplashScreen.preventAutoHideAsync();

function Navigation(): React.JSX.Element {
  const theme = useTheme();

  const onReady = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationContainer theme={buildNavigationTheme(theme)} onReady={onReady}>
      <RootNavigator />
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts(fontsToLoad);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <Navigation />
    </AppProviders>
  );
}
