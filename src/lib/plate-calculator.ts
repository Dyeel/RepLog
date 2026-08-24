import { PlateCalculation, WeightUnit } from '@/types';

export const LBS_AVAILABLE_PLATES = [
  { weight: 45, color: '#3B82F6' },
  { weight: 35, color: '#EAB308' },
  { weight: 25, color: '#10B981' },
  { weight: 10, color: '#F1F5F9' },
  { weight: 5, color: '#64748B' },
  { weight: 2.5, color: '#94A3B8' },
];

export const KG_AVAILABLE_PLATES = [
  { weight: 25, color: '#EF4444' },
  { weight: 20, color: '#3B82F6' },
  { weight: 15, color: '#EAB308' },
  { weight: 10, color: '#10B981' },
  { weight: 5, color: '#F1F5F9' },
  { weight: 2.5, color: '#64748B' },
  { weight: 1.25, color: '#94A3B8' },
];

export function calculatePlates(
  targetWeight: number | string,
  unit: WeightUnit = 'kg',
  customBarWeight?: number,
): PlateCalculation {
  const target = typeof targetWeight === 'string' ? parseFloat(targetWeight) : targetWeight;
  const barWeight = customBarWeight ?? (unit === 'kg' ? 20 : 45);

  if (isNaN(target) || target <= barWeight) {
    return {
      barWeight,
      targetWeight: isNaN(target) ? barWeight : target,
      weightPerSide: 0,
      plates: [],
      remainder: 0,
      unit,
    };
  }

  let weightNeededPerSide = (target - barWeight) / 2;
  const available = unit === 'kg' ? KG_AVAILABLE_PLATES : LBS_AVAILABLE_PLATES;
  const platesResult: { weight: number; count: number; color: string }[] = [];

  for (const plate of available) {
    if (weightNeededPerSide >= plate.weight) {
      const count = Math.floor(weightNeededPerSide / plate.weight);
      platesResult.push({
        weight: plate.weight,
        count,
        color: plate.color,
      });
      weightNeededPerSide -= count * plate.weight;
      // Handle floating precision
      weightNeededPerSide = Math.round(weightNeededPerSide * 100) / 100;
    }
  }

  return {
    barWeight,
    targetWeight: target,
    weightPerSide: (target - barWeight) / 2,
    plates: platesResult,
    remainder: weightNeededPerSide,
    unit,
  };
}
