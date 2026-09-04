import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { recommendedWorkouts, alternativeMap } from '../utils/workout';
import { exercises } from '../utils/exercises';
import { getData, saveData, removeData } from '../utils/storage';

export default function SelectedDayScreen() {
  const { workoutId, day, workoutName, splitId } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [isDefault, setIsDefault] = useState(false);

  const loadWorkout = useCallback(async () => {
    if (!workoutId) {
      setWorkout(null);
      return;
    }

    const saved = await getData(`editedWorkout_${workoutId}`);
    if (saved) {
      setWorkout(saved);
      setIsDefault(false);
      return;
    }

    const original = Object.values(recommendedWorkouts).find(
      item => item.id === workoutId
    );
    setWorkout(original || null);
    setIsDefault(true);
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [loadWorkout])
  );

  // Reset functionality removed; now only on weekly split page

  const handleAlternativePress = (exercise) => {
    const ids = alternativeMap[exercise.exerciseId] || [];
    const altList = ids.map(id => exercises.find(e => e.id === id)).filter(Boolean);
    if (altList.length === 0) return;
    setSelectedExercise(exercise);
    setAlternatives(altList);
    setShowAlternatives(true);
  };

  const replaceExercise = (altExercise) => {
    if (!selectedExercise || !workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === selectedExercise.id) {
        return { ...ex, exerciseId: altExercise.id };
      }
      return ex;
    });

    const updatedWorkout = { ...workout, exercises: updatedExercises };
    setWorkout(updatedWorkout);
    setIsDefault(false);

    saveData(`editedWorkout_${workoutId}`, updatedWorkout);

    setShowAlternatives(false);
    setSelectedExercise(null);
    setAlternatives([]);
  };

  if (!workoutId) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.center}>
          <Text style={styles.restDay}>REST DAY</Text>
          <Text style={styles.restDayLabel}>{day}</Text>
          <Text style={styles.restText}>Recovery is part of the workout.</Text>
          <Pressable style={styles.backLarge} onPress={() => router.back()}>
            <Text style={styles.backLargeText}>GO BACK</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (!workout) return null;

  // Group exercises by major muscle
  const groups = [];
  const groupMap = {};

  workout.exercises.forEach(ex => {
    const lib = exercises.find(e => e.id === ex.exerciseId);
    const muscle = lib?.majorMuscle || 'Other';
    if (!groupMap[muscle]) {
      groupMap[muscle] = [];
      groups.push(muscle);
    }
    groupMap[muscle].push({ ...ex, lib });
  });

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

        <View style={styles.headerInfo}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.title}>{workoutName || workout.name}</Text>
        </View>
      </View>

      {/* HINT - Alternative */}
      <View style={styles.hintRow}>
        <Ionicons name="swap-horizontal-outline" size={14} color="#555555" />
        <Text style={styles.hintText}>Alternative</Text>
        <Text style={styles.hintDesc}>Tap the swap icon to see alternative exercises</Text>
      </View>

      {/* ACTION ROW */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/edit-workout',
              params: {
                workoutId,
                day,
                workoutName,
              },
            })
          }
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.editText}>EDIT WORKOUT</Text>
        </Pressable>

        <Pressable
          style={styles.startButton}
          onPress={() =>
            router.push({
              pathname: '/active-workout',
              params: { workoutId },
            })
          }
        >
          <Ionicons name="play" size={16} color="#000000" />
          <Text style={styles.startText}>START WORKOUT</Text>
        </Pressable>
      </View>

      {/* EXERCISES */}
      <Text style={styles.sectionTitle}>EXERCISES</Text>

      {workout.exercises.map((item, index) => {
        const lib = exercises.find(e => e.id === item.exerciseId);
        const hasAlternatives = (alternativeMap[item.exerciseId] || []).length > 0;

        return (
          <View key={item.id} style={styles.exerciseCard}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {lib?.name || item.exerciseId}
              </Text>
              {lib && (
                <Text style={styles.exerciseTarget}>
                  {lib.majorMuscle} • {lib.targetArea}
                </Text>
              )}
              <Text style={styles.exerciseDetails}>
                {item.sets} sets • {item.reps} reps • {item.rest}s rest
              </Text>
            </View>

              {hasAlternatives && (
                <Pressable
                  style={styles.alternativeButton}
                  onPress={() => handleAlternativePress(item)}
                >
                  <Ionicons name="swap-horizontal-outline" size={18} color="#666666" />
                </Pressable>
              )}
          </View>
        );
      })}

      {/* ALTERNATIVES MODAL */}
      <Modal
        visible={showAlternatives}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlternatives(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAlternatives(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>EXERCISE ALTERNATIVES</Text>
              <Pressable onPress={() => setShowAlternatives(false)}>
                <Ionicons name="close" size={24} color="#888888" />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              {selectedExercise?.lib?.name || 'Exercise'} alternatives
            </Text>

            {alternatives.map(alt => (
              <Pressable
                key={alt.id}
                style={styles.altOption}
                onPress={() => replaceExercise(alt)}
              >
                <Text style={styles.altName}>{alt.name}</Text>
                <Text style={styles.altMeta}>
                  {alt.majorMuscle} • {alt.targetArea} • {alt.equipment}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#333333" />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Reset modal removed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingTop: 55, paddingBottom: 60 },
  center: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restDay: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  restDayLabel: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  restText: { color: '#777777', marginTop: 8 },
  backLarge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  backLargeText: { color: '#000000', fontWeight: '800' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  headerInfo: { flex: 1 },
  day: { color: '#666666', fontSize: 11, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 3 },
  // No reset button on individual day pages
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  editButton: {
    flex: 1,
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  editText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  startButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  startText: { color: '#000000', fontSize: 12, fontWeight: '800' },
  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  exerciseTarget: { color: '#777777', fontSize: 11, marginTop: 3 },
  exerciseDetails: { color: '#555555', fontSize: 10, marginTop: 3 },
  alternativeButton: { padding: 6, marginLeft: 4 },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#252525',
  },
  hintText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
  },
  hintDesc: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '400',
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
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#252525',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalSubtitle: { color: '#777777', fontSize: 13, marginBottom: 16 },
  altOption: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },
  altName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  altMeta: { color: '#666666', fontSize: 11, flex: 1 },
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
});