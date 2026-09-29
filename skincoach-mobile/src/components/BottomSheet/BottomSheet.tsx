import { forwardRef, useCallback, useMemo, type PropsWithChildren } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModal as BottomSheetModalType,
} from '@gorhom/bottom-sheet';

import { useTheme } from '@/hooks/useTheme';

export type BottomSheetProps = PropsWithChildren<{
  snapPoints?: (string | number)[];
}>;

// docs/03 Bottom Sheet: rounded top (32px), blur/dim background, drag indicator.
// Used for forms, filters, email login, subscriptions (per screens built later).
export const AppBottomSheet = forwardRef<BottomSheetModalType, BottomSheetProps>(
  function AppBottomSheet({ children, snapPoints: snapPointsProp }, ref) {
    const theme = useTheme();
    const snapPoints = useMemo(() => snapPointsProp ?? ['50%'], [snapPointsProp]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.4}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderTopLeftRadius: theme.radius.bottomSheet,
          borderTopRightRadius: theme.radius.bottomSheet,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.outlineVariant }}
      >
        <BottomSheetView style={{ padding: theme.spacing.screenPadding }}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
