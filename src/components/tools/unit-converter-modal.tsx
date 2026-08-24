import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { convertWeight } from '@/lib/utils';
import { WeightUnit } from '@/types';

type UnitConverterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialUnit?: WeightUnit;
};

const COMMON_BENCHMARKS = [
  { lbs: '45', kg: '20.4', label: 'Bar' },
  { lbs: '135', kg: '61.2', label: '1 Plate' },
  { lbs: '185', kg: '83.9', label: '1 Plate + 25s' },
  { lbs: '225', kg: '102.1', label: '2 Plates' },
  { lbs: '275', kg: '124.7', label: '2 Plates + 25s' },
  { lbs: '315', kg: '142.9', label: '3 Plates' },
  { lbs: '365', kg: '165.6', label: '3 Plates + 25s' },
  { lbs: '405', kg: '183.7', label: '4 Plates' },
  { lbs: '495', kg: '224.5', label: '5 Plates' },
];

export function UnitConverterModal({ visible, onClose }: UnitConverterModalProps) {
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

  const applyBenchmark = (item: { lbs: string; kg: string }) => {
    setKgVal(item.kg);
    setLbsVal(item.lbs);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.avoidingContainer}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <MaterialCommunityIcons name="swap-horizontal" size={22} color={Brand.emerald} />
                  <Text style={styles.title}>KG ⇄ LBS CALCULATOR</Text>
                </View>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <MaterialCommunityIcons name="close" size={20} color={Brand.textMuted} />
                </Pressable>
              </View>

              {/* Dual Live Converter Inputs */}
              <View style={styles.converterSection}>
                {/* KG Field */}
                <View style={styles.inputCol}>
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
                    <Text style={styles.unitTag}>KG</Text>
                  </View>
                </View>

                <View style={styles.equalCircle}>
                  <MaterialCommunityIcons name="equal" size={18} color={Brand.emerald} />
                </View>

                {/* LBS Field */}
                <View style={styles.inputCol}>
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
                    <Text style={styles.unitTag}>LBS</Text>
                  </View>
                </View>
              </View>

          {/* Reference Table / Common Barbell Benchmarks */}
          <View style={styles.benchmarksHeader}>
            <Text style={styles.benchmarksTitle}>COMMON BARBELL BENCHMARKS</Text>
          </View>

          <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.table}>
              {COMMON_BENCHMARKS.map((item) => (
                <Pressable
                  key={item.lbs}
                  onPress={() => applyBenchmark(item)}
                  style={({ pressed }) => [styles.tableRow, pressed && styles.rowPressed]}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={styles.rowValues}>
                    <Text style={styles.rowLbs}>{item.lbs} lbs</Text>
                    <Text style={styles.rowArrow}>⇄</Text>
                    <Text style={styles.rowKg}>{item.kg} kg</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Close Button */}
          <Pressable onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  </TouchableWithoutFeedback>
</Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  avoidingContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  modalCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: 4,
  },
  converterSection: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  inputCol: {
    width: '100%',
    gap: 4,
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
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitTag: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '800',
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
  benchmarksHeader: {
    paddingTop: Spacing.one,
  },
  benchmarksTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tableScroll: {
    maxHeight: 180,
  },
  table: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  rowLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLbs: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rowArrow: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  rowKg: {
    color: Brand.emerald,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  doneBtn: {
    backgroundColor: Brand.emerald,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '800',
  },
});
