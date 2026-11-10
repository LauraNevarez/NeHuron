import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius} from '../theme';
import {DAY_LABELS} from '../utils/date';

export default function ActivityCard({activity, onDelete, highlight}) {
  const durationLabel = activity.durationMinutes
    ? `${activity.durationMinutes} min`
    : activity.startTime && activity.endTime
      ? `${activity.startTime} – ${activity.endTime}`
      : null;

  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{activity.name}</Text>
        {durationLabel && (
          <View style={styles.row}>
            <Icon name="timer-outline" size={14} color={colors.primary} />
            <Text style={styles.meta}> {durationLabel}</Text>
          </View>
        )}
        <View style={styles.daysRow}>
          {DAY_LABELS.map((l, i) => (
            <Text key={i} style={[styles.day, activity.days && activity.days.includes(i) && styles.dayOn]}>
              {l}
            </Text>
          ))}
        </View>
        {!!activity.evidence && (
          <Text style={styles.evidence} numberOfLines={1}>📎 {activity.evidence}</Text>
        )}
      </View>
      {onDelete && (
        <View style={styles.actions}>
          <Pressable onPress={() => onDelete(activity)} hitSlop={8}>
            <Icon name="trash-can-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlight: {borderColor: colors.primary, backgroundColor: colors.cardAlt},
  info: {flex: 1},
  name: {color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4},
  row: {flexDirection: 'row', alignItems: 'center'},
  meta: {color: colors.text, fontSize: 13, fontWeight: '600'},
  daysRow: {flexDirection: 'row', marginTop: 8},
  day: {color: colors.muted, fontSize: 12, marginRight: 8, fontWeight: '600'},
  dayOn: {color: colors.accent, fontWeight: '800'},
  evidence: {color: colors.muted, fontSize: 12, marginTop: 4},
  actions: {alignItems: 'center', justifyContent: 'center', marginLeft: 8},
});
