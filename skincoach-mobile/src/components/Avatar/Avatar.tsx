import { Image, View, type ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

export type AvatarSize = 40 | 56 | 72 | 120;

export type AvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
};

// docs/03 Avatar: circular, sizes 40/56/72/120, supports photo/initials/placeholder.
export function Avatar({ uri, name, size = 40, style }: AvatarProps): React.JSX.Element {
  const theme = useTheme();
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="image"
      accessibilityLabel={name ? `${name}'s avatar` : 'Profile avatar'}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : initials ? (
        <Text
          variant={size >= 72 ? 'headlineMd' : 'labelMd'}
          color="onSecondaryContainer"
        >
          {initials}
        </Text>
      ) : (
        <User size={size * 0.5} color={theme.colors.onSecondaryContainer} />
      )}
    </View>
  );
}

function getInitials(name?: string): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || null;
}
