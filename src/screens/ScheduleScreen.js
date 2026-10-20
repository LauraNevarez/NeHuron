import React, {useState} from 'react';
import {View, Text, Pressable, FlatList, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActivityCard from '../components/ActivityCard';
import useActivityStore from '../store/useActivityStore';
import {DAY_LABELS, DAY_NAMES, todayIndex, toMinutes} from '../utils/date';
import {colors} from '../theme';

export default function ScheduleScreen({navigation}) {
  const activities = useActivityStore(s => s.activities);
  const removeActivity = useActivityStore(s => s.removeActivity);
  const [day, setDay] = useState(todayIndex());

  const list = activities
    .filter(a => a.days.includes(day))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const confirmDelete = a =>
    Alert.alert('Eliminar', `¿Eliminar "${a.name}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: () => removeActivity(a.id)},
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Mi Horario</Text>
      <View style={styles.days}>
        {DAY_LABELS.map((l, i) => (
          <Pressable key={i} onPress={() => setDay(i)} style={[styles.chip, day === i && styles.chipOn]}>
            <Text style={[styles.chipText, day === i && {color: '#1A1200'}]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.dayName}>{DAY_NAMES[day]}</Text>

      <FlatList
        data={list}
        keyExtractor={a => a.id}
        contentContainerStyle={{padding: 16, paddingBottom: 100}}
        ListEmptyComponent={<Text style={styles.empty}>No hay actividades este día.</Text>}
        renderItem={({item}) => (
          <ActivityCard activity={item} onDelete={confirmDelete} />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('NewActivity')}>
        <Icon name="plus" size={30} color="#1A1200" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  title: {color: colors.text, fontSize: 24, fontWeight: '800', padding: 16, paddingBottom: 8},
  days: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16},
  chip: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  chipOn: {backgroundColor: colors.accent, borderColor: colors.accent},
  chipText: {color: colors.text, fontWeight: '700'},
  dayName: {color: colors.muted, marginHorizontal: 16, marginTop: 14, fontWeight: '600'},
  empty: {color: colors.muted, textAlign: 'center', marginTop: 40},
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
});
