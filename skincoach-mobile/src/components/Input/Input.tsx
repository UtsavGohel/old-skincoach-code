import { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type InputStatus = 'default' | 'success' | 'error';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  status?: InputStatus;
  helperText?: string;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  style?: ViewStyle;
};

// docs/03 Input Fields: rounded, 16px radius, soft border, floating label, optional
// leading/trailing icons. States: default/focused/success/error/disabled.
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    status = 'default',
    helperText,
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    value,
    editable = true,
    onFocus,
    onBlur,
    style,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Label floats up when the field is focused OR already has a value. Driven reactively
  // (not just in focus/blur) so a value set externally — e.g. a seeded onboarding answer —
  // also floats the label instead of leaving it overlapping the text.
  const isFloating = isFocused || Boolean(value);
  const labelProgress = useSharedValue(isFloating ? 1 : 0);

  useEffect(() => {
    labelProgress.value = withTiming(isFloating ? 1 : 0, {
      duration: theme.duration.fast,
    });
  }, [isFloating, labelProgress, theme]);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(labelProgress.value, [0, 1], [0, -16]) },
      { scale: interpolate(labelProgress.value, [0, 1], [1, 0.8]) },
    ],
  }));

  const borderColor = statusColor(theme, status, isFocused, editable);

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          {
            borderColor,
            borderRadius: theme.radius.input,
            backgroundColor: editable
              ? theme.colors.surfaceContainerLowest
              : theme.colors.surfaceContainer,
          },
        ]}
      >
        {LeadingIcon ? (
          <View style={styles.leadingIcon}>
            <LeadingIcon size={20} color={theme.colors.textSecondary} />
          </View>
        ) : null}
        <View style={styles.inputArea}>
          <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
            {/* Always bodyMd; the float scale (1 → 0.8) shrinks it smoothly, so there's
                no instant size jump between placeholder and floated states. */}
            <Text variant="bodyMd" color="textSecondary" numberOfLines={1}>
              {label}
            </Text>
          </Animated.View>
          <TextInput
            ref={ref}
            value={value}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              theme.typography.bodyMd,
              {
                color: theme.colors.textPrimary,
                opacity: isFloating ? 1 : 0,
                // Drop the text into the lower half once the label has floated up, so the
                // two never occupy the same line (and leave a clear gap under the label).
                paddingTop: isFloating ? 22 : 0,
              },
            ]}
            accessibilityLabel={label}
            placeholderTextColor={theme.colors.textSecondary}
            {...props}
          />
        </View>
        {TrailingIcon ? (
          <View style={styles.trailingIcon}>
            <TrailingIcon size={20} color={theme.colors.textSecondary} />
          </View>
        ) : null}
      </View>
      {helperText ? (
        <Text
          variant="labelSm"
          color={status === 'error' ? 'error' : 'textSecondary'}
          style={styles.helperText}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

function statusColor(
  theme: ReturnType<typeof useTheme>,
  status: InputStatus,
  isFocused: boolean,
  editable: boolean,
): string {
  if (!editable) return theme.colors.outlineVariant;
  if (status === 'error') return theme.colors.error;
  if (status === 'success') return theme.colors.success;
  if (isFocused) return theme.colors.primary;
  return theme.colors.outlineVariant;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputArea: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    // Scale the floating label from its left edge so shrinking it (1 → 0.8) keeps the
    // text flush-left instead of drifting inward toward the center.
    transformOrigin: 'left center',
  },
  input: {
    padding: 0,
    height: '100%',
    textAlignVertical: 'center',
  },
  leadingIcon: {
    marginRight: 12,
  },
  trailingIcon: {
    marginLeft: 12,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
