import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.card}>
          {/* Top Icon Badge */}
          <View
            style={[
              styles.iconCircle,
              isDestructive
                ? { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.35)' }
                : { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}35` },
            ]}>
            <MaterialCommunityIcons
              name={isDestructive ? 'trash-can-outline' : 'help-circle-outline'}
              size={28}
              color={isDestructive ? '#EF4444' : theme.accent}
            />
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmBtn,
                isDestructive
                  ? styles.confirmBtnDestructive
                  : { backgroundColor: theme.accent },
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.confirmText,
                  { color: isDestructive ? '#FFFFFF' : '#050507' },
                ]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0E1118',
    borderRadius: 26,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    gap: Spacing.four,
    ...Shadows.cardElevated,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  message: {
    color: Brand.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 270,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
    paddingTop: Spacing.one,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  cancelText: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.2,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDestructive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
