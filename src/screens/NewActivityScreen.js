import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet} from 'react-native';
import CustomButton from '../components/CustomButton';
import useActivityStore from '../store/useActivityStore';
import {DAY_LABELS} from '../utils/date';
import {colors, radius} from '../theme';

const DURATION_PRESETS = [
  {label: '15 min', value: 15},
  {label: '25 min', value: 25},
  {label: '30 min', value: 30},
  {label: '60 min', value: 60},
];

export default function NewActivityScreen({navigation}) {
  const addActivity = useActivityStore(s => s.addActivity);

  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [evidence, setEvidence] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const toggleDay = i => setDays(d => (d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort()));

  const selectPreset = val => {
    setIsCustom(false);
    setCustomDuration('');
    setDurationMinutes(val);
  };

  const selectCustom = () => {
    setIsCustom(true);
    setDurationMinutes(customDuration ? parseInt(customDuration, 10) || 0 : 0);
  };

  const onCustomChange = t => {
    const num = t.replace(/[^0-9]/g, '');
    setCustomDuration(num);
    setDurationMinutes(parseInt(num, 10) || 0);
  };

  // Calcular descanso según reglas exactas
  const getBreakInfo = mins => {
    if (mins < 20) return {break: 0, label: 'Sin descanso · Sin recompensa'};
    if (mins <= 60) return {break: 5, label: '5 min de descanso por ciclo · Con recompensa'};
    return {break: 10, label: '10 min de descanso por ciclo · Con recompensa'};
  };

  // Calcular ciclos
  const getCycleInfo = mins => {
    if (mins <= 25) return `1 ciclo de ${mins} min`;
    const cycles = Math.ceil(mins / 25);
    const lastCycle = mins % 25 || 25;
    return `${cycles} ciclos (bloques de 25 min${lastCycle !== 25 ? `, último de ${lastCycle} min` : ''})`;
  };

  const save = () => {
    if (!name.trim()) return Alert.alert('Falta el nombre', 'Escribe el nombre de la meta.');
    if (days.length === 0) return Alert.alert('Falta el día', 'Selecciona al menos un día.');
    if (!durationMinutes || durationMinutes < 1) return Alert.alert('Duración inválida', 'Elige o escribe una duración de al menos 1 minuto.');

    addActivity({
      id: Date.now().toString(),
      name: name.trim(),
      durationMinutes,
      days,
      evidence: evidence.trim(),
      createdAt: Date.now(),
    });
    navigation.goBack();
  };

  const breakInfo = getBreakInfo(durationMinutes);
  const cycleInfo = durationMinutes >= 1 ? getCycleInfo(durationMinutes) : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: 16}} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre de la meta</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Estudiar cálculo"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Duración</Text>
      <View style={styles.presetRow}>
        {DURATION_PRESETS.map(p => (
          <Pressable
            key={p.value}
            style={[styles.chip, !isCustom && durationMinutes === p.value && styles.chipOn]}
            onPress={() => selectPreset(p.value)}>
            <Text style={[styles.chipText, !isCustom && durationMinutes === p.value && styles.chipTextOn]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.chip, isCustom && styles.chipOn]}
          onPress={selectCustom}>
          <Text style={[styles.chipText, isCustom && styles.chipTextOn]}>Personalizar</Text>
        </Pressable>
      </View>

      {isCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={[styles.input, styles.customInput]}
            value={customDuration}
            onChangeText={onCustomChange}
            keyboardType="number-pad"
            placeholder="Ej. 45"
            placeholderTextColor={colors.muted}
            autoFocus
          />
          <Text style={styles.customLabel}>minutos</Text>
        </View>
      )}

      {durationMinutes >= 1 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}> {cycleInfo}</Text>
          <Text style={styles.infoText}> {breakInfo.label}</Text>
        </View>
      )}

      <Text style={styles.label}>Días</Text>
      <View style={styles.row}>
        {DAY_LABELS.map((l, i) => (
          <Pressable key={i} onPress={() => toggleDay(i)} style={[styles.dayChip, days.includes(i) && styles.dayChipOn]}>
            <Text style={[styles.dayText, days.includes(i) && {color: '#1A1200'}]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Descripción de la evidencia (opcional)</Text>
      <TextInput
        style={[styles.input, {height: 90, textAlignVertical: 'top'}]}
        value={evidence}
        onChangeText={setEvidence}
        multiline
        placeholder="Ej. Foto de mis apuntes o ejercicios resueltos"
        placeholderTextColor={colors.muted}
      />

      <CustomButton title="Guardar meta" icon="content-save" variant="accent" onPress={save} style={{marginTop: 24}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  label: {color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 8, textTransform: 'uppercase'},
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, padding: 14,
    fontSize: 16, borderWidth: 1, borderColor: colors.border,
  },
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  presetRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  chipOn: {backgroundColor: colors.accent, borderColor: colors.accent},
  chipText: {color: colors.muted, fontWeight: '700', fontSize: 14},
  chipTextOn: {color: '#1A1200'},
  customRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  customInput: {flex: 1},
  customLabel: {color: colors.text, fontSize: 16, fontWeight: '700', marginLeft: 8},
  infoBox: {
    backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: 12,
    marginTop: 10, borderWidth: 1, borderColor: colors.border,
  },
  infoText: {color: colors.muted, fontSize: 13, marginTop: 2, fontWeight: '500'},
  dayChip: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  dayChipOn: {backgroundColor: colors.accent, borderColor: colors.accent},
  dayText: {color: colors.text, fontWeight: '700'},
});
