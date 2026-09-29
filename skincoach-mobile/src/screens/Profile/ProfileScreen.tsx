import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Loading';
import { Text } from '@/components/Text';
import { AchievementsSection } from '@/features/profile/components/AchievementsSection';
import { PersonalProfileCard } from '@/features/profile/components/PersonalProfileCard';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { ProfileStatCard } from '@/features/profile/components/ProfileStatCard';
import { ProUpsellCard } from '@/features/profile/components/ProUpsellCard';
import { useProfileOverview } from '@/features/profile/useProfileOverview';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import { useUserStore } from '@/store/user.store';
import type { RootStackParamList } from '@/navigation/types';

// Phase 10 — Profile & Achievements (design ref: profile_achievements; docs/02 Profile
// Flow). A real bottom tab: header title + settings gear (→ Settings, Phase 11), the
// profile card, a 2×2 stat grid, achievements (all three badge states), the Personal
// Skin Profile (bound to the real onboarding store), and the Pro upsell (real Pro
// features per PROJECT_CONTEXT). Loading/error/success handled.
export function ProfileScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((s) => s.showToast);
  const name = useUserStore((s) => s.profileDraft.name);
  const { data, isLoading, isError, refetch } = useProfileOverview();

  const editProfile = (): void => navigation.navigate('Onboarding');

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text variant="headlineMd" color="primary">
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => navigation.navigate('Settings')}
          hitSlop={8}
          style={styles.iconButton}
        >
          <Settings size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {isError ? (
        <View style={styles.errorState}>
          <EmptyState
            icon={Sparkles}
            title="Couldn't load your profile"
            description="Please check your connection and try again."
            primaryCtaLabel="Try again"
            onPressPrimaryCta={() => void refetch()}
          />
        </View>
      ) : null}

      {data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ProfileCard
            name={name ?? 'SkinCoach User'}
            memberSince={data.memberSince}
            badgeLabel={data.badgeLabel}
            onPressEdit={() => showToast('Photo editing is coming soon', 'info')}
          />

          <View style={styles.statGrid}>
            {data.stats.map((stat) => (
              <View key={stat.key} style={styles.statItem}>
                <ProfileStatCard stat={stat} />
              </View>
            ))}
          </View>

          <AchievementsSection
            achievements={data.achievements}
            onPressViewAll={() =>
              showToast('Full achievements list is coming soon', 'info')
            }
          />

          <PersonalProfileCard onPressEdit={editProfile} />

          <ProUpsellCard onPressUpgrade={() => navigation.navigate('Subscription')} />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 24,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    // Two per row accounting for the 16px gap.
    width: '47%',
    flexGrow: 1,
  },
});
