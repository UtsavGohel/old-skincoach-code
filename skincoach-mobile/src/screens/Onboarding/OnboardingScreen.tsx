import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { isMockApiEnabled } from '@/api/client';
import { saveOnboardingProfile } from '@/api/user.api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { AgeWheelPicker } from '@/features/profile/components/AgeWheelPicker';
import { ExperienceOption } from '@/features/profile/components/ExperienceOption';
import { OnboardingHeader } from '@/features/profile/components/OnboardingHeader';
import { SelectChip } from '@/features/profile/components/SelectChip';
import { SelectionCard } from '@/features/profile/components/SelectionCard';
import {
  AGE_DEFAULT,
  AGE_MAX,
  AGE_MIN,
  EXPERIENCE_OPTIONS,
  GENDER_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SKIN_TYPE_OPTIONS,
} from '@/features/profile/onboarding.options';
import type {
  ExperienceLevel,
  Gender,
  PrimaryGoal,
  SkinType,
} from '@/features/profile/profile.types';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';
import { useUserStore } from '@/store/user.store';
import type { RootStackParamList } from '@/navigation/types';

// One-question-per-screen onboarding wizard (design refs: onboarding_let_s_get_started
// + onboarding_skin_profile_goals, restructured — see docs/19 Phase 3). Stacking name +
// a tall age wheel + gender on one screen read as cramped/unclear on-device, so each
// question now owns the full screen with a single shared progress bar. Answers commit
// to the mock user store step-by-step; the last step finalizes and enters the app.
type StepId = 'name' | 'age' | 'gender' | 'skinType' | 'goal' | 'experience';

const STEPS: StepId[] = ['name', 'age', 'gender', 'skinType', 'goal', 'experience'];

const STEP_COPY: Record<StepId, { title: string; subtitle: string }> = {
  name: { title: "What's your name?", subtitle: 'So your coach knows what to call you.' },
  age: { title: 'How old are you?', subtitle: 'Swipe to select your age.' },
  gender: { title: 'How do you identify?', subtitle: 'This helps tailor your insights.' },
  skinType: { title: "What's your skin type?", subtitle: 'Pick the closest match.' },
  goal: {
    title: "What's your primary goal?",
    subtitle: 'Choose the one that matters most.',
  },
  experience: {
    title: 'How experienced are you?',
    subtitle: 'With skincare routines and products.',
  },
};

export function OnboardingScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profileDraft = useUserStore((state) => state.profileDraft);
  const updateProfileDraft = useUserStore((state) => state.updateProfileDraft);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const showToast = useToastStore((state) => state.showToast);

  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(profileDraft.name ?? '');
  const [age, setAge] = useState(profileDraft.age ?? AGE_DEFAULT);
  const [gender, setGender] = useState<Gender | undefined>(profileDraft.gender);
  const [skinType, setSkinType] = useState<SkinType | undefined>(profileDraft.skinType);
  const [goal, setGoal] = useState<PrimaryGoal | undefined>(profileDraft.primaryGoal);
  const [experience, setExperience] = useState<ExperienceLevel | undefined>(
    profileDraft.experienceLevel,
  );

  // `?? 'name'` only satisfies noUncheckedIndexedAccess — index is always in range.
  const step: StepId = STEPS[index] ?? 'name';
  const isLast = index === STEPS.length - 1;

  const answered: Record<StepId, boolean> = {
    name: name.trim().length > 0,
    age: true,
    gender: gender !== undefined,
    skinType: skinType !== undefined,
    goal: goal !== undefined,
    experience: experience !== undefined,
  };

  const commitStep = (): void => {
    if (step === 'name') updateProfileDraft({ name: name.trim() });
    else if (step === 'age') updateProfileDraft({ age });
    else if (step === 'gender') updateProfileDraft({ gender });
    else if (step === 'skinType') updateProfileDraft({ skinType });
    else if (step === 'goal') updateProfileDraft({ primaryGoal: goal });
    else updateProfileDraft({ experienceLevel: experience });
  };

  const handleBack = (): void => {
    if (index > 0) setIndex(index - 1);
    else navigation.goBack();
  };

  const handleNext = (): void => {
    commitStep();
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    void finishOnboarding();
  };

  const finishOnboarding = async (): Promise<void> => {
    if (isSubmitting) return;
    // Build the full profile from local answers (the last commitStep's setState hasn't
    // flushed to the store yet).
    const draft = {
      name: name.trim(),
      age,
      gender,
      skinType,
      primaryGoal: goal,
      experienceLevel: experience,
    };
    setIsSubmitting(true);
    try {
      // Persist to the backend (skipped in mock-data mode). Retries cover the brief
      // window before the Clerk webhook has synced a brand-new user.
      if (!isMockApiEnabled) {
        await saveOnboardingProfile(draft);
      }
      completeOnboarding();
      // First-time users land on Home; reset so onboarding can't be swiped back into.
      navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
    } catch {
      showToast('Could not save your profile. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <OnboardingHeader step={index + 1} totalSteps={STEPS.length} onBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View key={step} entering={FadeIn.duration(220)} style={styles.content}>
          <Text variant="headlineLgMobile" color="textPrimary" style={styles.title}>
            {STEP_COPY[step].title}
          </Text>
          <Text variant="bodyMd" color="textSecondary" style={styles.subtitle}>
            {STEP_COPY[step].subtitle}
          </Text>

          <View style={styles.control}>
            {step === 'name' ? (
              <Input
                label="Your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => answered.name && handleNext()}
              />
            ) : null}

            {step === 'age' ? (
              <AgeWheelPicker value={age} min={AGE_MIN} max={AGE_MAX} onChange={setAge} />
            ) : null}

            {step === 'gender' ? (
              <View style={styles.chips}>
                {GENDER_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    selected={gender === option.value}
                    onPress={() => setGender(option.value)}
                  />
                ))}
              </View>
            ) : null}

            {step === 'skinType' ? (
              <View style={styles.grid}>
                {SKIN_TYPE_OPTIONS.map((option) => (
                  <View key={option.value} style={styles.gridItem}>
                    <SelectionCard
                      label={option.label}
                      icon={option.icon}
                      selected={skinType === option.value}
                      onPress={() => setSkinType(option.value)}
                    />
                  </View>
                ))}
              </View>
            ) : null}

            {step === 'goal' ? (
              <View style={styles.chips}>
                {PRIMARY_GOAL_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    selected={goal === option.value}
                    onPress={() => setGoal(option.value)}
                  />
                ))}
              </View>
            ) : null}

            {step === 'experience' ? (
              <View style={styles.levels}>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <ExperienceOption
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    icon={option.icon}
                    selected={experience === option.value}
                    onPress={() => setExperience(option.value)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View
          style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}
        >
          <Button
            label={isLast ? 'Start My Skin Journey' : 'Continue'}
            icon={ArrowRight}
            iconPosition="trailing"
            loading={isSubmitting}
            disabled={!answered[step] || isSubmitting}
            onPress={handleNext}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
  },
  control: {
    width: '100%',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 12,
    rowGap: 12,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
    maxWidth: '48%',
  },
  levels: {
    gap: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
