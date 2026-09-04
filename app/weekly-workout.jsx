import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { recommendedSplits, recommendedWorkouts } from '../utils/workout';
import { exercises } from '../utils/exercises';
import { removeData } from '../utils/storage';

export default function WeeklyWorkoutScreen() {
  const { splitId } = useLocalSearchParams();
  const [showResetModal, setShowResetModal] = useState(false);

  const split = Object.values(recommendedSplits).find(s => s.id === splitId);

  if (!split) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Split not found.</Text>
      </View>
    );
  }

  const resetSplitToDefault = async () => {
    for (const day of split.workouts) {
      if (day.workoutId) {
        await removeData(`editedWorkout_${day.workoutId}`);
      }
    }
    setShowResetModal(false);
    // Show a simple feedback by alerting (or we could use a toast if we had one)
    // We'll just close the modal and the next time user opens a day, it will be default.
  };

  const getMusclesForDay = workoutId => {
    if (!workoutId) return [];
    const wk = Object.values(recommendedWorkouts).find(w => w.id === workoutId);
    if (!wk) return [];
    const muscles = [];
    const seen = new Set();
    wk.exercises.forEach(ex => {
      const lib = exercises.find(e => e.id === ex.exerciseId);
      if (lib && !seen.has(lib.majorMuscle)) {
        seen.add(lib.majorMuscle);
        muscles.push(lib.majorMuscle);
      }
    });
    return muscles;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>{split.name.toUpperCase()}</Text>
          <Text style={styles.subtitle}>Weekly workout split</Text>
        </View>

        <Pressable
          style={styles.resetButton}
          onPress={() => setShowResetModal(true)}
        >
          <Text style={styles.resetButtonText}>RESET TO DEFAULT</Text>
        </Pressable>
      </View>

      {/* WEEKLY PLAN */}
      <Text style={styles.sectionTitle}>WEEKLY PLAN</Text>

      {split.workouts.map((day, index) => {
        const isRest = !day.workoutId;
        const muscles = getMusclesForDay(day.workoutId);
        const muscleText = muscles.join(' · ') || 'Recovery';

        return (
          <Pressable
            key={index}
            style={styles.dayCard}
            onPress={() =>
              router.push({
                pathname: '/selected-day',
                params: {
                  workoutId: day.workoutId || '',
                  day: day.day,
                  workoutName: day.name,
                  splitId: split.id,
                },
              })
            }
          >
            <View style={styles.dayCircle}>
              <Text style={styles.dayCircleText}>{day.day.substring(0, 1)}</Text>
            </View>

            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{day.day}</Text>
              <Text style={styles.workoutName}>{day.name}</Text>
              <Text style={styles.muscles}>{muscleText}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#333333" />
          </Pressable>
        );
      })}

      {/* RESET CONFIRMATION MODAL */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowResetModal(false)}
        >
          <View style={styles.resetModalContent}>
            <View style={styles.resetIconWrap}>
              <Ionicons name="refresh-outline" size={32} color="#FF6B35" />
            </View>

            <Text style={styles.resetModalTitle}>RESET SPLIT TO DEFAULT?</Text>
            <Text style={styles.resetModalText}>
              This will discard all your changes and restore the original recommended workouts for this entire split. This action cannot be undone.
            </Text>

            <View style={styles.resetModalButtons}>
              <Pressable
                style={styles.resetCancelButton}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.resetCancelText}>CANCEL</Text>
              </Pressable>

              <Pressable
                style={styles.resetConfirmButton}
                onPress={resetSplitToDefault}
              >
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                <Text style={styles.resetConfirmText}>RESET</Text>
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
    paddingTop: 55,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerCenter: {
    flex: 1,
    paddingRight: 8,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#888888',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resetModalContent: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#252525',
    alignItems: 'center',
  },
  resetIconWrap: {
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
  resetModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  resetModalText: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  resetModalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  resetCancelButton: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  resetCancelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resetConfirmButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resetConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },
  subtitle: {
    color: '#777777',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dayCircleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 3,
  },
  muscles: {
    color: '#666666',
    fontSize: 11,
    marginTop: 5,
  },
});