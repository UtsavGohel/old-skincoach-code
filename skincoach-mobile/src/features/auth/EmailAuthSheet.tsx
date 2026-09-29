import { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useToastStore } from '@/store/toast.store';

import {
  emailPasswordSchema,
  verificationCodeSchema,
  type EmailPasswordFormValues,
  type VerificationCodeFormValues,
} from './schemas';

type Step = 'form' | 'verify';

// Clerk error code for "no account with this identifier" — how we tell a returning
// user (sign in) from a new one (sign up) off a single password attempt.
const IDENTIFIER_NOT_FOUND = 'form_identifier_not_found';

// This sheet renders inside a @gorhom BottomSheetModal, which portals its content
// OUTSIDE the NavigationContainer — so it can't use useNavigation() itself. The parent
// (AuthenticationScreen, which is in the nav tree) passes `onAuthenticated`, called
// after a successful sign-in/up to route onward.
//
// There's no sign-in vs sign-up mode: the user enters email + password once and we
// auto-detect — try to sign them in, and if no such account exists, create one and
// send a verification code. Mirrors the SSO buttons, which are also single-flow.
export function EmailAuthSheet({
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const showToast = useToastStore((state) => state.showToast);
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [step, setStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const credentialsForm = useForm<EmailPasswordFormValues>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });
  const verifyForm = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: '' },
  });

  const handleClerkError = (error: unknown): void => {
    const message = isClerkAPIResponseError(error)
      ? (error.errors[0]?.longMessage ??
        error.errors[0]?.message ??
        'Something went wrong')
      : 'Something went wrong. Please try again.';
    showToast(message, 'error');
  };

  // New account (no such identifier): register + send the email verification code.
  const startSignUp = async (values: EmailPasswordFormValues): Promise<void> => {
    if (!signUp) return;
    await signUp.create({ emailAddress: values.email, password: values.password });
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setPendingEmail(values.email);
    setStep('verify');
  };

  const onSubmitCredentials = async (values: EmailPasswordFormValues): Promise<void> => {
    if (!signInLoaded || !signUpLoaded) return;
    setIsSubmitting(true);
    try {
      // Returning user? Try a password sign-in first.
      const result = await signIn.create({
        strategy: 'password',
        identifier: values.email,
        password: values.password,
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActiveSignIn({ session: result.createdSessionId });
        onAuthenticated();
      } else {
        showToast('Additional verification is required for this account.', 'info');
      }
    } catch (error) {
      // No account with this email → treat it as a new sign-up instead of erroring.
      const isNewUser =
        isClerkAPIResponseError(error) &&
        error.errors.some((e) => e.code === IDENTIFIER_NOT_FOUND);
      if (isNewUser) {
        try {
          await startSignUp(values);
        } catch (signUpError) {
          handleClerkError(signUpError);
        }
      } else {
        handleClerkError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitVerification = async (
    values: VerificationCodeFormValues,
  ): Promise<void> => {
    if (!signUpLoaded) return;
    setIsSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: values.code });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActiveSignUp({ session: result.createdSessionId });
        onAuthenticated();
      } else {
        showToast('Invalid or expired code. Please try again.', 'error');
      }
    } catch (error) {
      handleClerkError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'verify') {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="headlineMd" color="primary">
          Check your email
        </Text>
        <Text variant="bodyMd" color="textSecondary">
          Enter the 6-digit code we sent to {pendingEmail}.
        </Text>
        <Controller
          control={verifyForm.control}
          name="code"
          render={({ field, fieldState }) => (
            <Input
              label="Verification Code"
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              status={fieldState.error ? 'error' : 'default'}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Button
          label="Verify & Continue"
          loading={isSubmitting}
          onPress={verifyForm.handleSubmit(onSubmitVerification)}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="headlineMd" color="primary">
        Continue with Email
      </Text>
      <Text variant="bodyMd" color="textSecondary">
        Enter your email and password — we&apos;ll sign you in, or set up your account if
        you&apos;re new.
      </Text>
      <Controller
        control={credentialsForm.control}
        name="email"
        render={({ field, fieldState }) => (
          <Input
            label="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            status={fieldState.error ? 'error' : 'default'}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={credentialsForm.control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            label="Password"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            status={fieldState.error ? 'error' : 'default'}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Button
        label="Continue"
        loading={isSubmitting}
        onPress={credentialsForm.handleSubmit(onSubmitCredentials)}
      />
    </View>
  );
}
