import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { recommendedWorkouts } from '../utils/workout';
import { exercises } from '../utils/exercises';
import { getData } from '../utils/storage';

export default function DayWorkoutScreen() {
  const { workoutId, day, workoutName } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    if (!workoutId) {
      setWorkout(null);
      return;
    }

    const saved = await getData(`editedWorkout_${workoutId}`);

    if (saved) {
      setWorkout(saved);
      return;
    }

    const original = Object.values(recommendedWorkouts).find(
      item => item.id === workoutId
    );

    setWorkout(original || null);
  };

  if (!workoutId) {
    return (
      <View style={styles.center}>
        <Text style={styles.restTitle}>Rest Day</Text>
        <Text style={styles.restText}>
          Recovery is part of the workout.
        </Text>

        <Pressable
          style={styles.backLarge}
          onPress={() => router.back()}
        >
          <Text style={styles.backLargeText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

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

        <View style={styles.headerInfo}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.title}>
            {workoutName || workout.name}
          </Text>
        </View>
      </View>

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
          <Text style={styles.editText}>EDIT WORKOUT</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>EXERCISES</Text>

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

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {exercise?.name || item.exerciseId}
              </Text>

              {exercise && (
                <Text style={styles.target}>
                  {exercise.majorMuscle} • {exercise.targetArea}
                </Text>
              )}

              <Text style={styles.details}>
                {item.sets} sets • {item.reps} reps • {item.rest}s rest
              </Text>
            </View>
          </View>
        );
      })}

      <Pressable
        style={styles.startButton}
        onPress={() =>
          router.push({
            pathname: '/active-workout',
            params: {
              workoutId,
            },
          })
        }
      >
        <Text style={styles.startText}>START WORKOUT</Text>
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

  center: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  restTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  restText: {
    color: '#777777',
    marginTop: 8,
  },

  backLarge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  backLargeText: {
    color: '#000000',
    fontWeight: '800',
  },

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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  headerInfo: {
    flex: 1,
  },

  day: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 3,
  },

  actionRow: {
    marginBottom: 22,
  },

  editButton: {
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },

  editText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },

  number: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  numberText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  target: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },

  details: {
    color: '#555555',
    fontSize: 11,
    marginTop: 5,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 10,
  },

  startText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});