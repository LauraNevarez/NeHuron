import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import AvatarView from '../components/AvatarView';
import useUserStore from '../store/useUserStore';
import {colors} from '../theme';

const PAGES = [
  {icon: 'brain', title: 'Vence la procrastinación', text: 'Bloquea las apps que te distraen y recupera tu atención.'},
  {icon: 'calendar-check', title: 'Planea tus metas', text: 'Crea actividades con horario, evidencia y minutos de gracia.'},
  {icon: 'star-circle', title: 'Gana recompensas', text: 'Cada minuto de enfoque te da puntos para vestir a Avy.'},
];

export default function OnboardingScreen({navigation}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const setUserName = useUserStore(s => s.setUserName);
  const completeOnboarding = useUserStore(s => s.completeOnboarding);
  const isLast = step === PAGES.length;

  const next = () => {
    if (!isLast) return setStep(step + 1);
    setUserName(name.trim() || 'Amigo');
    completeOnboarding();
    navigation.replace('Permissions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {!isLast ? (
          <>
            <Icon name={PAGES[step].icon} size={96} color={colors.accent} />
            <Text style={styles.title}>{PAGES[step].title}</Text>
            <Text style={styles.text}>{PAGES[step].text}</Text>
          </>
        ) : (
          <>
            <AvatarView size={200} />
            <Text style={styles.title}>Soy Avy, ¿cómo te llamas?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </>
        )}
      </View>

      <View style={styles.dots}>
        {[...Array(PAGES.length + 1)].map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
        ))}
      </View>
      <CustomButton title={isLast ? 'Comenzar' : 'Siguiente'} onPress={next} variant="accent" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg, padding: 24},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 24},
  text: {color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 12, paddingHorizontal: 16},
  input: {
    width: '100%', marginTop: 20, backgroundColor: colors.card, color: colors.text,
    borderRadius: 14, padding: 14, fontSize: 18, borderWidth: 1, borderColor: colors.border,
  },
  dots: {flexDirection: 'row', justifyContent: 'center', marginBottom: 20},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4},
  dotOn: {backgroundColor: colors.accent, width: 22},
});
