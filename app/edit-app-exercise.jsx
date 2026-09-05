import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { exercises } from '../utils/exercises';
import {
  recommendedWorkouts,
} from '../utils/workout';
import {
  getData,
  saveData,
} from '../utils/storage';

// Normalize equipment names
const normalizeEquipment = (eq) => {
  if (!eq) return null;
  const map = {
    'Dumbbells': 'Dumbbell',
    'Dumbbell': 'Dumbbell',
    'Barbell': 'Barbell',
    'Machine': 'Machine',
    'Cable': 'Cable',
    'Bodyweight': 'Bodyweight',
    'EZ Bar': 'EZ Bar',
    'Plate': 'Plate',
    'Smith Machine': 'Smith Machine',
    'Ab Wheel': 'Ab Wheel',
    'Jump Rope': 'Jump Rope',
    'Rowing Machine': 'Rowing Machine',
    'Battle Rope': 'Battle Rope',
    'Stationary Bike': 'Stationary Bike',
    'Bicycle': 'Bicycle',
    'Treadmill': 'Treadmill',
  };
  return map[eq] || eq;
};

export default function EditAddExerciseScreen() {
  const { workoutId } = useLocalSearchParams();

  const [search, setSearch] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workout, setWorkout] = useState(null);

  // Compute available equipment from exercise data
  const equipmentOptions = useMemo(() => {
    const eqSet = new Set();
    exercises.forEach(ex => {
      const norm = normalizeEquipment(ex.equipment);
      if (norm) eqSet.add(norm);
    });
    return Array.from(eqSet).sort();
  }, []);

  const muscleOptions = [
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

  // Filter logic
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search: name, majorMuscle, targetArea
      const searchLower = search.toLowerCase();
      const searchMatch =
        !search ||
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.majorMuscle.toLowerCase().includes(searchLower) ||
        (exercise.targetArea && exercise.targetArea.toLowerCase().includes(searchLower));

      // Muscle filter (OR)
      const muscleMatch =
        selectedMuscles.length === 0 ||
        selectedMuscles.some(m => exercise.majorMuscle === m);

      // Equipment filter (OR)
      const eqNorm = normalizeEquipment(exercise.equipment);
      const equipmentMatch =
        selectedEquipment.length === 0 ||
        selectedEquipment.some(e => eqNorm === e);

      return searchMatch && muscleMatch && equipmentMatch;
    });
  }, [search, selectedMuscles, selectedEquipment]);

  // Check if exercise already in workout
  const isExerciseInWorkout = (exerciseId) => {
    if (!workout) return false;
    return workout.exercises.some(ex => ex.exerciseId === exerciseId);
  };

  const toggleExerciseSelection = (exercise) => {
    if (isExerciseInWorkout(exercise.id)) return;
    setSelectedExercises(prev => {
      if (prev.includes(exercise.id)) {
        return prev.filter(id => id !== exercise.id);
      } else {
        return [...prev, exercise.id];
      }
    });
  };

  const toggleMuscle = (muscle) => {
    if (muscle === 'All') {
      setSelectedMuscles([]);
      return;
    }
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const toggleEquipment = (eq) => {
    setSelectedEquipment(prev =>
      prev.includes(eq)
        ? prev.filter(e => e !== eq)
        : [...prev, eq]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedMuscles([]);
    setSelectedEquipment([]);
    setShowFilterModal(false);
  };

  const addSelectedExercises = async () => {
    if (!workout || selectedExercises.length === 0) return;

    // Filter out already existing
    const toAdd = selectedExercises.filter(id => !isExerciseInWorkout(id));
    if (toAdd.length === 0) {
      // Maybe show a toast? Just close.
      router.back();
      return;
    }

    const updatedWorkout = {
      ...workout,
      exercises: [
        ...workout.exercises,
        ...toAdd.map(id => {
          const ex = exercises.find(e => e.id === id);
          return {
            id: `${id}-${Date.now()}-${Math.random()}`,
            exerciseId: id,
            sets: 3,
            reps: ex?.recommendedReps || '8-12',
            rest: 90,
          };
        }),
      ],
    };

    await saveData(`editedWorkout_${workoutId}`, updatedWorkout);
    router.back();
  };

  const activeFilterCount = selectedMuscles.length + selectedEquipment.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.title}>Add Exercise</Text>
            <Text style={styles.subtitle}>Choose exercises</Text>
          </View>
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercise..."
            placeholderTextColor="#666666"
            style={styles.searchInput}
          />
          <Pressable
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter-outline" size={20} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filter'}
            </Text>
          </Pressable>
        </View>

        {/* Exercise List */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultText}>
            {filteredExercises.length} exercises
          </Text>

          {filteredExercises.map(exercise => {
            const isSelected = selectedExercises.includes(exercise.id);
            const alreadyAdded = isExerciseInWorkout(exercise.id);
            return (
              <Pressable
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  isSelected && styles.exerciseCardSelected,
                  alreadyAdded && styles.exerciseCardDisabled,
                ]}
                onPress={() => {
                  if (!alreadyAdded) toggleExerciseSelection(exercise);
                }}
                disabled={alreadyAdded}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseTarget}>
                    {exercise.majorMuscle} • {exercise.targetArea}
                  </Text>
                  <Text style={styles.equipment}>
                    {exercise.equipment}
                  </Text>
                </View>
                <View style={styles.actionIcon}>
                  {alreadyAdded ? (
                    <Ionicons name="checkmark-circle" size={24} color="#444444" />
                  ) : isSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            );
          })}

          {filteredExercises.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptyText}>Try adjusting your filters.</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Add Bar */}
        {selectedExercises.length > 0 && (
          <View style={styles.bottomBar}>
            <Pressable style={styles.addButton} onPress={addSelectedExercises}>
              <Text style={styles.addButtonText}>
                ADD {selectedExercises.length} EXERCISE{selectedExercises.length > 1 ? 'S' : ''}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowFilterModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <Pressable onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#888888" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Muscle Section */}
                <Text style={styles.filterSectionTitle}>MUSCLE GROUPS</Text>
                <View style={styles.chipContainer}>
                  {muscleOptions.map(muscle => {
                    const isActive = muscle === 'All' ? selectedMuscles.length === 0 : selectedMuscles.includes(muscle);
                    return (
                      <Pressable
                        key={muscle}
                        style={[
                          styles.chip,
                          isActive && styles.chipActive,
                        ]}
                        onPress={() => toggleMuscle(muscle)}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {muscle}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Equipment Section */}
                <Text style={[styles.filterSectionTitle, { marginTop: 20 }]}>EQUIPMENT</Text>
                <View style={styles.chipContainer}>
                  {equipmentOptions.map(eq => {
                    const isActive = selectedEquipment.includes(eq);
                    return (
                      <Pressable
                        key={eq}
                        style={[
                          styles.chip,
                          isActive && styles.chipActive,
                        ]}
                        onPress={() => toggleEquipment(eq)}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {eq}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Clear All */}
                <Pressable style={styles.clearAllButton} onPress={clearAllFilters}>
                  <Text style={styles.clearAllText}>CLEAR ALL FILTERS</Text>
                </Pressable>
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: '#777777',
    fontSize: 13,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#252525',
    fontSize: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#151515',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  filterButtonActive: {
    borderColor: '#FFFFFF',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  resultText: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCardSelected: {
    borderColor: '#FFFFFF',
  },
  exerciseCardDisabled: {
    opacity: 0.4,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseTarget: {
    color: '#777777',
    fontSize: 11,
    marginTop: 4,
  },
  equipment: {
    color: '#555555',
    fontSize: 10,
    marginTop: 4,
  },
  actionIcon: {
    width: 30,
    alignItems: 'center',
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
  bottomBar: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
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
    maxHeight: 500,
    borderWidth: 1,
    borderColor: '#252525',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000000',
  },
  clearAllButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  clearAllText: {
    color: '#FF6B35',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
