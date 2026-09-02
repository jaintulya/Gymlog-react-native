import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  recommendedWorkouts,
} from '../utils/workout';

import { exercises } from '../utils/exercises';
import { getData, saveData } from '../utils/storage';

export default function EditWorkoutScreen() {
  const { workoutId } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);
  const [arrangeMode, setArrangeMode] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    const saved = await getData(`editedWorkout_${workoutId}`);

    if (saved) {
      setWorkout(saved);
      return;
    }

    const original = Object.values(recommendedWorkouts).find(
      item => item.id === workoutId
    );

    setWorkout(
      original
        ? JSON.parse(JSON.stringify(original))
        : null
    );
  };

  const removeExercise = index => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const moveExercise = (index, direction) => {
    setWorkout(prev => {
      const list = [...prev.exercises];
      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= list.length) {
        return prev;
      }

      const temp = list[index];
      list[index] = list[newIndex];
      list[newIndex] = temp;

      return {
        ...prev,
        exercises: list,
      };
    });
  };

  const saveChanges = async () => {
    await saveData(
      `editedWorkout_${workoutId}`,
      workout
    );

    router.back();
  };

  if (!workout) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Edit Workout</Text>
          <Text style={styles.subtitle}>
            {workout.name}
          </Text>
        </View>
      </View>

      <View style={styles.topActions}>
        <Pressable
          style={[
            styles.arrangeButton,
            arrangeMode && styles.arrangeActive,
          ]}
          onPress={() => setArrangeMode(prev => !prev)}
        >
          <Text
            style={[
              styles.arrangeText,
              arrangeMode && styles.arrangeActiveText,
            ]}
          >
            {arrangeMode ? 'DONE ARRANGING' : '☷ ARRANGE'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/edit-add-exercise',
              params: {
                workoutId,
              },
            })
          }
        >
          <Text style={styles.addText}>+ ADD EXERCISE</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        EXERCISES
      </Text>

      {workout.exercises.map((item, index) => {
        const exercise = exercises.find(
          ex => ex.id === item.exerciseId
        );

        return (
          <View
            key={item.id}
            style={styles.exerciseCard}
          >
            <View style={styles.number}>
              <Text style={styles.numberText}>
                {index + 1}
              </Text>
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

            {arrangeMode ? (
              <View style={styles.arrangeControls}>
                <Pressable
                  style={styles.moveButton}
                  onPress={() =>
                    moveExercise(index, -1)
                  }
                >
                  <Text style={styles.moveText}>↑</Text>
                </Pressable>

                <Pressable
                  style={styles.moveButton}
                  onPress={() =>
                    moveExercise(index, 1)
                  }
                >
                  <Text style={styles.moveText}>↓</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.removeButton}
                onPress={() => removeExercise(index)}
              >
                <Text style={styles.removeText}>
                  REMOVE
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <Pressable
        style={styles.saveButton}
        onPress={saveChanges}
      >
        <Text style={styles.saveText}>
          SAVE CHANGES
        </Text>
      </Pressable>
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

  backText: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    color: '#777777',
    fontSize: 13,
    marginTop: 4,
  },

  topActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  arrangeButton: {
    flex: 1,
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },

  arrangeActive: {
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },

  addText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 12,
  },

  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
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

  numberText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  info: {
    flex: 1,
  },

  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  target: {
    color: '#777777',
    fontSize: 11,
    marginTop: 4,
  },

  details: {
    color: '#555555',
    fontSize: 10,
    marginTop: 4,
  },

  removeButton: {
    backgroundColor: '#202020',
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 8,
  },

  removeText: {
    color: '#888888',
    fontSize: 8,
    fontWeight: '800',
  },

  arrangeControls: {
    flexDirection: 'row',
    gap: 5,
  },

  moveButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moveText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },

  saveText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});