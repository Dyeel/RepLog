import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Brand, Radius, Spacing, THEME_PALETTES } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { ThemeId } from '@/types';

type ThemeCustomizerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const THEMES_LIST = Object.values(THEME_PALETTES);

export function ThemeCustomizerModal({ visible, onClose }: ThemeCustomizerModalProps) {
  const { themeId, setThemeId } = useWorkoutStore();

  const handleSelectTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="palette-outline" size={20} color={Brand.emerald} />
              </View>
              <View>
                <Text style={styles.title}>Theme Studio</Text>
                <Text style={styles.subtitle}>Customize your app visual aesthetic</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={Brand.textSecondary} />
            </Pressable>
          </View>

          {/* Themes List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {THEMES_LIST.map((theme) => {
              const isSelected = themeId === theme.id;
              return (
                <Pressable
                  key={theme.id}
                  onPress={() => handleSelectTheme(theme.id)}
                  style={({ pressed }) => [
                    styles.themeCard,
                    { borderColor: isSelected ? theme.accent : Brand.cardBorder },
                    isSelected && { backgroundColor: `${theme.accent}12` },
                    pressed && styles.pressed,
                  ]}>
                  {/* Left Swatch & Rings */}
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.swatchOuter,
                        { borderColor: theme.accent, backgroundColor: `${theme.accent}20` },
                      ]}>
                      <View style={[styles.swatchInner, { backgroundColor: theme.accent }]} />
                    </View>

                    <View style={styles.themeInfoCol}>
                      <Text
                        style={[
                          styles.themeName,
                          isSelected && { color: theme.accent, fontWeight: '800' },
                        ]}>
                        {theme.name}
                      </Text>
                      <Text style={styles.themeSubtitle}>{theme.subtitle}</Text>
                    </View>
                  </View>

                  {/* Right Status */}
                  <View style={styles.cardRight}>
                    {isSelected ? (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
                        <MaterialCommunityIcons name="check" size={14} color="#050507" />
                      </View>
                    ) : (
                      <View style={styles.unselectedRing} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: Brand.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Brand.cardBorder,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    maxHeight: '80%',
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  swatchOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  themeInfoCol: {
    flex: 1,
    gap: 2,
  },
  themeName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  themeSubtitle: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  cardRight: {
    marginLeft: Spacing.two,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  footer: {
    paddingTop: Spacing.two,
  },
  doneButton: {
    backgroundColor: Brand.emerald,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
