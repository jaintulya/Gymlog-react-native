import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { exercises } from '../utils/exercises';
import {
  recommendedWorkouts,
} from '../utils/workout';
import {
  getData,
  saveData,
} from '../utils/storage';

export default function EditAddExerciseScreen() {
  const { workoutId } = useLocalSearchParams();

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] =
    useState('All');

  const [workout, setWorkout] = useState(null);

  const muscles = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Core',
    'Forearms',
    'Cardio',
  ];

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    const saved = await getData(
      `editedWorkout_${workoutId}`
    );

    if (saved) {
      setWorkout(saved);
      return;
    }

    const original = Object.values(
      recommendedWorkouts
    ).find(item => item.id === workoutId);

    setWorkout(
      original
        ? JSON.parse(JSON.stringify(original))
        : null
    );
  };

  const filteredExercises = exercises.filter(exercise => {
    const searchMatch = exercise.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const muscleMatch =
      selectedMuscle === 'All' ||
      exercise.majorMuscle === selectedMuscle;

    return searchMatch && muscleMatch;
  });

  const addExercise = async exercise => {
    if (!workout) return;

    const exists = workout.exercises.some(
      item => item.exerciseId === exercise.id
    );

    if (exists) return;

    const newExercise = {
      id: `${exercise.id}-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      sets: 3,
      reps: exercise.recommendedReps || '8-12',
      rest: 90,
    };

    const updatedWorkout = {
      ...workout,
      exercises: [
        ...workout.exercises,
        newExercise,
      ],
    };

    await saveData(
      `editedWorkout_${workoutId}`,
      updatedWorkout
    );

    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>
            Add Exercise
          </Text>

          <Text style={styles.subtitle}>
            Choose an exercise
          </Text>
        </View>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercise..."
        placeholderTextColor="#666666"
        style={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filterContent}
      >
        {muscles.map(muscle => {
          const selected =
            selectedMuscle === muscle;

          return (
            <Pressable
              key={muscle}
              style={[
                styles.filter,
                selected && styles.selectedFilter,
              ]}
              onPress={() =>
                setSelectedMuscle(muscle)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selected &&
                    styles.selectedFilterText,
                ]}
              >
                {muscle}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filteredExercises.map(exercise => (
          <Pressable
            key={exercise.id}
            style={styles.exercise}
            onPress={() => addExercise(exercise)}
          >
            <View style={styles.info}>
              <Text style={styles.name}>
                {exercise.name}
              </Text>

              <Text style={styles.target}>
                {exercise.majorMuscle} •{' '}
                {exercise.targetArea}
              </Text>

              <Text style={styles.equipment}>
                {exercise.equipment}
              </Text>
            </View>

            <Text style={styles.plus}>+</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
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
    fontSize: 25,
    fontWeight: '700',
  },

  subtitle: {
    color: '#777777',
    fontSize: 13,
    marginTop: 4,
  },

  search: {
    backgroundColor: '#1C1C1C',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#252525',
    fontSize: 15,
  },

  filters: {
    marginTop: 14,
    maxHeight: 44,
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filter: {
    backgroundColor: '#151515',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#252525',
  },

  selectedFilter: {
    backgroundColor: '#FFFFFF',
  },

  filterText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedFilterText: {
    color: '#000000',
  },

  list: {
    padding: 20,
    paddingBottom: 50,
  },

  exercise: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },

  info: {
    flex: 1,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  target: {
    color: '#777777',
    fontSize: 11,
    marginTop: 4,
  },

  equipment: {
    color: '#555555',
    fontSize: 10,
    marginTop: 4,
  },

  plus: {
    color: '#FFFFFF',
    fontSize: 25,
    marginLeft: 12,
  },
});