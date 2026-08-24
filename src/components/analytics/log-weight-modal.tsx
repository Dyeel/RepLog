import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { convertWeight, toDateKey } from '@/lib/utils';
import { WeightUnit } from '@/types';

type LogWeightModalProps = {
  visible: boolean;
  unit: WeightUnit;
  onClose: () => void;
};

export function LogWeightModal({ visible, unit: defaultUnit, onClose }: LogWeightModalProps) {
  const { addBodyWeightLog } = useWorkoutStore();
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>(defaultUnit);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUnitToggle = (nextUnit: WeightUnit) => {
    if (nextUnit === selectedUnit) return;
    if (weight && !isNaN(parseFloat(weight))) {
      const converted = convertWeight(weight, selectedUnit, nextUnit);
      setWeight(converted);
    }
    setSelectedUnit(nextUnit);
  };

  const handleSave = async () => {
    const num = parseFloat(weight);
    if (isNaN(num) || num <= 0) return;

    setSaving(true);
    Keyboard.dismiss();
    try {
      await addBodyWeightLog(num, toDateKey(new Date().toISOString()), note, selectedUnit);
      setWeight('');
      setNote('');
      onClose();
    } finally {
      setSaving(false);
    }
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
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={Brand.emerald} />
                  <Text style={styles.title}>LOG BODY WEIGHT</Text>
                </View>

                <View style={styles.headerRight}>
                  {/* Unit Switcher (KG / LBS) */}
                  <View style={styles.unitToggleContainer}>
                    <Pressable
                      onPress={() => handleUnitToggle('kg')}
                      style={[
                        styles.unitToggleBtn,
                        selectedUnit === 'kg' && styles.unitToggleActive,
                      ]}>
                      <Text
                        style={[
                          styles.unitToggleText,
                          selectedUnit === 'kg' && styles.unitToggleTextActive,
                        ]}>
                        KG
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleUnitToggle('lbs')}
                      style={[
                        styles.unitToggleBtn,
                        selectedUnit === 'lbs' && styles.unitToggleActive,
                      ]}>
                      <Text
                        style={[
                          styles.unitToggleText,
                          selectedUnit === 'lbs' && styles.unitToggleTextActive,
                        ]}>
                        LBS
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable onPress={onClose} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={20} color={Brand.textMuted} />
                  </Pressable>
                </View>
              </View>

              {/* Weight Input Field */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputLabel}>TODAY&apos;S SCALE WEIGH-IN</Text>
                  <Pressable onPress={Keyboard.dismiss} style={styles.doneDismissBtn}>
                    <MaterialCommunityIcons name="keyboard-close" size={16} color={Brand.textMuted} />
                    <Text style={styles.doneDismissText}>Done</Text>
                  </Pressable>
                </View>

                <View style={styles.inputBox}>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="0.0"
                    placeholderTextColor={Brand.textMuted}
                    autoFocus
                    style={styles.textInput}
                  />
                  <Text style={styles.unitTag}>{selectedUnit.toUpperCase()}</Text>
                </View>
              </View>

              {/* Optional Notes */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>NOTE (OPTIONAL)</Text>
                <View style={[styles.inputBox, styles.noteBox]}>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Morning fasting, post-workout..."
                    placeholderTextColor={Brand.textMuted}
                    style={styles.noteInput}
                  />
                </View>
              </View>

              {/* Save CTA */}
              <Pressable
                onPress={handleSave}
                disabled={saving || !weight}
                style={({ pressed }) => [
                  styles.saveBtn,
                  (!weight || saving) && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : `Save Weigh-In (${selectedUnit.toUpperCase()})`}
                </Text>
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
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    width: '100%',
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  unitToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  unitToggleActive: {
    backgroundColor: Brand.emerald,
  },
  unitToggleText: {
    color: Brand.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  unitToggleTextActive: {
    color: '#050507',
  },
  closeBtn: {
    padding: 4,
  },
  inputSection: {
    gap: 4,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  doneDismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    backgroundColor: Brand.cardElevated,
  },
  doneDismissText: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
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
  noteBox: {
    height: 42,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  noteInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  unitTag: {
    color: Brand.emerald,
    fontSize: 13,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: Brand.emerald,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});
