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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Brand, Radius, Spacing } from '@/constants/theme';
import { AnimatedTabScreen } from '@/components/ui';
import { calculatePlates } from '@/lib/plate-calculator';
import { calculate1RM, convertWeight } from '@/lib/utils';
import { WeightUnit } from '@/types';

type CalcMode = 'converter' | 'plates' | 'one_rm';

const COMMON_BENCHMARKS = [
  { lbs: '45', kg: '20.4', label: 'Bar Only (45 lbs / 20.4 kg)' },
  { lbs: '135', kg: '61.2', label: '1 Plate (135 lbs / 61.2 kg)' },
  { lbs: '185', kg: '83.9', label: '1 Plate + 25s (185 lbs / 83.9 kg)' },
  { lbs: '225', kg: '102.1', label: '2 Plates (225 lbs / 102.1 kg)' },
  { lbs: '275', kg: '124.7', label: '2 Plates + 25s (275 lbs / 124.7 kg)' },
  { lbs: '315', kg: '142.9', label: '3 Plates (315 lbs / 142.9 kg)' },
  { lbs: '365', kg: '165.6', label: '3 Plates + 25s (365 lbs / 165.6 kg)' },
  { lbs: '405', kg: '183.7', label: '4 Plates (405 lbs / 183.7 kg)' },
  { lbs: '495', kg: '224.5', label: '5 Plates (495 lbs / 224.5 kg)' },
];

export default function CalculatorScreen() {
  const [activeMode, setActiveMode] = useState<CalcMode>('converter');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  // 1. KG ⇄ LBS State
  const [kgVal, setKgVal] = useState('100');
  const [lbsVal, setLbsVal] = useState('220.5');

  const handleKgChange = (val: string) => {
    setKgVal(val);
    if (!val || isNaN(parseFloat(val))) {
      setLbsVal('');
    } else {
      setLbsVal(convertWeight(val, 'kg', 'lbs'));
    }
  };

  const handleLbsChange = (val: string) => {
    setLbsVal(val);
    if (!val || isNaN(parseFloat(val))) {
      setKgVal('');
    } else {
      setKgVal(convertWeight(val, 'lbs', 'kg'));
    }
  };

  const adjustKg = (delta: number) => {
    const current = parseFloat(kgVal) || 0;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    handleKgChange(next.toString());
  };

  const applyBenchmark = (item: { lbs: string; kg: string }) => {
    setKgVal(item.kg);
    setLbsVal(item.lbs);
  };

  // 2. Barbell Plates State
  const [plateUnit, setPlateUnit] = useState<WeightUnit>('kg');
  const [plateWeightInput, setPlateWeightInput] = useState('100');
  const [barWeight, setBarWeight] = useState(20);

  const adjustPlateWeight = (delta: number) => {
    const current = parseFloat(plateWeightInput) || 0;
    const next = Math.max(barWeight, Math.round((current + delta) * 10) / 10);
    setPlateWeightInput(next.toString());
  };

  const plateCalc = calculatePlates(parseFloat(plateWeightInput) || 0, plateUnit, barWeight);

  // 3. 1RM Estimator State
  const [oneRmWeight, setOneRmWeight] = useState('100');
  const [oneRmReps, setOneRmReps] = useState('5');
  const [oneRmUnit, setOneRmUnit] = useState<WeightUnit>('kg');

  const estimated1RM = calculate1RM(parseFloat(oneRmWeight) || 0, parseInt(oneRmReps, 10) || 1);

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
            {/* Screen Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View>
                  <Text style={styles.sectionTag}>FITNESS UTILITIES</Text>
                  <Text style={styles.headline}>Calculator</Text>
                </View>

                {isKeyboardVisible && (
                  <Pressable onPress={Keyboard.dismiss} style={styles.doneBtnHeader}>
                    <MaterialCommunityIcons name="keyboard-close" size={16} color="#050507" />
                    <Text style={styles.doneBtnHeaderText}>Done</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Mode Selector Tabs */}
            <View style={styles.tabBar}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setActiveMode('converter');
                }}
                style={[styles.tabBtn, activeMode === 'converter' && styles.tabBtnActive]}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={16}
                  color={activeMode === 'converter' ? '#050507' : Brand.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeMode === 'converter' && styles.tabBtnTextActive,
                  ]}>
                  KG ⇄ LBS
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setActiveMode('plates');
                }}
                style={[styles.tabBtn, activeMode === 'plates' && styles.tabBtnActive]}>
                <MaterialCommunityIcons
                  name="weight"
                  size={16}
                  color={activeMode === 'plates' ? '#050507' : Brand.textSecondary}
                />
                <Text
                  style={[styles.tabBtnText, activeMode === 'plates' && styles.tabBtnTextActive]}>
                  Plates
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setActiveMode('one_rm');
                }}
                style={[styles.tabBtn, activeMode === 'one_rm' && styles.tabBtnActive]}>
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={16}
                  color={activeMode === 'one_rm' ? '#050507' : Brand.textSecondary}
                />
                <Text
                  style={[styles.tabBtnText, activeMode === 'one_rm' && styles.tabBtnTextActive]}>
                  1RM Max
                </Text>
              </Pressable>
            </View>

            {/* MODE 1: KG ⇄ LBS CONVERTER */}
            {activeMode === 'converter' && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="swap-horizontal" size={20} color={Brand.emerald} />
                    <Text style={styles.cardTitle}>BIDIRECTIONAL CONVERTER</Text>
                  </View>
                  <Text style={styles.cardBadge}>Instant Sync</Text>
                </View>

                {/* Primary KG Input */}
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>KILOGRAMS (KG)</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      value={kgVal}
                      onChangeText={handleKgChange}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      placeholder="0"
                      placeholderTextColor={Brand.textMuted}
                      style={styles.textInput}
                    />
                    <Text style={styles.unitBadge}>KG</Text>
                  </View>

                  {/* Quick Stepper Pills */}
                  <View style={styles.steppersRow}>
                    {[-10, -5, -1, +1, +5, +10].map((delta) => (
                      <Pressable
                        key={delta}
                        onPress={() => adjustKg(delta)}
                        style={({ pressed }) => [styles.stepperPill, pressed && styles.pressed]}>
                        <Text style={styles.stepperPillText}>
                          {delta > 0 ? `+${delta}` : delta}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <View style={styles.equalCircle}>
                    <MaterialCommunityIcons name="equal" size={16} color={Brand.emerald} />
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Secondary LBS Input */}
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>POUNDS (LBS)</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      value={lbsVal}
                      onChangeText={handleLbsChange}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      placeholder="0"
                      placeholderTextColor={Brand.textMuted}
                      style={styles.textInput}
                    />
                    <Text style={styles.unitBadge}>LBS</Text>
                  </View>
                </View>

                {/* Benchmarks Section (Clean Full-Width List) */}
                <View style={styles.benchmarksSection}>
                  <Text style={styles.subHeader}>BARBELL BENCHMARK PRESETS</Text>
                  <View style={styles.benchmarksList}>
                    {COMMON_BENCHMARKS.map((item) => (
                      <Pressable
                        key={item.lbs}
                        onPress={() => applyBenchmark(item)}
                        style={({ pressed }) => [
                          styles.benchmarkRow,
                          pressed && styles.rowPressed,
                        ]}>
                        <Text style={styles.benchmarkLabel}>{item.label}</Text>
                        <View style={styles.benchmarkRight}>
                          <Text style={styles.benchmarkLbs}>{item.lbs} lbs</Text>
                          <Text style={styles.benchmarkArrow}>⇄</Text>
                          <Text style={styles.benchmarkKg}>{item.kg} kg</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* MODE 2: BARBELL PLATES CALCULATOR */}
            {activeMode === 'plates' && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="weight" size={20} color={Brand.emerald} />
                    <Text style={styles.cardTitle}>OLYMPIC BARBELL LOADER</Text>
                  </View>

                  {/* Unit Selector */}
                  <View style={styles.unitToggleRow}>
                    <Pressable
                      onPress={() => {
                        setPlateUnit('kg');
                        setBarWeight(20);
                      }}
                      style={[styles.miniUnitBtn, plateUnit === 'kg' && styles.miniUnitActive]}>
                      <Text
                        style={[
                          styles.miniUnitText,
                          plateUnit === 'kg' && styles.miniUnitTextActive,
                        ]}>
                        KG
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPlateUnit('lbs');
                        setBarWeight(45);
                      }}
                      style={[styles.miniUnitBtn, plateUnit === 'lbs' && styles.miniUnitActive]}>
                      <Text
                        style={[
                          styles.miniUnitText,
                          plateUnit === 'lbs' && styles.miniUnitTextActive,
                        ]}>
                        LBS
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Target Weight Field */}
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>TARGET TOTAL BARBELL LOAD</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      value={plateWeightInput}
                      onChangeText={setPlateWeightInput}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      placeholder="0"
                      placeholderTextColor={Brand.textMuted}
                      style={styles.textInput}
                    />
                    <Text style={styles.unitBadge}>{plateUnit.toUpperCase()}</Text>
                  </View>

                  {/* Quick Stepper Pills */}
                  <View style={styles.steppersRow}>
                    {[-20, -10, -5, +5, +10, +20].map((delta) => (
                      <Pressable
                        key={delta}
                        onPress={() => adjustPlateWeight(delta)}
                        style={({ pressed }) => [styles.stepperPill, pressed && styles.pressed]}>
                        <Text style={styles.stepperPillText}>
                          {delta > 0 ? `+${delta}` : delta}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Bar Weight Selector */}
                <View style={styles.barWeightContainer}>
                  <Text style={styles.inputLabel}>OLYMPIC BAR WEIGHT</Text>
                  <View style={styles.barWeightOptions}>
                    <Pressable
                      onPress={() => setBarWeight(plateUnit === 'kg' ? 20 : 45)}
                      style={[
                        styles.barOptionBtn,
                        barWeight === (plateUnit === 'kg' ? 20 : 45) && styles.barOptionActive,
                      ]}>
                      <Text style={styles.barOptionTitle}>Standard Bar</Text>
                      <Text style={styles.barOptionSub}>
                        {plateUnit === 'kg' ? '20 kg (Men)' : '45 lbs'}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setBarWeight(plateUnit === 'kg' ? 15 : 35)}
                      style={[
                        styles.barOptionBtn,
                        barWeight === (plateUnit === 'kg' ? 15 : 35) && styles.barOptionActive,
                      ]}>
                      <Text style={styles.barOptionTitle}>Technique / Women</Text>
                      <Text style={styles.barOptionSub}>
                        {plateUnit === 'kg' ? '15 kg' : '35 lbs'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Sleeve Breakdown Card */}
                <View style={styles.sleeveResultBox}>
                  <Text style={styles.sleeveTag}>LOAD ON EACH SIDE</Text>
                  <Text style={styles.sleeveHeroValue}>
                    {plateCalc.weightPerSide} <Text style={styles.unitBadge}>{plateUnit}</Text>
                  </Text>

                  {/* Colored Plate Chips */}
                  <View style={styles.platesWrap}>
                    {plateCalc.plates.map(
                      (plate: { weight: number; count: number; color: string }) => (
                        <View
                          key={plate.weight}
                          style={[styles.plateDiscChip, { borderColor: plate.color }]}>
                          <View
                            style={[styles.plateDiscDot, { backgroundColor: plate.color }]}
                          />
                          <Text style={styles.plateDiscText}>
                            {plate.count} × {plate.weight} {plateUnit}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>

                  {plateCalc.remainder > 0 && (
                    <Text style={styles.remainderNotice}>
                      ⚠️ +{plateCalc.remainder} {plateUnit} remainder (no smaller microplates)
                    </Text>
                  )}
                </View>
              </Animated.View>
            )}

            {/* MODE 3: 1RM ESTIMATOR */}
            {activeMode === 'one_rm' && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="trophy-outline" size={20} color={Brand.emerald} />
                    <Text style={styles.cardTitle}>ONE-REP MAX ESTIMATOR</Text>
                  </View>

                  {/* Unit Toggle */}
                  <View style={styles.unitToggleRow}>
                    <Pressable
                      onPress={() => setOneRmUnit('kg')}
                      style={[styles.miniUnitBtn, oneRmUnit === 'kg' && styles.miniUnitActive]}>
                      <Text
                        style={[
                          styles.miniUnitText,
                          oneRmUnit === 'kg' && styles.miniUnitTextActive,
                        ]}>
                        KG
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setOneRmUnit('lbs')}
                      style={[styles.miniUnitBtn, oneRmUnit === 'lbs' && styles.miniUnitActive]}>
                      <Text
                        style={[
                          styles.miniUnitText,
                          oneRmUnit === 'lbs' && styles.miniUnitTextActive,
                        ]}>
                        LBS
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Input Fields */}
                <View style={styles.oneRmInputsRow}>
                  <View style={styles.flexOne}>
                    <Text style={styles.inputLabel}>WEIGHT LIFTED</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        value={oneRmWeight}
                        onChangeText={setOneRmWeight}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        placeholder="0"
                        placeholderTextColor={Brand.textMuted}
                        style={styles.textInput}
                      />
                      <Text style={styles.unitBadge}>{oneRmUnit.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.flexOne}>
                    <Text style={styles.inputLabel}>REPS PERFORMED</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        value={oneRmReps}
                        onChangeText={setOneRmReps}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        placeholder="1"
                        placeholderTextColor={Brand.textMuted}
                        style={styles.textInput}
                      />
                      <Text style={styles.unitBadge}>REPS</Text>
                    </View>
                  </View>
                </View>

                {/* 1RM Hero Score Box */}
                <View style={styles.oneRmHeroBox}>
                  <Text style={styles.oneRmHeroTag}>ESTIMATED 1-REP MAX</Text>
                  <Text style={styles.oneRmHeroNumber}>
                    {estimated1RM} <Text style={styles.unitBadge}>{oneRmUnit}</Text>
                  </Text>
                  <Text style={styles.oneRmHeroFormula}>Calculated via Brzycki / Epley equation</Text>

                  {/* Percentage Zones Table */}
                  <View style={styles.pctZonesTable}>
                    <View style={styles.pctZoneCol}>
                      <Text style={styles.pctZonePct}>95%</Text>
                      <Text style={styles.pctZoneReps}>1-2 Reps</Text>
                      <Text style={styles.pctZoneWeight}>
                        {Math.round(estimated1RM * 0.95)} {oneRmUnit}
                      </Text>
                    </View>

                    <View style={styles.pctZoneDivider} />

                    <View style={styles.pctZoneCol}>
                      <Text style={styles.pctZonePct}>85%</Text>
                      <Text style={styles.pctZoneReps}>5-6 Reps</Text>
                      <Text style={styles.pctZoneWeight}>
                        {Math.round(estimated1RM * 0.85)} {oneRmUnit}
                      </Text>
                    </View>

                    <View style={styles.pctZoneDivider} />

                    <View style={styles.pctZoneCol}>
                      <Text style={styles.pctZonePct}>75%</Text>
                      <Text style={styles.pctZoneReps}>8-10 Reps</Text>
                      <Text style={styles.pctZoneWeight}>
                        {Math.round(estimated1RM * 0.75)} {oneRmUnit}
                      </Text>
                    </View>

                    <View style={styles.pctZoneDivider} />

                    <View style={styles.pctZoneCol}>
                      <Text style={styles.pctZonePct}>65%</Text>
                      <Text style={styles.pctZoneReps}>12-15 Reps</Text>
                      <Text style={styles.pctZoneWeight}>
                        {Math.round(estimated1RM * 0.65)} {oneRmUnit}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}
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
  flexOne: {
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
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Brand.card,
    borderRadius: Radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  tabBtnActive: {
    backgroundColor: Brand.emerald,
  },
  tabBtnText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#050507',
    fontWeight: '800',
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardBadge: {
    color: Brand.emerald,
    fontSize: 10,
    fontWeight: '800',
  },
  inputBlock: {
    gap: 6,
  },
  inputLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitBadge: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '800',
  },
  steppersRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  stepperPill: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.xs,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepperPillText: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  equalCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  benchmarksSection: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  subHeader: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  benchmarksList: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  benchmarkLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  benchmarkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benchmarkLbs: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  benchmarkArrow: {
    color: Brand.textMuted,
    fontSize: 10,
  },
  benchmarkKg: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unitToggleRow: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  miniUnitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  miniUnitActive: {
    backgroundColor: Brand.emerald,
  },
  miniUnitText: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  miniUnitTextActive: {
    color: '#050507',
  },
  barWeightContainer: {
    gap: 6,
  },
  barWeightOptions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  barOptionBtn: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    alignItems: 'center',
    gap: 2,
  },
  barOptionActive: {
    borderColor: Brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  barOptionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  barOptionSub: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sleeveResultBox: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  sleeveTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sleeveHeroValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  platesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  plateDiscChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderWidth: 1.5,
  },
  plateDiscDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  plateDiscText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  remainderNotice: {
    color: Brand.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  oneRmInputsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  oneRmHeroBox: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 4,
  },
  oneRmHeroTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  oneRmHeroNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  oneRmHeroFormula: {
    color: Brand.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  pctZonesTable: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: Spacing.two,
  },
  pctZoneCol: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  pctZoneDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  pctZonePct: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '800',
  },
  pctZoneReps: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  pctZoneWeight: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
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
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
