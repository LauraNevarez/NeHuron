import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '../components/CustomButton';
import useActivityStore from '../store/useActivityStore';
import {DAY_LABELS, toHHMM} from '../utils/date';
import {colors, radius} from '../theme';

const atTime = (h, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function NewActivityScreen({navigation}) {
  const addActivity = useActivityStore(s => s.addActivity);

  const [name, setName] = useState('');
  const [start, setStart] = useState(atTime(9));
  const [end, setEnd] = useState(atTime(10));
  const [picker, setPicker] = useState(null); // 'start' | 'end' | null
  const [days, setDays] = useState([]);
  const [evidence, setEvidence] = useState('');
  const [grace, setGrace] = useState('5');

  const toggleDay = i => setDays(d => (d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort()));

  const onPick = (event, date) => {
    const which = picker;
    setPicker(null); // en Android el picker se cierra solo
    if (event.type !== 'set' || !date) return;
    which === 'start' ? setStart(date) : setEnd(date);
  };

  const save = () => {
    if (!name.trim()) return Alert.alert('Falta el nombre', 'Escribe el nombre de la actividad.');
    if (days.length === 0) return Alert.alert('Falta el día', 'Selecciona al menos un día.');
    if (toHHMM(end) <= toHHMM(start)) return Alert.alert('Horario inválido', 'La hora fin debe ser posterior al inicio.');

    addActivity({
      id: Date.now().toString(),
      name: name.trim(),
      startTime: toHHMM(start),
      endTime: toHHMM(end),
      days,
      evidence: evidence.trim(),
      graceMinutes: Math.max(0, parseInt(grace, 10) || 0),
      createdAt: Date.now(),
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: 16}} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre de la actividad</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Estudiar cálculo"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Horario</Text>
      <View style={styles.row}>
        <Pressable style={[styles.input, styles.timeBox]} onPress={() => setPicker('start')}>
          <Text style={styles.timeLabel}>Inicio</Text>
          <Text style={styles.time}>{toHHMM(start)}</Text>
        </Pressable>
        <View style={{width: 12}} />
        <Pressable style={[styles.input, styles.timeBox]} onPress={() => setPicker('end')}>
          <Text style={styles.timeLabel}>Fin</Text>
          <Text style={styles.time}>{toHHMM(end)}</Text>
        </Pressable>
      </View>
      {picker && (
        <DateTimePicker
          value={picker === 'start' ? start : end}
          mode="time"
          is24Hour
          display="default"
          onChange={onPick}
        />
      )}

      <Text style={styles.label}>Días</Text>
      <View style={styles.row}>
        {DAY_LABELS.map((l, i) => (
          <Pressable key={i} onPress={() => toggleDay(i)} style={[styles.dayChip, days.includes(i) && styles.dayChipOn]}>
            <Text style={[styles.dayText, days.includes(i) && {color: '#1A1200'}]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Descripción de la evidencia</Text>
      <TextInput
        style={[styles.input, {height: 90, textAlignVertical: 'top'}]}
        value={evidence}
        onChangeText={setEvidence}
        multiline
        placeholder="Ej. Foto de mis apuntes terminados"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Minutos de gracia</Text>
      <TextInput
        style={styles.input}
        value={grace}
        onChangeText={t => setGrace(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="5"
        placeholderTextColor={colors.muted}
      />

      <CustomButton title="Guardar actividad" icon="content-save" variant="accent" onPress={save} style={{marginTop: 24}} />
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
  timeBox: {flex: 1},
  timeLabel: {color: colors.muted, fontSize: 12},
  time: {color: colors.text, fontSize: 24, fontWeight: '800'},
  dayChip: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  dayChipOn: {backgroundColor: colors.accent, borderColor: colors.accent},
  dayText: {color: colors.text, fontWeight: '700'},
});
