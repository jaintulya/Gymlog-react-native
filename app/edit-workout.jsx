import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { recommendedWorkouts } from '../utils/workout';
import { exercises } from '../utils/exercises';
import { getData, saveData } from '../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EditWorkoutScreen() {
  const { workoutId } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const dragOffset = useRef(0);
  const layoutHeights = useRef({});
  const scrollViewRef = useRef(null);
  const containerY = useRef(0);

  const loadWorkout = useCallback(async () => {
    const saved = await getData(`editedWorkout_${workoutId}`);
    if (saved) {
      setWorkout(saved);
      return;
    }
    const original = Object.values(recommendedWorkouts).find(
      item => item.id === workoutId
    );
    setWorkout(original ? JSON.parse(JSON.stringify(original)) : null);
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [loadWorkout])
  );

  const removeExercise = index => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const moveExercise = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= workout.exercises.length) return;
    setWorkout(prev => {
      const list = [...prev.exercises];
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return { ...prev, exercises: list };
    });
  };

  const saveChanges = async () => {
    await saveData(`editedWorkout_${workoutId}`, workout);
    router.back();
  };

  // PanResponder for the drag handle (reorder icon)
  const createPanResponder = (index) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        // Disable scroll
        scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
        setDraggingIndex(index);
        dragOffset.current = gestureState.dy;
        pan.setOffset({ x: 0, y: gestureState.dy });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (draggingIndex === null) return;
        const dy = gestureState.dy - dragOffset.current;
        pan.setValue({ x: 0, y: dy });
        // Reorder
        const fromIdx = draggingIndex;
        let y = 0;
        let toIdx = -1;
        const list = workout.exercises;
        for (let i = 0; i < list.length; i++) {
          const h = layoutHeights.current[i] || 80;
          if (i === fromIdx) {
            const center = y + h / 2;
            const newCenter = center + dy;
            if (i > 0 && newCenter < y - (layoutHeights.current[i-1] || 80) / 2) {
              toIdx = i - 1;
              break;
            }
            if (i < list.length - 1 && newCenter > y + h + (layoutHeights.current[i+1] || 80) / 2) {
              toIdx = i + 1;
              break;
            }
            break;
          }
          y += h;
        }
        if (toIdx !== -1 && toIdx !== fromIdx) {
          moveExercise(fromIdx, toIdx);
          setDraggingIndex(toIdx);
          pan.setOffset({ x: 0, y: 0 });
          pan.setValue({ x: 0, y: 0 });
          dragOffset.current = 0;
        }
      },
      onPanResponderRelease: () => {
        setDraggingIndex(null);
        pan.setValue({ x: 0, y: 0 });
        pan.setOffset({ x: 0, y: 0 });
        dragOffset.current = 0;
        scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
      },
    });
  };

  if (!workout) return null;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.title}>Edit Workout</Text>
          <Text style={styles.subtitle}>{workout.name}</Text>
        </View>
      </View>

      {/* ADD BUTTON */}
      <Pressable
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: '/edit-app-exercise',
            params: { workoutId },
          })
        }
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        <Text style={styles.addText}>ADD EXERCISE</Text>
      </Pressable>

      <View style={styles.instruction}>
        <Ionicons name="hand-left-outline" size={16} color="#666666" />
        <Text style={styles.instructionText}>
          Drag the reorder icon to move exercises
        </Text>
      </View>

      <Text style={styles.sectionTitle}>EXERCISES</Text>

      {workout.exercises.map((item, index) => {
        const exercise = exercises.find(ex => ex.id === item.exerciseId);
        const isDragging = draggingIndex === index;
        const panResponder = createPanResponder(index);

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.exerciseCard,
              isDragging && styles.draggingCard,
              {
                transform: isDragging ? [{ translateY: pan.y }] : [],
                zIndex: isDragging ? 10 : 1,
              },
            ]}
            onLayout={e => {
              layoutHeights.current[index] = e.nativeEvent.layout.height;
            }}
          >
            <View style={styles.cardInner}>
              <View
                style={styles.dragHandle}
                {...panResponder.panHandlers}
              >
                <Ionicons name="reorder-three" size={22} color="#555555" />
              </View>
              <View style={styles.number}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.exerciseName}>
                  {exercise?.name || item.exerciseId}
                </Text>
                {exercise && (
                  <Text style={styles.target}>
                    {exercise.majorMuscle} • {exercise.targetArea}
                  </Text>
                )}
                <Text style={styles.details}>
                  {item.sets} sets • {item.reps} reps
                </Text>
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeExercise(index)}
              >
                <Ionicons name="close" size={16} color="#888888" />
              </Pressable>
            </View>
          </Animated.View>
        );
      })}

      {workout.exercises.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No exercises added yet</Text>
          <Text style={styles.emptySub}>Tap "ADD EXERCISE" to get started</Text>
        </View>
      )}

      <Pressable style={styles.saveButton} onPress={saveChanges}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#000000" />
        <Text style={styles.saveText}>SAVE CHANGES</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingTop: 55, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '700' },
  subtitle: { color: '#777777', fontSize: 13, marginTop: 4 },
  addButton: {
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  addText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
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
  instructionText: { color: '#888888', fontSize: 12, fontWeight: '600', flex: 1 },
  sectionTitle: { color: '#666666', fontSize: 11, fontWeight: '800', marginBottom: 12 },
  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  draggingCard: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1A1A1A',
    elevation: 5,
  },
  cardInner: { flexDirection: 'row', alignItems: 'center' },
  dragHandle: {
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#252525',
    paddingVertical: 10,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  numberText: { color: '#FFFFFF', fontWeight: '800' },
  info: { flex: 1 },
  exerciseName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  target: { color: '#777777', fontSize: 11, marginTop: 4 },
  details: { color: '#555555', fontSize: 10, marginTop: 4 },
  removeButton: { padding: 6 },
  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  emptyText: { color: '#666666', fontSize: 14, fontWeight: '600' },
  emptySub: { color: '#444444', fontSize: 12, marginTop: 6 },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  saveText: { color: '#000000', fontSize: 14, fontWeight: '800' },
});