import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Brand, Radius, Spacing } from '@/constants/theme';
import { AnimatedTabScreen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { convertWeight } from '@/lib/utils';

type BenchmarkCard = {
  tag: string;
  lbs: string;
  kg: string;
  sub: string;
};

const BARBELL_BENCHMARKS: BenchmarkCard[] = [
  { tag: 'Bar Only', lbs: '45', kg: '20.4', sub: 'Olympic Bar' },
  { tag: '1 Plate', lbs: '135', kg: '61.2', sub: '45 lb / 20 kg' },
  { tag: '1 Plate + 25', lbs: '185', kg: '83.9', sub: '+25 lb / 11.3 kg' },
  { tag: '2 Plates', lbs: '225', kg: '102.1', sub: '2 × 45 lb / 20 kg' },
  { tag: '2 Plates + 25', lbs: '275', kg: '124.7', sub: '+25 lb / 11.3 kg' },
  { tag: '3 Plates', lbs: '315', kg: '142.9', sub: '3 × 45 lb / 20 kg' },
  { tag: '3 Plates + 25', lbs: '365', kg: '165.6', sub: '+25 lb / 11.3 kg' },
  { tag: '4 Plates', lbs: '405', kg: '183.7', sub: '4 × 45 lb / 20 kg' },
  { tag: '5 Plates', lbs: '495', kg: '224.5', sub: '5 × 45 lb / 20 kg' },
];

const DUMBBELL_PRESETS = [
  { kg: '5', lbs: '11' },
  { kg: '10', lbs: '22' },
  { kg: '15', lbs: '33.1' },
  { kg: '20', lbs: '44.1' },
  { kg: '25', lbs: '55.1' },
  { kg: '30', lbs: '66.1' },
  { kg: '35', lbs: '77.2' },
  { kg: '40', lbs: '88.2' },
];

const NEGATIVE_DELTAS = [-10, -5, -2.5, -1];
const POSITIVE_DELTAS = [+1, +2.5, +5, +10];

export default function CalculatorScreen() {
  const theme = useTheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Live Synchronized Dual Inputs
  const [kgVal, setKgVal] = useState('100');
  const [lbsVal, setLbsVal] = useState('220.5');
  const [activeInput, setActiveInput] = useState<'kg' | 'lbs'>('kg');

  // Animated Swap Rotation
  const swapRotation = useSharedValue(0);

  const swapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleKgChange = (val: string) => {
    setActiveInput('kg');
    setKgVal(val);
    if (!val || isNaN(parseFloat(val))) {
      setLbsVal('');
    } else {
      setLbsVal(convertWeight(val, 'kg', 'lbs'));
    }
  };

  const handleLbsChange = (val: string) => {
    setActiveInput('lbs');
    setLbsVal(val);
    if (!val || isNaN(parseFloat(val))) {
      setKgVal('');
    } else {
      setKgVal(convertWeight(val, 'lbs', 'kg'));
    }
  };

  const handleSwapPress = () => {
    // 1. Rotate the swap badge 180 degrees
    swapRotation.value = withSpring(swapRotation.value + 180, {
      damping: 14,
      stiffness: 160,
    });

    // 2. Invert active focus & swap the values
    const nextInput = activeInput === 'kg' ? 'lbs' : 'kg';
    setActiveInput(nextInput);
  };

  const adjustWeight = (delta: number) => {
    if (activeInput === 'kg') {
      const current = parseFloat(kgVal) || 0;
      const next = Math.max(0, Math.round((current + delta) * 10) / 10);
      handleKgChange(next.toString());
    } else {
      const current = parseFloat(lbsVal) || 0;
      const next = Math.max(0, Math.round((current + delta * 2) * 10) / 10);
      handleLbsChange(next.toString());
    }
  };

  const setExactKg = (kg: string) => {
    setActiveInput('kg');
    handleKgChange(kg);
  };

  const setExactBenchmark = (item: BenchmarkCard) => {
    setKgVal(item.kg);
    setLbsVal(item.lbs);
  };

  const handleClear = () => {
    setKgVal('');
    setLbsVal('');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <AnimatedTabScreen>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View>
                    <Text style={styles.sectionTag}>PRECISION CONVERTER</Text>
                    <Text style={styles.headline}>KG ⇄ LBS</Text>
                  </View>

                  <View style={styles.headerActions}>
                    {isKeyboardVisible && (
                      <Pressable
                        onPress={Keyboard.dismiss}
                        style={[styles.doneBtnHeader, { backgroundColor: theme.accent }]}>
                        <MaterialCommunityIcons name="keyboard-close" size={16} color="#050507" />
                        <Text style={styles.doneBtnHeaderText}>Done</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={handleClear} style={styles.clearHeaderBtn}>
                      <MaterialCommunityIcons name="refresh" size={16} color={Brand.textSecondary} />
                      <Text style={styles.clearHeaderText}>Reset</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Primary Interactive Dual Converter Hero Card */}
              <View style={styles.converterHeroCard}>
                {/* 1. Kilograms Card Box */}
                <Pressable
                  onPress={() => setActiveInput('kg')}
                  style={[
                    styles.unitInputBox,
                    activeInput === 'kg' && [
                      styles.unitInputBoxActive,
                      { borderColor: theme.accent, backgroundColor: `${theme.accent}08` },
                    ],
                  ]}>
                  <View style={styles.unitInputHeader}>
                    <View
                      style={[
                        styles.unitPill,
                        activeInput === 'kg'
                          ? { backgroundColor: `${theme.accent}20` }
                          : styles.unitPillSecondary,
                      ]}>
                      <Text
                        style={[
                          styles.unitPillText,
                          activeInput === 'kg'
                            ? { color: theme.accent }
                            : styles.unitPillTextSecondary,
                        ]}>
                        KILOGRAMS
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.unitSymbolLarge,
                        activeInput === 'kg' && { color: theme.accent },
                      ]}>
                      KG
                    </Text>
                  </View>

                  <TextInput
                    value={kgVal}
                    onChangeText={handleKgChange}
                    onFocus={() => setActiveInput('kg')}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="0"
                    placeholderTextColor={Brand.textMuted}
                    style={styles.bigNumberInput}
                  />
                </Pressable>

                {/* Interactive Functional Swap Button Divider */}
                <View style={styles.swapDividerRow}>
                  <View style={styles.swapLine} />
                  <Pressable
                    onPress={handleSwapPress}
                    style={({ pressed }) => [
                      styles.swapBadgeBtn,
                      { borderColor: `${theme.accent}50` },
                      pressed && styles.pressed,
                    ]}>
                    <Animated.View style={swapAnimatedStyle}>
                      <MaterialCommunityIcons name="swap-vertical" size={20} color={theme.accent} />
                    </Animated.View>
                  </Pressable>
                  <View style={styles.swapLine} />
                </View>

                {/* 2. Pounds Card Box (Directly editable in place) */}
                <Pressable
                  onPress={() => setActiveInput('lbs')}
                  style={[
                    styles.unitInputBox,
                    activeInput === 'lbs' && [
                      styles.unitInputBoxActive,
                      { borderColor: theme.accent, backgroundColor: `${theme.accent}08` },
                    ],
                  ]}>
                  <View style={styles.unitInputHeader}>
                    <View
                      style={[
                        styles.unitPill,
                        activeInput === 'lbs'
                          ? { backgroundColor: `${theme.accent}20` }
                          : styles.unitPillSecondary,
                      ]}>
                      <Text
                        style={[
                          styles.unitPillText,
                          activeInput === 'lbs'
                            ? { color: theme.accent }
                            : styles.unitPillTextSecondary,
                        ]}>
                        POUNDS
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.unitSymbolLarge,
                        activeInput === 'lbs' && { color: theme.accent },
                      ]}>
                      LBS
                    </Text>
                  </View>

                  <TextInput
                    value={lbsVal}
                    onChangeText={handleLbsChange}
                    onFocus={() => setActiveInput('lbs')}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="0"
                    placeholderTextColor={Brand.textMuted}
                    style={styles.bigNumberInput}
                  />
                </Pressable>

                {/* Quick Increment Steppers Grid (Clean 4-column balanced rows, 0 leak) */}
                <View style={styles.stepperSection}>
                  <Text style={styles.stepperLabel}>
                    QUICK ADJUST ({activeInput.toUpperCase()})
                  </Text>

                  {/* Decrements Row */}
                  <View style={styles.stepperRow}>
                    {NEGATIVE_DELTAS.map((delta) => (
                      <Pressable
                        key={delta}
                        onPress={() => adjustWeight(delta)}
                        style={({ pressed }) => [
                          styles.stepperBtn,
                          styles.stepperBtnMinus,
                          pressed && styles.pressed,
                        ]}>
                        <Text style={styles.stepperBtnText}>{delta}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Increments Row */}
                  <View style={styles.stepperRow}>
                    {POSITIVE_DELTAS.map((delta) => (
                      <Pressable
                        key={delta}
                        onPress={() => adjustWeight(delta)}
                        style={({ pressed }) => [
                          styles.stepperBtn,
                          styles.stepperBtnPlus,
                          {
                            borderColor: `${theme.accent}30`,
                            backgroundColor: `${theme.accent}08`,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <Text style={[styles.stepperBtnText, { color: theme.accent }]}>
                          +{delta}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Barbell Load Benchmarks (Clean 2-Column Grid) */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <MaterialCommunityIcons name="weight-lifter" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>OLYMPIC BARBELL BENCHMARKS</Text>
                </View>

                <View style={styles.benchmarksGrid}>
                  {BARBELL_BENCHMARKS.map((item) => {
                    const isSelected = lbsVal === item.lbs;
                    return (
                      <Pressable
                        key={item.lbs}
                        onPress={() => setExactBenchmark(item)}
                        style={({ pressed }) => [
                          styles.benchmarkGridCard,
                          isSelected && [
                            styles.benchmarkGridCardSelected,
                            { borderColor: theme.accent, backgroundColor: `${theme.accent}12` },
                          ],
                          pressed && styles.pressed,
                        ]}>
                        <View style={styles.benchmarkCardTop}>
                          <Text
                            style={[
                              styles.benchmarkTagText,
                              isSelected && { color: theme.accent },
                            ]}>
                            {item.tag}
                          </Text>
                          <Text style={styles.benchmarkSubText}>{item.sub}</Text>
                        </View>

                        <View style={styles.benchmarkValuesRow}>
                          <Text style={styles.gridLbsText}>{item.lbs} lbs</Text>
                          <Text style={styles.gridArrowText}>⇄</Text>
                          <Text style={[styles.gridKgText, { color: theme.accent }]}>
                            {item.kg} kg
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Dumbbell & Kettlebell Presets */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>DUMBBELL & KETTLEBELL PRESETS</Text>
                </View>
                <View style={styles.dumbbellPillsGrid}>
                  {DUMBBELL_PRESETS.map((db) => {
                    const isSelected = kgVal === db.kg;
                    return (
                      <Pressable
                        key={db.kg}
                        onPress={() => setExactKg(db.kg)}
                        style={({ pressed }) => [
                          styles.dumbbellPill,
                          isSelected && [
                            styles.dumbbellPillSelected,
                            { borderColor: theme.accent, backgroundColor: `${theme.accent}15` },
                          ],
                          pressed && styles.pressed,
                        ]}>
                        <Text
                          style={[
                            styles.dumbbellPillKg,
                            isSelected && { color: theme.accent, fontWeight: '800' },
                          ]}>
                          {db.kg} kg
                        </Text>
                        <Text style={styles.dumbbellPillArrow}>⇄</Text>
                        <Text
                          style={[
                            styles.dumbbellPillLbs,
                            isSelected && styles.dumbbellPillLbsSelected,
                          ]}>
                          {db.lbs} lbs
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Exact Formula Reference Footer */}
              <View style={styles.formulaCard}>
                <MaterialCommunityIcons name="calculator-variant" size={18} color={Brand.textMuted} />
                <View style={styles.formulaTextCol}>
                  <Text style={styles.formulaTitle}>Exact Scientific Conversion Ratio</Text>
                  <Text style={styles.formulaDetails}>
                    1 kg = 2.20462262 lbs · 1 lb = 0.45359237 kg
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Floating Dismiss Button */}
            {isKeyboardVisible && (
              <Pressable
                onPress={Keyboard.dismiss}
                style={[styles.floatingDismissBtn, { backgroundColor: theme.accent }]}>
                <MaterialCommunityIcons name="keyboard-close" size={16} color="#050507" />
                <Text style={styles.floatingDismissText}>Done</Text>
              </Pressable>
            )}
          </KeyboardAvoidingView>
        </AnimatedTabScreen>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  doneBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  doneBtnHeaderText: {
    color: '#050507',
    fontSize: 12,
    fontWeight: '800',
  },
  clearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  clearHeaderText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  converterHeroCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  unitInputBox: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: Spacing.one,
  },
  unitInputBoxActive: {
    borderColor: Brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  unitInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unitPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unitPillSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  unitPillTextSecondary: {
    color: Brand.textSecondary,
  },
  unitSymbolLarge: {
    color: Brand.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  bigNumberInput: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    padding: 0,
    marginTop: 2,
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  swapBadgeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  stepperSection: {
    gap: 8,
    paddingTop: Spacing.one,
  },
  stepperLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  stepperBtn: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.xs,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepperBtnMinus: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperBtnPlus: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  stepperBtnText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sectionCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionCardTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  benchmarksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  benchmarkGridCard: {
    width: '48.5%',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 6,
  },
  benchmarkGridCardSelected: {
    borderColor: Brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  benchmarkCardTop: {
    gap: 1,
  },
  benchmarkTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  benchmarkSubText: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  benchmarkValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLbsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  gridArrowText: {
    color: Brand.textMuted,
    fontSize: 10,
  },
  gridKgText: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dumbbellPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dumbbellPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  dumbbellPillSelected: {
    borderColor: Brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dumbbellPillKg: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dumbbellPillArrow: {
    color: Brand.textMuted,
    fontSize: 10,
  },
  dumbbellPillLbs: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dumbbellPillLbsSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formulaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  formulaTextCol: {
    gap: 2,
    flex: 1,
  },
  formulaTitle: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  formulaDetails: {
    color: Brand.textMuted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  floatingDismissBtn: {
    position: 'absolute',
    bottom: BottomTabInset + 10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.emerald,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  floatingDismissText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
