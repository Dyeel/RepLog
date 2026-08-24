import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { toDateKey } from '@/lib/utils';
import { WeightUnit } from '@/types';

type LogWeightModalProps = {
  visible: boolean;
  unit: WeightUnit;
  onClose: () => void;
};

export function LogWeightModal({ visible, unit, onClose }: LogWeightModalProps) {
  const { addBodyWeightLog } = useWorkoutStore();
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(weight);
    if (isNaN(num) || num <= 0) return;

    setSaving(true);
    try {
      await addBodyWeightLog(num, toDateKey(new Date().toISOString()), note);
      setWeight('');
      setNote('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="scale-bathroom" size={20} color={Brand.emerald} />
              <Text style={styles.title}>LOG BODY WEIGHT</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={Brand.textMuted} />
            </Pressable>
          </View>

          {/* Weight Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>TODAY&apos;S BODY WEIGHT</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={Brand.textMuted}
                autoFocus
                style={styles.textInput}
              />
              <Text style={styles.unitTag}>{unit.toUpperCase()}</Text>
            </View>
          </View>

          {/* Notes Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>NOTE (OPTIONAL)</Text>
            <View style={[styles.inputBox, styles.noteBox]}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Morning fasting, post-workout..."
                placeholderTextColor={Brand.textMuted}
                style={styles.noteInput}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving || !weight}
            style={({ pressed }) => [
              styles.saveBtn,
              (!weight || saving) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Weight Entry'}</Text>
          </Pressable>
        </View>
      </View>
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
  modalCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    width: '100%',
    maxWidth: 400,
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
  closeBtn: {
    padding: 4,
  },
  inputSection: {
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
    fontSize: 14,
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
