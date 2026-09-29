import { Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, LineChart, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';
import type { RootStackParamList } from '@/navigation/types';

const FEATURES: { icon: IconComponent; label: string }[] = [
  { icon: Camera, label: 'Daily AI\nSkin Scan' },
  { icon: LineChart, label: 'Track\nProgress' },
  { icon: Sparkles, label: 'Personal\nSkin Coach' },
];

// Same asset URL skincoach_design/welcome_to_skincoach/code.html itself uses (see
// SplashScreen for why: no real asset pipeline/CDN yet, docs/06).
const HERO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDtRLK8Q7Hp_3U5dpcMykCtCkNGD8lvmyiJHM3UkDJkFGvsMienI-l-mo5_cFZxGX5kK5sY6J_Oa0xEmW_QjLr45rQVwwzKomufgud8-jLzzv0Bp5FOotYepPbkcih0fdb1i5m9IHjaekkWWhfbENaTI-YZFen_9ybEQP8D8ec4DgIL7hzgORHK_HZZY7DLFZozXrZLZXaheSUMSflp6iLv6qRUkZix_JbuWEITJ0QIbsJ0mGKIpSF7pw';

// Design ref: welcome_to_skincoach/. Full-bleed top hero with a gradient fade into
// the background, matching the mockup's `h-[55vh]` + `hero-gradient` structure —
// sized down to 44% here (rather than a literal 55%) so the full content column
// (headline/CTAs/feature row) fits on a typical phone without needing to scroll to
// see the feature row, which is easy to miss otherwise. Headline uses display-lg per
// DESIGN.md's explicit rule for welcome screens — the mockup itself used the smaller
// headline-lg (docs/19 Known Mockup Deviations, fixed here).
export function WelcomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView bounces={false}>
        <View style={{ height: '44%', minHeight: 260 }}>
          <Image source={{ uri: HERO_URI }} style={{ flex: 1 }} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            locations={[0.5, 1]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
          />
        </View>

        <View
          style={{
            paddingHorizontal: theme.spacing.screenPadding,
            alignItems: 'center',
            marginTop: -theme.spacing.lg,
          }}
        >
          <Text variant="displayLg" color="textPrimary" style={{ textAlign: 'center' }}>
            Better Skin.{'\n'}Every Day.
          </Text>
          <Text
            variant="bodyMd"
            color="textSecondary"
            style={{ textAlign: 'center', marginTop: theme.spacing.sm, maxWidth: 280 }}
          >
            Track your skin&apos;s journey with AI and build healthy habits that last.
          </Text>

          <View
            style={{ width: '100%', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}
          >
            <Button
              label="Get Started"
              onPress={() => navigation.navigate('Authentication')}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              marginTop: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.sm,
            }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <View
                key={label}
                style={{ alignItems: 'center', gap: theme.spacing.sm, maxWidth: 96 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.colors.secondaryContainer,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={theme.colors.secondary} />
                </View>
                <Text
                  variant="labelSm"
                  color="textSecondary"
                  style={{ textAlign: 'center', textTransform: 'uppercase' }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
