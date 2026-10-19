import React, {useMemo} from 'react';
import {View, Text, ScrollView, Dimensions, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BarChart} from 'react-native-chart-kit';
import StatCard from '../components/StatCard';
import useUserStore from '../store/useUserStore';
import {lastNDays} from '../utils/date';
import {colors, radius} from '../theme';

const width = Dimensions.get('window').width - 32;

export default function StatsScreen() {
  const focusLog = useUserStore(s => s.focusLog);
  const streakDays = useUserStore(s => s.streakDays);
  const focusHours = useUserStore(s => s.focusHours);
  const points = useUserStore(s => s.points);

  const week = useMemo(() => lastNDays(7).map(d => ({...d, minutes: focusLog[d.key] || 0})), [focusLog]);
  const weekTotal = week.reduce((a, d) => a + d.minutes, 0);
  const best = Math.max(...week.map(d => d.minutes));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{padding: 16}}>
        <Text style={styles.title}>Tu Rendimiento</Text>

        <View style={styles.row}>
          <StatCard icon="fire" label="Racha (días)" value={streakDays} color="#FF7A2F" />
          <View style={{width: 10}} />
          <StatCard icon="clock-check-outline" label="Horas libres" value={focusHours.toFixed(1)} color={colors.success} />
          <View style={{width: 10}} />
          <StatCard icon="star-circle" label="Puntos" value={points} color={colors.accent} />
        </View>

        <Text style={styles.section}>Minutos enfocados · últimos 7 días</Text>
        <View style={styles.chartBox}>
          <BarChart
            data={{labels: week.map(d => d.label), datasets: [{data: week.map(d => d.minutes)}]}}
            width={width - 16}
            height={220}
            yAxisLabel=""
            yAxisSuffix="m"
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (o = 1) => `rgba(124, 92, 255, ${o})`,
              labelColor: () => colors.muted,
              barPercentage: 0.6,
            }}
            style={{borderRadius: radius.md}}
          />
        </View>

        <View style={styles.row}>
          <StatCard icon="calendar-week" label="Total semana (min)" value={weekTotal} />
          <View style={{width: 10}} />
          <StatCard icon="trophy-outline" label="Mejor día (min)" value={best} color={colors.accent} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  title: {color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16},
  row: {flexDirection: 'row'},
  section: {color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 22, marginBottom: 10},
  chartBox: {backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 8, alignItems: 'center', marginBottom: 16},
});
