import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius} from '../theme';
import {DAY_LABELS} from '../utils/date';

export default function ActivityCard({activity, onPlay, onDelete, highlight}) {
  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{activity.name}</Text>
        <View style={styles.row}>
          <Icon name="clock-outline" size={14} color={colors.muted} />
          <Text style={styles.meta}> {activity.startTime} – {activity.endTime}</Text>
        </View>
        <View style={styles.daysRow}>
          {DAY_LABELS.map((l, i) => (
            <Text key={i} style={[styles.day, activity.days.includes(i) && styles.dayOn]}>{l}</Text>
          ))}
        </View>
        {!!activity.evidence && (
          <Text style={styles.evidence} numberOfLines={1}>📎 {activity.evidence}</Text>
        )}
        {activity.graceMinutes > 0 && (
          <Text style={styles.evidence}>⏱ {activity.graceMinutes} min de gracia</Text>
        )}
      </View>
      <View style={styles.actions}>
        {onPlay && (
          <Pressable onPress={() => onPlay(activity)} style={styles.play} hitSlop={8}>
            <Icon name="play" size={26} color="#1A1200" />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={() => onDelete(activity)} hitSlop={8} style={{marginTop: 10}}>
            <Icon name="trash-can-outline" size={22} color={colors.danger} />
          </Pressable>
        )}
      </View>
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
  meta: {color: colors.muted, fontSize: 13},
  daysRow: {flexDirection: 'row', marginTop: 8},
  day: {color: colors.muted, fontSize: 12, marginRight: 8, fontWeight: '600'},
  dayOn: {color: colors.accent},
  evidence: {color: colors.muted, fontSize: 12, marginTop: 4},
  actions: {alignItems: 'center', justifyContent: 'center', marginLeft: 8},
  play: {
    backgroundColor: colors.accent,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
