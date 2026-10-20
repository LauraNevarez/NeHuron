import React, {useState} from 'react';
import {View, Text, Pressable, FlatList, Image, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AvatarView from '../components/AvatarView';
import useUserStore from '../store/useUserStore';
import {SHOP_ITEMS} from '../data/shopItems';
import {colors, radius} from '../theme';

const TABS = [
  {key: 'hat', label: 'Sombreros'},
  {key: 'glasses', label: 'Lentes'},
];

export default function ClosetScreen() {
  const points = useUserStore(s => s.points);
  const unlockedItems = useUserStore(s => s.unlockedItems);
  const equippedHat = useUserStore(s => s.equippedHat);
  const equippedGlasses = useUserStore(s => s.equippedGlasses);
  const purchaseOrToggle = useUserStore(s => s.purchaseOrToggle);
  const [tab, setTab] = useState('hat');

  const onPressItem = item => {
    const owned = unlockedItems.includes(item.id);

    if (owned) {
      purchaseOrToggle(item); // equipa / desequipa
      return;
    }
    // No comprado: verificar points >= price
    if (points < item.price) {
      Alert.alert('Puntos insuficientes', `Te faltan ${item.price - points} puntos para "${item.name}".`);
      return;
    }
    Alert.alert('Comprar', `¿Comprar "${item.name}" por ${item.price} puntos?`, [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Comprar', onPress: () => purchaseOrToggle(item)}, // descuenta, desbloquea y equipa
    ]);
  };

  const data = SHOP_ITEMS.filter(i => i.category === tab);

  const renderItem = ({item}) => {
    const owned = unlockedItems.includes(item.id);
    const equipped = equippedHat === item.id || equippedGlasses === item.id;
    return (
      <Pressable style={[styles.item, equipped && styles.itemOn]} onPress={() => onPressItem(item)}>
        <Image source={item.image} style={styles.itemImg} resizeMode="contain" fadeDuration={0} />
        <Text style={styles.itemName}>{item.name}</Text>
        {equipped ? (
          <Text style={[styles.tag, {color: colors.success}]}>Equipado</Text>
        ) : owned ? (
          <Text style={[styles.tag, {color: colors.muted}]}>Equipar</Text>
        ) : (
          <Text style={[styles.tag, {color: points >= item.price ? colors.accent : colors.danger}]}>
            🪙 {item.price}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Armario</Text>
        <View style={styles.points}>
          <Icon name="star-circle" size={18} color={colors.accent} />
          <Text style={styles.pointsText}> {points}</Text>
        </View>
      </View>

      <View style={styles.avatarBox}>
        <AvatarView size={230} hatId={equippedHat} glassesId={equippedGlasses} />
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t.key && {color: '#1A1200'}]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
          data={data}
          numColumns={3}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews={false}
          contentContainerStyle={{padding: 12}}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16},
  title: {color: colors.text, fontSize: 24, fontWeight: '800'},
  points: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20},
  pointsText: {color: colors.text, fontWeight: '700'},
  avatarBox: {alignItems: 'center', backgroundColor: colors.card, marginHorizontal: 16, borderRadius: radius.lg, paddingVertical: 8},
  tabs: {flexDirection: 'row', marginHorizontal: 16, marginTop: 16},
  tab: {flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, marginRight: 8},
  tabOn: {backgroundColor: colors.accent},
  tabText: {color: colors.text, fontWeight: '700'},
  item: {
    width: '31%', margin: '1.1%', backgroundColor: colors.card, borderRadius: radius.md, padding: 8,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  itemOn: {borderColor: colors.success},
  itemImg: {width: 70, height: 70, backgroundColor: colors.cardAlt, borderRadius: radius.sm},
  itemName: {color: colors.text, fontSize: 12, fontWeight: '600', marginTop: 4},
  tag: {fontSize: 12, fontWeight: '700', marginTop: 2},
});
