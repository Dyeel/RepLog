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
import { Brand, Radius, Shadows, Spacing, THEME_PALETTES } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
import { ThemeId } from '@/types';

type ThemeCustomizerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const THEMES_LIST = Object.values(THEME_PALETTES);

export function ThemeCustomizerModal({ visible, onClose }: ThemeCustomizerModalProps) {
  const { themeId, setThemeId } = useWorkoutStore();
  const currentTheme = useTheme();

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
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${currentTheme.accent}18`,
                    borderColor: `${currentTheme.accent}35`,
                  },
                ]}>
                <MaterialCommunityIcons name="palette" size={22} color={currentTheme.accent} />
              </View>
              <View>
                <Text style={styles.title}>Theme Studio</Text>
                <Text style={styles.subtitle}>Select your signature neon dark palette</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color={Brand.textSecondary} />
            </Pressable>
          </View>

          {/* Themes List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {THEMES_LIST.map((item) => {
              const isSelected = themeId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectTheme(item.id)}
                  style={({ pressed }) => [
                    styles.themeCard,
                    isSelected && [
                      styles.themeCardSelected,
                      {
                        borderColor: item.accent,
                        backgroundColor: `${item.accent}10`,
                      },
                    ],
                    pressed && styles.pressed,
                  ]}>
                  {/* Left Swatch & Rings */}
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.swatchOuter,
                        {
                          borderColor: `${item.accent}60`,
                          backgroundColor: `${item.accent}20`,
                          shadowColor: item.accent,
                        },
                        isSelected && styles.swatchOuterSelected,
                      ]}>
                      <View style={[styles.swatchInner, { backgroundColor: item.accent }]} />
                    </View>

                    <View style={styles.themeInfoCol}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[
                            styles.themeName,
                            isSelected && { color: item.accent, fontWeight: '800' },
                          ]}>
                          {item.name}
                        </Text>
                        {isSelected && (
                          <View
                            style={[
                              styles.activeTag,
                              { backgroundColor: `${item.accent}25` },
                            ]}>
                            <Text style={[styles.activeTagText, { color: item.accent }]}>
                              ACTIVE
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.themeSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  {/* Right Status */}
                  <View style={styles.cardRight}>
                    {isSelected ? (
                      <View
                        style={[
                          styles.selectedBadge,
                          {
                            backgroundColor: item.accent,
                            shadowColor: item.accent,
                          },
                        ]}>
                        <MaterialCommunityIcons name="check" size={15} color="#050507" />
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
            <Pressable
              onPress={onClose}
              style={[styles.doneButton, { backgroundColor: currentTheme.accent }]}>
              <Text style={styles.doneButtonText}>Apply & Close</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#0D1017',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    maxHeight: '82%',
    gap: Spacing.three,
    ...Shadows.cardElevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  listContent: {
    gap: 10,
    paddingVertical: Spacing.two,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.cardElevated,
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
  },
  themeCardSelected: {
    borderWidth: 1.5,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  swatchOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchOuterSelected: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  swatchInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeInfoCol: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  activeTag: {
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  themeSubtitle: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  cardRight: {
    marginLeft: Spacing.two,
  },
  selectedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  unselectedRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  footer: {
    paddingTop: Spacing.one,
  },
  doneButton: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  doneButtonText: {
    color: '#050507',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});
