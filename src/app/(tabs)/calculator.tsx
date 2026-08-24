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
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Brand, Radius, Spacing } from '@/constants/theme';
import { AnimatedTabScreen } from '@/components/ui';
import { convertWeight } from '@/lib/utils';

type BenchmarkItem = {
  plates: string;
  lbs: string;
  kg: string;
  name: string;
};

const BARBELL_BENCHMARKS: BenchmarkItem[] = [
  { plates: 'Bar', lbs: '45', kg: '20.4', name: 'Standard Olympic Bar' },
  { plates: '1 Plate', lbs: '135', kg: '61.2', name: '135 lbs / 1 Plate per side' },
  { plates: '1 Plate + 25s', lbs: '185', kg: '83.9', name: '185 lbs / 1 Plate + 25 lb' },
  { plates: '2 Plates', lbs: '225', kg: '102.1', name: '225 lbs / 2 Plates per side' },
  { plates: '2 Plates + 25s', lbs: '275', kg: '124.7', name: '275 lbs / 2 Plates + 25 lb' },
  { plates: '3 Plates', lbs: '315', kg: '142.9', name: '315 lbs / 3 Plates per side' },
  { plates: '3 Plates + 25s', lbs: '365', kg: '165.6', name: '365 lbs / 3 Plates + 25 lb' },
  { plates: '4 Plates', lbs: '405', kg: '183.7', name: '405 lbs / 4 Plates per side' },
  { plates: '5 Plates', lbs: '495', kg: '224.5', name: '495 lbs / 5 Plates per side' },
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

export default function CalculatorScreen() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Live Synchronized Dual Inputs
  const [kgVal, setKgVal] = useState('100');
  const [lbsVal, setLbsVal] = useState('220.5');
  const [activeInput, setActiveInput] = useState<'kg' | 'lbs'>('kg');

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
    handleKgChange(kg);
  };

  const setExactBenchmark = (item: BenchmarkItem) => {
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
                      <Pressable onPress={Keyboard.dismiss} style={styles.doneBtnHeader}>
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
                    activeInput === 'kg' && styles.unitInputBoxActive,
                  ]}>
                  <View style={styles.unitInputHeader}>
                    <View style={styles.unitPill}>
                      <Text style={styles.unitPillText}>KILOGRAMS</Text>
                    </View>
                    <Text style={styles.unitSymbolLarge}>KG</Text>
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
                    style={[styles.bigNumberInput, activeInput === 'kg' && styles.numberInputActive]}
                  />
                </Pressable>

                {/* Swap Icon Divider */}
                <View style={styles.swapDividerRow}>
                  <View style={styles.swapLine} />
                  <View style={styles.swapBadge}>
                    <MaterialCommunityIcons name="swap-vertical" size={20} color={Brand.emerald} />
                  </View>
                  <View style={styles.swapLine} />
                </View>

                {/* 2. Pounds Card Box */}
                <Pressable
                  onPress={() => setActiveInput('lbs')}
                  style={[
                    styles.unitInputBox,
                    activeInput === 'lbs' && styles.unitInputBoxActive,
                  ]}>
                  <View style={styles.unitInputHeader}>
                    <View style={[styles.unitPill, styles.unitPillSecondary]}>
                      <Text style={[styles.unitPillText, styles.unitPillTextSecondary]}>
                        POUNDS
                      </Text>
                    </View>
                    <Text style={styles.unitSymbolLarge}>LBS</Text>
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
                    style={[styles.bigNumberInput, activeInput === 'lbs' && styles.numberInputActive]}
                  />
                </Pressable>

                {/* Quick Increment Steppers Row */}
                <View style={styles.stepperSection}>
                  <Text style={styles.stepperLabel}>
                    QUICK ADJUST ({activeInput.toUpperCase()})
                  </Text>
                  <View style={styles.stepperPillsRow}>
                    {[-10, -5, -2.5, -1, +1, +2.5, +5, +10].map((delta) => (
                      <Pressable
                        key={delta}
                        onPress={() => adjustWeight(delta)}
                        style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}>
                        <Text style={styles.stepperBtnText}>
                          {delta > 0 ? `+${delta}` : delta}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Dumbbell & Kettlebell Presets */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={18} color={Brand.emerald} />
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
                          isSelected && styles.dumbbellPillSelected,
                          pressed && styles.pressed,
                        ]}>
                        <Text
                          style={[
                            styles.dumbbellPillKg,
                            isSelected && styles.dumbbellPillKgSelected,
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

              {/* Barbell Load Benchmarks */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <MaterialCommunityIcons name="weight-lifter" size={18} color={Brand.emerald} />
                  <Text style={styles.sectionCardTitle}>OLYMPIC BARBELL BENCHMARKS</Text>
                </View>
                <View style={styles.benchmarkList}>
                  {BARBELL_BENCHMARKS.map((item, index) => {
                    const isSelected = lbsVal === item.lbs;
                    return (
                      <Pressable
                        key={item.lbs}
                        onPress={() => setExactBenchmark(item)}
                        style={({ pressed }) => [
                          styles.benchmarkCardRow,
                          isSelected && styles.benchmarkCardRowSelected,
                          pressed && styles.pressed,
                        ]}>
                        <View style={styles.benchmarkLeftCol}>
                          <View style={styles.benchmarkBadge}>
                            <Text style={styles.benchmarkBadgeText}>{item.plates}</Text>
                          </View>
                          <Text style={styles.benchmarkNameText}>{item.name}</Text>
                        </View>

                        <View style={styles.benchmarkRightCol}>
                          <Text style={styles.benchmarkLbsText}>{item.lbs} lbs</Text>
                          <Text style={styles.benchmarkArrowText}>⇄</Text>
                          <Text style={styles.benchmarkKgText}>{item.kg} kg</Text>
                        </View>
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
              <Pressable onPress={Keyboard.dismiss} style={styles.floatingDismissBtn}>
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
    backgroundColor: Brand.emerald,
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
    color: Brand.emerald,
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
  numberInputActive: {
    color: '#FFFFFF',
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
  swapBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  stepperSection: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  stepperLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  stepperPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepperBtn: {
    flex: 1,
    minWidth: 40,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.xs,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepperBtnText: {
    color: Brand.textSecondary,
    fontSize: 11,
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
  dumbbellPillKgSelected: {
    color: Brand.emerald,
    fontWeight: '800',
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
  benchmarkList: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  benchmarkCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  benchmarkCardRowSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  benchmarkLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  benchmarkBadge: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benchmarkBadgeText: {
    color: Brand.emerald,
    fontSize: 10,
    fontWeight: '800',
  },
  benchmarkNameText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  benchmarkRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benchmarkLbsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  benchmarkArrowText: {
    color: Brand.textMuted,
    fontSize: 10,
  },
  benchmarkKgText: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
