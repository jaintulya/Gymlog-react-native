import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { exercises } from '@/utils/exercises';
import { getData, saveData } from '@/utils/storage';

export default function CustomWorkoutDetailScreen() {
  const { workoutId } = useLocalSearchParams();
  const [workout, setWorkout] = useState(null);
  const [arrangeMode, setArrangeMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    if (!workoutId) return;

    const saved = await getData(`customWorkout_${workoutId}`);
    if (saved) {
      setWorkout(saved);
      return;
    }

    const pending = await getData('pendingCustomWorkout');
    if (pending && pending.id === workoutId) {
      setWorkout(pending);
      return;
    }

    const list = (await getData('customWorkouts')) || [];
    const found = list.find(w => w.id === workoutId);
    if (found) setWorkout(found);
  };

  const updateExercise = (index, field, value) => {
    setWorkout(prev => {
      const list = [...prev.exercises];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, exercises: list };
    });
  };

  const removeExercise = index => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const selectForMove = index => {
    if (!arrangeMode) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      Animated.spring(scaleAnim, {
        toValue: 1.03,
        useNativeDriver: true,
      }).start();
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      moveExercise(selectedIndex, index);
      setSelectedIndex(null);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const moveExercise = (fromIndex, toIndex) => {
    setWorkout(prev => {
      const list = [...prev.exercises];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...prev, exercises: list };
    });
  };

  const saveWorkout = async () => {
    const list = (await getData('customWorkouts')) || [];
    const index = list.findIndex(w => w.id === workout.id);
    if (index !== -1) {
      list[index] = workout;
    } else {
      list.push(workout);
    }
    await saveData('customWorkouts', list);
    await saveData(`customWorkout_${workout.id}`, workout);
    await saveData('pendingCustomWorkout', null);
    router.back();
  };

  if (!workout) return null;

  const isSelected = (index) => selectedIndex === index;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{workout.name || 'Custom Workout'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ACTION ROW */}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.arrangeButton, arrangeMode && styles.arrangeActive]}
          onPress={() => {
            setArrangeMode(prev => !prev);
            setSelectedIndex(null);
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Ionicons
            name="reorder-three-outline"
            size={18}
            color={arrangeMode ? '#000000' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.arrangeText,
              arrangeMode && styles.arrangeActiveText,
            ]}
          >
            {arrangeMode ? 'DONE ARRANGING' : 'ARRANGE'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/custom-add-exercise',
              params: { workoutId: workout.id },
            })
          }
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addText}>ADD EXERCISE</Text>
        </Pressable>
      </View>

      {/* INSTRUCTION */}
      {arrangeMode && (
        <View style={styles.instruction}>
          <Ionicons name="hand-left-outline" size={16} color="#666666" />
          <Text style={styles.instructionText}>
            {selectedIndex === null
              ? 'Tap an exercise to pick it up, then tap where you want it'
              : 'Now tap any exercise to move the selected one there'}
          </Text>
        </View>
      )}

      {/* EXERCISE LIST */}
      <Text style={styles.sectionTitle}>EXERCISES</Text>

      {workout.exercises.map((ex, index) => {
        const exData = exercises.find(e => e.id === ex.exerciseId);
        const isSel = isSelected(index);

        return (
          <Animated.View
            key={ex.id}
            style={[
              styles.exerciseCard,
              arrangeMode && styles.arrangeCard,
              isSel && styles.selectedCard,
              { transform: [{ scale: arrangeMode ? scaleAnim : 1 }] },
            ]}
          >
            {arrangeMode ? (
              <Pressable
                style={styles.arrangeCardInner}
                onPress={() => selectForMove(index)}
              >
                <View style={styles.dragHandle}>
                  <Ionicons name="reorder-three" size={22} color={isSel ? '#FFFFFF' : '#555555'} />
                </View>

                <View style={styles.numBadge}>
                  <Text style={styles.numText}>{index + 1}</Text>
                </View>

                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{exData?.name || ex.exerciseId}</Text>
                  {exData && (
                    <Text style={styles.exTarget}>
                      {exData.majorMuscle} • {exData.targetArea}
                    </Text>
                  )}
                  <Text style={styles.exDetails}>
                    {ex.sets} sets • {ex.reps} reps • {ex.rest}s rest
                  </Text>
                </View>

                {isSel && (
                  <View style={styles.movingBadge}>
                    <Ionicons name="move" size={14} color="#000000" />
                  </View>
                )}
              </Pressable>
            ) : (
              <View style={styles.cardInner}>
                <View style={styles.numBadge}>
                  <Text style={styles.numText}>{index + 1}</Text>
                </View>

                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{exData?.name || ex.exerciseId}</Text>
                  {exData && (
                    <Text style={styles.exTarget}>
                      {exData.majorMuscle} • {exData.targetArea}
                    </Text>
                  )}
                  <Text style={styles.exDetails}>
                    {ex.sets} sets • {ex.reps} reps • {ex.rest}s rest
                  </Text>
                </View>

                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeExercise(index)}
                >
                  <Ionicons name="close" size={16} color="#888888" />
                </Pressable>
              </View>
            )}
          </Animated.View>
        );
      })}

      {workout.exercises.length === 0 && !arrangeMode && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No exercises added yet</Text>
          <Text style={styles.emptySub}>Tap "ADD EXERCISE" to get started</Text>
        </View>
      )}

      {/* SAVE BUTTON */}
      <Pressable
        style={[styles.saveButton, workout.exercises.length === 0 && styles.saveDisabled]}
        onPress={saveWorkout}
        disabled={workout.exercises.length === 0}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color={workout.exercises.length === 0 ? '#444444' : '#000000'}
        />
        <Text
          style={[
            styles.saveText,
            workout.exercises.length === 0 && styles.saveTextDisabled,
          ]}
        >
          SAVE WORKOUT
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingTop: 55, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
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
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: { width: 42 },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  arrangeButton: {
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
  arrangeActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  arrangeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrangeActiveText: {
    color: '#000000',
  },
  addButton: {
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
  addText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#151515',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  instructionText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  arrangeCard: {
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1A1A1A',
  },
  arrangeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#252525',
  },
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  exTarget: {
    color: '#777777',
    fontSize: 11,
    marginTop: 4,
  },
  exDetails: {
    color: '#555555',
    fontSize: 10,
    marginTop: 4,
  },
  removeBtn: {
    padding: 6,
  },
  movingBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    color: '#444444',
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  saveDisabled: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
  },
  saveText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveTextDisabled: {
    color: '#444444',
  },
});
