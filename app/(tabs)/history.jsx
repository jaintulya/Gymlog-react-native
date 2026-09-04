import { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getData, saveData } from '../../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [swipedId, setSwipedId] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadHistory = async () => {
    const data = (await getData('workoutHistory')) || [];
    setHistory(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const time = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    return `${day} ${month} ${year} · ${time}`;
  };

  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const formatVolume = vol => {
    if (!vol && vol !== 0) return '0';
    return Number(vol).toLocaleString();
  };

  const openDelete = item => {
    setDeleteId(item.id);
    setDeleteName(item.workoutName || 'Workout');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const updated = history.filter(item => item.id !== deleteId);
    await saveData('workoutHistory', updated);
    setHistory(updated);
    setDeleteId(null);
    setDeleteName('');
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const navigateToDetails = item => {
    router.push({
      pathname: '/workout-details',
      params: { workoutData: JSON.stringify(item) },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            {history.length > 0 ? `${history.length} workout${history.length > 1 ? 's' : ''} completed` : 'Your completed workouts'}
          </Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="time" size={20} color="#FFFFFF" />
        </View>
      </View>

      {/* EMPTY STATE */}
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="barbell-outline" size={36} color="#333333" />
          </View>
          <Text style={styles.emptyTitle}>NO WORKOUTS YET</Text>
          <Text style={styles.emptyText}>Complete your first workout to see it here.</Text>
        </View>
      ) : (
        /* WORKOUT CARDS */
        history.map(item => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => navigateToDetails(item)}
          >
            {/* CARD TOP */}
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.workoutName}>{(item.workoutName || 'WORKOUT').toUpperCase()}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, item.isCustom ? styles.badgeCustom : styles.badgeRecommended]}>
                    <Text style={[styles.badgeText, item.isCustom ? styles.badgeTextCustom : styles.badgeTextRecommended]}>
                      {item.isCustom ? 'CUSTOM' : 'RECOMMENDED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>

              <View style={styles.durationBlock}>
                <Ionicons name="time-outline" size={14} color="#555555" />
                <Text style={styles.duration}>{formatDuration(item.duration || 0)}</Text>
              </View>
            </View>

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.totalSets || 0}</Text>
                <Text style={styles.statLabel}>SETS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.totalReps || 0}</Text>
                <Text style={styles.statLabel}>REPS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, styles.statVolume]}>{formatVolume(item.totalVolume || 0)}</Text>
                <Text style={styles.statLabel}>KG VOLUME</Text>
              </View>
            </View>

            {/* CHEVRON + DELETE */}
            <View style={styles.bottomRow}>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => openDelete(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#666666" />
              </Pressable>
              <View style={styles.chevronRow}>
                <Ionicons name="chevron-forward" size={16} color="#333333" />
              </View>
            </View>
          </Pressable>
        ))
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <Pressable style={styles.modalOverlay} onPress={cancelDelete}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={32} color="#FF4444" />
            </View>

            <Text style={styles.modalTitle}>DELETE WORKOUT?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove "{deleteName}" from your history? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>

              <Pressable style={styles.deleteConfirmButton} onPress={confirmDelete}>
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.deleteConfirmText}>DELETE</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666666',
    fontSize: 13,
    marginTop: 5,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  emptyText: {
    color: '#555555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flex: 1,
    paddingRight: 10,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRecommended: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333333',
  },
  badgeCustom: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#444444',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  badgeTextRecommended: {
    color: '#888888',
  },
  badgeTextCustom: {
    color: '#AAAAAA',
  },
  dateText: {
    color: '#555555',
    fontSize: 11,
    marginTop: 7,
    fontWeight: '500',
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252525',
  },
  duration: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#252525',
    marginTop: 14,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#252525',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statVolume: {
    fontSize: 14,
  },
  statLabel: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  deleteBtn: {
    padding: 6,
  },
  chevronRow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#252525',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalText: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  deleteConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
