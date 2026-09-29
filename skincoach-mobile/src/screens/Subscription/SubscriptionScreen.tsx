import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { ComparisonTable } from '@/features/subscription/components/ComparisonTable';
import { FaqItem } from '@/features/subscription/components/FaqItem';
import { PricingCard } from '@/features/subscription/components/PricingCard';
import {
  COMPARISON_ROWS,
  PRO_BENEFITS,
  SUBSCRIPTION_FAQS,
  SUBSCRIPTION_PLANS,
} from '@/features/subscription/subscription.content';
import { useTheme } from '@/hooks/useTheme';
import { useSubscriptionStore, type BillingPlan } from '@/store/subscription.store';
import { useToastStore } from '@/store/toast.store';
import type { RootStackParamList } from '@/navigation/types';

// Phase 12 — Subscription paywall (no mockup; built per docs/10 + the Phase-10/11 Pro
// feature list). Sections per docs/10: hero, benefits, comparison, pricing, FAQ, restore,
// CTA. RevenueCat is stubbed — "Upgrade" simulates a store round-trip then flips the
// persisted subscription store to Pro and routes to the success screen. docs/10 UX: never
// trap users — "Maybe Later" always dismisses.
export function SubscriptionScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showToast = useToastStore((s) => s.showToast);
  const activatePro = useSubscriptionStore((s) => s.activatePro);
  const restore = useSubscriptionStore((s) => s.restore);

  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const upgrade = (): void => {
    setPurchasing(true);
    // Simulated store round-trip (RevenueCat stubbed). Real IAP + backend receipt
    // verification lands in Phase 19.
    setTimeout(() => {
      activatePro(selectedPlan);
      setPurchasing(false);
      navigation.replace('SubscriptionSuccess');
    }, 1200);
  };

  const onRestore = (): void => {
    restore();
    showToast('Purchases restored', 'success');
    navigation.replace('SubscriptionSuccess');
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text variant="labelMd" color="textSecondary">
          SkinCoach Pro
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <X size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          >
            <Crown size={32} color={theme.colors.primary} />
          </View>
          <Text variant="headlineLg" color="textPrimary" style={styles.heroTitle}>
            Unlock Your Best Skin
          </Text>
          <Text variant="bodyLg" color="textSecondary" style={styles.heroSubtitle}>
            Track your skin every day with unlimited AI analysis and personalized
            coaching.
          </Text>
        </View>

        <Card style={styles.benefits}>
          {PRO_BENEFITS.map((benefit) => (
            <View key={benefit.title} style={styles.benefit}>
              <View
                style={[
                  styles.benefitIcon,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
              >
                <benefit.icon size={20} color={theme.colors.primary} strokeWidth={1.75} />
              </View>
              <View style={styles.benefitText}>
                <Text variant="bodyMd" color="textPrimary" style={styles.benefitTitle}>
                  {benefit.title}
                </Text>
                <Text variant="labelMd" color="textSecondary">
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.section}>
          <Text variant="headlineMd" color="textPrimary">
            Compare plans
          </Text>
          <ComparisonTable rows={COMPARISON_ROWS} />
        </View>

        <View style={styles.section}>
          <Text variant="headlineMd" color="textPrimary">
            Choose your plan
          </Text>
          <View style={styles.plans}>
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PricingCard
                key={plan.plan}
                plan={plan}
                selected={selectedPlan === plan.plan}
                onSelect={() => setSelectedPlan(plan.plan)}
              />
            ))}
          </View>
        </View>

        <View style={styles.ctaGroup}>
          <Button
            label="Upgrade to Pro"
            fullWidth
            loading={purchasing}
            onPress={upgrade}
            accessibilityLabel="Upgrade to SkinCoach Pro"
          />
          <Button
            label="Restore Purchases"
            variant="text"
            fullWidth
            onPress={onRestore}
            accessibilityLabel="Restore purchases"
          />
        </View>

        <View style={styles.section}>
          <Text variant="headlineMd" color="textPrimary">
            Questions
          </Text>
          <Card style={styles.faqCard}>
            {SUBSCRIPTION_FAQS.map((faq, index) => (
              <FaqItem
                key={faq.question}
                faq={faq}
                isLast={index === SUBSCRIPTION_FAQS.length - 1}
              />
            ))}
          </Card>
        </View>

        <Text variant="labelSm" color="textSecondary" style={styles.legal}>
          Plans renew automatically until cancelled. Cancel anytime in your store account.
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
          onPress={() => navigation.goBack()}
          style={styles.maybeLater}
        >
          <Text variant="labelMd" color="textSecondary">
            Maybe Later
          </Text>
        </Pressable>
      </ScrollView>
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
    gap: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  benefits: {
    gap: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  plans: {
    gap: 12,
  },
  ctaGroup: {
    gap: 4,
  },
  faqCard: {
    paddingVertical: 4,
  },
  legal: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  maybeLater: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
