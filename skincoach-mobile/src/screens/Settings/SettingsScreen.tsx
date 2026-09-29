import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Languages,
  Link2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Ruler,
  ScanFace,
  Star,
  Trash2,
  User,
} from 'lucide-react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { env } from '@/constants/env';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Text } from '@/components/Text';
import { ProUpsellCard } from '@/features/profile/components/ProUpsellCard';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { ThemeModeSelector } from '@/features/settings/components/ThemeModeSelector';
import { NOTIFICATION_META } from '@/features/settings/settings.meta';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settings.store';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

const APP_VERSION = 'SkinCoach 1.0.0';

// Phase 11 — Settings (design ref: settings; docs/02 Settings Flow, docs/11 notification
// types). Reached from the Profile gear. Pro upsell (reuses the Phase-10 ProUpsellCard so
// the pitch copy is identical — docs/19), Account, Notifications (all 5 documented types),
// Privacy & Security, Preferences (theme selector + language + units), and Support, plus a
// Log Out and version footer. Notification toggles + theme persist to settings.store.
export function SettingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useClerk();
  const showToast = useToastStore((s) => s.showToast);
  const notifications = useSettingsStore((s) => s.notifications);
  const enabledNotificationCount = Object.values(notifications).filter(Boolean).length;

  const [confirm, setConfirm] = useState<'logout' | 'delete' | null>(null);

  const soon = (label: string) => () => showToast(`${label} is coming soon`, 'info');

  const logOut = async (): Promise<void> => {
    setConfirm(null);
    // Actually clear the Clerk session — otherwise the next sign-in hits
    // "You're already signed in" and can't switch accounts.
    if (env.isClerkConfigured) {
      try {
        await signOut();
      } catch {
        // ignore — navigate away regardless
      }
    }
    showToast('Signed out', 'info');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const deleteAccount = (): void => {
    setConfirm(null);
    showToast('Account deletion is coming soon', 'info');
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color={theme.colors.primary} />
        </Pressable>
        <Text variant="headlineMd" color="primary">
          Settings
        </Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProUpsellCard onPressUpgrade={() => navigation.navigate('Subscription')} />

        <SettingsSection title="Account">
          <SettingsRow
            icon={User}
            label="Edit Profile"
            onPress={() => navigation.navigate('Onboarding')}
          />
          <SettingsRow
            icon={Mail}
            label="Email Address"
            value="alex.smith@example.com"
            onPress={soon('Email settings')}
          />
          <SettingsRow
            icon={Lock}
            label="Change Password"
            onPress={soon('Password change')}
          />
          <SettingsRow
            icon={Link2}
            label="Connected Accounts"
            onPress={soon('Connected accounts')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon={Bell}
            label="Notifications"
            value={`${enabledNotificationCount} of ${NOTIFICATION_META.length} on`}
            onPress={() => navigation.navigate('NotificationSettings')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Security">
          <SettingsRow
            icon={ScanFace}
            label="Face Data & Privacy"
            onPress={soon('Face data controls')}
          />
          <SettingsRow
            icon={ImageIcon}
            label="Photo Storage"
            onPress={soon('Photo storage')}
          />
          <SettingsRow
            icon={Download}
            label="Download My Data"
            onPress={soon('Data export')}
          />
          <SettingsRow
            icon={Trash2}
            label="Delete My Account"
            onPress={() => setConfirm('delete')}
            destructive
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <ThemeModeSelector />
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]}
          />
          <SettingsRow
            icon={Languages}
            label="Language"
            value="English"
            onPress={soon('Language selection')}
          />
          <SettingsRow
            icon={Ruler}
            label="Measurement Units"
            value="Metric (ml/°C)"
            onPress={soon('Measurement units')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            icon={MessageCircle}
            label="Help Center"
            onPress={soon('Help center')}
            trailingIcon={ExternalLink}
          />
          <SettingsRow
            icon={Mail}
            label="Contact Support"
            onPress={soon('Contact support')}
          />
          <SettingsRow
            icon={Star}
            label="Rate SkinCoach"
            onPress={soon('App rating')}
            isLast
          />
        </SettingsSection>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={() => setConfirm('logout')}
          style={[styles.logout, { borderColor: theme.colors.outlineVariant }]}
        >
          <LogOut size={20} color={theme.colors.error} />
          <Text variant="labelMd" color="error">
            Log Out
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text variant="labelSm" color="textSecondary">
            {APP_VERSION}
          </Text>
          <Text variant="labelSm" color="textSecondary">
            Made with 💚 for healthier skin.
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirm === 'logout'}
        title="Log out?"
        message="You'll need to sign back in to see your skin progress."
        confirmLabel="Log Out"
        destructive
        onConfirm={() => void logOut()}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        title="Delete your account?"
        message="This permanently removes your account and all your scan history. This can't be undone."
        confirmLabel="Delete Account"
        destructive
        onConfirm={deleteAccount}
        onCancel={() => setConfirm(null)}
      />
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  divider: {
    height: 1,
    marginHorizontal: 4,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 9999,
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
});
