import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Modal,
  Alert,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import useEvidenceStore from '../store/useEvidenceStore';
import useActivityStore from '../store/useActivityStore';
import BlockerNative from '../modules/BlockerNativeModule';
import {colors, radius} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function EvidencesScreen({navigation, route}) {
  const evidences = useEvidenceStore(s => s.evidences);
  const addEvidence = useEvidenceStore(s => s.addEvidence);
  const removeEvidence = useEvidenceStore(s => s.removeEvidence);
  const activities = useActivityStore(s => s.activities);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Formulario para nueva evidencia
  const [selectedGoalName, setSelectedGoalName] = useState('Enfoque Libre');
  const [noteText, setNoteText] = useState('');
  const [pickedImageUri, setPickedImageUri] = useState(null);

  useEffect(() => {
    if (route?.params?.autoPickForGoal) {
      const goal = route.params.autoPickForGoal;
      setSelectedFolder(goal);
      setSelectedGoalName(goal);
      setIsAddModalOpen(true);
      (async () => {
        try {
          const uri = await BlockerNative.pickImage();
          if (uri) setPickedImageUri(uri);
        } catch (_e) {}
      })();
    }
  }, [route?.params?.autoPickForGoal]);

  // Agrupar evidencias por carpeta / meta
  const folders = useMemo(() => {
    const map = {};
    evidences.forEach(e => {
      const name = e.goalName || 'Enfoque Libre';
      if (!map[name]) {
        map[name] = [];
      }
      map[name].push(e);
    });
    return Object.keys(map).map(goalName => ({
      name: goalName,
      items: map[goalName],
      count: map[goalName].length,
      coverUri: map[goalName][0]?.imageUri || null,
    }));
  }, [evidences]);

  const folderItems = useMemo(() => {
    if (!selectedFolder) return [];
    return evidences.filter(e => (e.goalName || 'Enfoque Libre') === selectedFolder);
  }, [evidences, selectedFolder]);

  // Selección de foto con módulo nativo
  const handlePickPhoto = async () => {
    try {
      const uri = await BlockerNative.pickImage();
      if (uri) {
        setPickedImageUri(uri);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo seleccionar la foto.');
    }
  };

  const handleSaveEvidence = () => {
    if (!pickedImageUri) {
      Alert.alert('Falta la foto', 'Por favor selecciona la foto de tus apuntes.');
      return;
    }

    addEvidence({
      goalName: selectedGoalName,
      imageUri: pickedImageUri,
      note: noteText,
    });

    setPickedImageUri(null);
    setNoteText('');
    setIsAddModalOpen(false);
  };

  const confirmDelete = item => {
    Alert.alert('Eliminar apunte', '¿Seguro que deseas eliminar esta evidencia?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: () => removeEvidence(item.id)},
    ]);
  };

  const formatDate = ts => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} · ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {selectedFolder ? (
          <Pressable
            style={styles.backBtn}
            onPress={() => setSelectedFolder(null)}
            hitSlop={8}>
            <Icon name="arrow-left" size={26} color={colors.text} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedFolder}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{marginRight: 10}}>
              <Icon name="arrow-left" size={26} color={colors.text} />
            </Pressable>
            <View style={{flex: 1}}>
              <Text style={styles.title}>Mis Evidencias</Text>
              <Text style={styles.subtitle}>
                {folders.length} {folders.length === 1 ? 'carpeta' : 'carpetas'} · {evidences.length} apuntes
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Vista de Carpetas */}
      {!selectedFolder ? (
        <FlatList
          data={folders}
          keyExtractor={f => f.name}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-multiple-image" size={64} color={colors.muted} />
              <Text style={styles.emptyTitle}>Aún no tienes evidencias</Text>
              <Text style={styles.emptySub}>
                Al terminar tus metas o sesiones de enfoque, sube fotos de tus apuntes para repasarlos cuando quieras.
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <Pressable style={styles.folderCard} onPress={() => setSelectedFolder(item.name)}>
              {item.coverUri ? (
                <Image source={{uri: item.coverUri}} style={styles.folderThumb} resizeMode="cover" />
              ) : (
                <View style={styles.folderThumbEmpty}>
                  <Icon name="folder-outline" size={40} color={colors.primary} />
                </View>
              )}
              <View style={styles.folderMeta}>
                <Text style={styles.folderName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.folderCount}>
                  {item.count} {item.count === 1 ? 'apunte' : 'apuntes'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        /* Vista de Contenido dentro de una Carpeta */
        <FlatList
          data={folderItems}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Carpeta vacía</Text>
            </View>
          }
          renderItem={({item}) => (
            <View style={styles.evidenceItem}>
              <Pressable onPress={() => setFullscreenImage(item)}>
                <Image source={{uri: item.imageUri}} style={styles.evidenceThumb} resizeMode="cover" />
                <View style={styles.zoomPill}>
                  <Icon name="magnify" size={14} color="#FFFFFF" />
                  <Text style={styles.zoomText}>Ver</Text>
                </View>
              </Pressable>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceDate}>{formatDate(item.createdAt)}</Text>
                {!!item.note && (
                  <Text style={styles.evidenceNote} numberOfLines={2}>
                    {item.note}
                  </Text>
                )}
                <Pressable
                  style={styles.trashBtn}
                  onPress={() => confirmDelete(item)}
                  hitSlop={8}>
                  <Icon name="trash-can-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Botón flotante para subir evidencia */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          setSelectedGoalName(selectedFolder || 'Enfoque Libre');
          setIsAddModalOpen(true);
        }}>
        <Icon name="camera-plus" size={26} color="#1A1200" />
      </Pressable>

      {/* Modal Pantalla Completa para revisar apuntes */}
      <Modal
        visible={!!fullscreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}>
        <View style={styles.modalFull}>
          <Pressable style={styles.modalCloseBtn} onPress={() => setFullscreenImage(null)}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {fullscreenImage && (
            <Image
              source={{uri: fullscreenImage.imageUri}}
              style={styles.fullscreenImg}
              resizeMode="contain"
            />
          )}
          {fullscreenImage?.note ? (
            <View style={styles.modalNoteBox}>
              <Text style={styles.modalNoteText}>{fullscreenImage.note}</Text>
            </View>
          ) : null}
        </View>
      </Modal>

      {/* Modal para Subir Nueva Evidencia */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Guardar Evidencia</Text>
              <Pressable onPress={() => setIsAddModalOpen(false)} hitSlop={8}>
                <Icon name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Carpeta / Meta:</Text>
            <View style={styles.goalChipsRow}>
              <Pressable
                style={[
                  styles.goalChip,
                  selectedGoalName === 'Enfoque Libre' && styles.goalChipOn,
                ]}
                onPress={() => setSelectedGoalName('Enfoque Libre')}>
                <Text
                  style={[
                    styles.goalChipText,
                    selectedGoalName === 'Enfoque Libre' && styles.goalChipTextOn,
                  ]}>
                  Enfoque Libre
                </Text>
              </Pressable>
              {activities.map(a => (
                <Pressable
                  key={a.id}
                  style={[styles.goalChip, selectedGoalName === a.name && styles.goalChipOn]}
                  onPress={() => setSelectedGoalName(a.name)}>
                  <Text
                    style={[
                      styles.goalChipText,
                      selectedGoalName === a.name && styles.goalChipTextOn,
                    ]}>
                    {a.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Foto de los apuntes */}
            <Text style={styles.fieldLabel}>Foto de tus apuntes:</Text>
            {pickedImageUri ? (
              <View style={styles.previewBox}>
                <Image source={{uri: pickedImageUri}} style={styles.previewImg} resizeMode="cover" />
                <Pressable
                  style={styles.changePhotoBtn}
                  onPress={handlePickPhoto}>
                  <Text style={styles.changePhotoText}>Cambiar foto</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pickPhotoBtn} onPress={handlePickPhoto}>
                <Icon name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.pickPhotoText}>Tomar o elegir foto de tus apuntes</Text>
              </Pressable>
            )}

            {/* Nota opcional */}
            <Text style={styles.fieldLabel}>Nota / Resumen (opcional):</Text>
            <TextInput
              style={styles.modalInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Ej. Fórmulas de derivadas parciales"
              placeholderTextColor={colors.muted}
              multiline
            />

            <CustomButton
              title="Guardar en mis evidencias"
              variant="accent"
              icon="content-save"
              onPress={handleSaveEvidence}
              style={{marginTop: 16}}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  header: {paddingHorizontal: 16, paddingVertical: 12},
  headerRow: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {flexDirection: 'row', alignItems: 'center'},
  headerTitle: {color: colors.text, fontSize: 20, fontWeight: '800', marginLeft: 8, flex: 1},
  title: {color: colors.text, fontSize: 24, fontWeight: '800'},
  subtitle: {color: colors.muted, fontSize: 13, marginTop: 2},
  listContainer: {padding: 16, paddingBottom: 100},

  // Carpetas
  folderCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  folderThumb: {width: '100%', height: 110},
  folderThumbEmpty: {
    width: '100%',
    height: 110,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderMeta: {padding: 10},
  folderName: {color: colors.text, fontSize: 14, fontWeight: '700'},
  folderCount: {color: colors.muted, fontSize: 12, marginTop: 2},

  // Evidencia individual dentro de carpeta
  evidenceItem: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  evidenceThumb: {width: '100%', height: 130},
  zoomPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  zoomText: {color: '#FFFFFF', fontSize: 10, fontWeight: '700', marginLeft: 2},
  evidenceInfo: {padding: 8, position: 'relative'},
  evidenceDate: {color: colors.muted, fontSize: 11, fontWeight: '600'},
  evidenceNote: {color: colors.text, fontSize: 12, marginTop: 4, paddingRight: 20},
  trashBtn: {position: 'absolute', right: 4, bottom: 6},

  // Empty state
  emptyContainer: {alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 32},
  emptyTitle: {color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16},
  emptySub: {color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18},

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  // Modal Fullscreen
  modalFull: {flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center'},
  modalCloseBtn: {position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 8},
  fullscreenImg: {width: SCREEN_WIDTH, height: '80%'},
  modalNoteBox: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    maxWidth: '90%',
  },
  modalNoteText: {color: '#FFFFFF', fontSize: 14, textAlign: 'center'},

  // Modal Subir Evidencia
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {color: colors.text, fontSize: 18, fontWeight: '800'},
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  goalChipsRow: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4},
  goalChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  goalChipOn: {backgroundColor: colors.accent, borderColor: colors.accent},
  goalChipText: {color: colors.text, fontSize: 12, fontWeight: '600'},
  goalChipTextOn: {color: '#1A1200', fontWeight: '800'},
  pickPhotoBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  pickPhotoText: {color: colors.muted, fontSize: 13, marginTop: 6, fontWeight: '600'},
  previewBox: {borderRadius: radius.md, overflow: 'hidden', alignItems: 'center'},
  previewImg: {width: '100%', height: 140, borderRadius: radius.md},
  changePhotoBtn: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  changePhotoText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  modalInput: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    height: 60,
    textAlignVertical: 'top',
  },
});
