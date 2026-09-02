import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';

import { exercises } from '../utils/exercises';
import { saveData } from '../utils/storage';

export default function AddExerciseScreen() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

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

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'All' ||
      exercise.majorMuscle === selectedMuscle;

    return matchesSearch && matchesMuscle;
  });

  /*
    Save selected exercise temporarily.
    
    Active workout screen will read this when
    user comes back.
  */

  const selectExercise = async exercise => {
    await saveData('pendingAddExercise', exercise.id);

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Add Exercise</Text>
          <Text style={styles.subtitle}>
            Choose an exercise for this workout
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercise..."
        placeholderTextColor="#666666"
        style={styles.searchInput}
      />

      {/* MUSCLE FILTER */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {muscles.map(muscle => {
          const selected = selectedMuscle === muscle;

          return (
            <Pressable
              key={muscle}
              style={[
                styles.filterButton,
                selected && styles.selectedFilter,
              ]}
              onPress={() => setSelectedMuscle(muscle)}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.selectedFilterText,
                ]}
              >
                {muscle}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* EXERCISES */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exerciseList}
      >
        <Text style={styles.resultText}>
          {filteredExercises.length} exercises
        </Text>

        {filteredExercises.map(exercise => (
          <Pressable
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => selectExercise(exercise)}
          >
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {exercise.name}
              </Text>

              <Text style={styles.exerciseTarget}>
                {exercise.majorMuscle} • {exercise.targetArea}
              </Text>

              <Text style={styles.equipment}>
                {exercise.equipment}
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Pressable>
        ))}

        {filteredExercises.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No exercises found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or muscle group.
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
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

  searchInput: {
    backgroundColor: '#1C1C1C',
    marginHorizontal: 20,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#252525',
  },

  filterScroll: {
    marginTop: 15,
    maxHeight: 45,
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterButton: {
    backgroundColor: '#151515',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#252525',
  },

  selectedFilter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  filterText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedFilterText: {
    color: '#000000',
  },

  exerciseList: {
    padding: 20,
    paddingBottom: 50,
  },

  resultText: {
    color: '#666666',
    fontSize: 12,
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

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  exerciseTarget: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
  },

  equipment: {
    color: '#555555',
    fontSize: 11,
    marginTop: 5,
  },

  arrowContainer: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  emptyText: {
    color: '#666666',
    fontSize: 13,
    marginTop: 6,
  },
});