import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getData, saveData } from '@/utils/storage';
import { createWorkout, recommendedSplits } from '@/utils/workout';

const splitIcons = {
  ppl: 'barbell-outline',
  upperlower: 'body-outline',
  fullbody: 'fitness-outline',
  brosplit: 'calendar-outline',
};

const splitMuscles = {
  ppl: ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  upperlower: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  fullbody: ['Chest', 'Back', 'Quads', 'Shoulders', 'Hamstrings', 'Biceps', 'Triceps', 'Calves'],
  brosplit: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs'],
};

export default function WorkoutScreen() {
  const [selectedOption, setSelectedOption] = useState('recommended');
  const [customWorkouts, setCustomWorkouts] = useState([]);

  const loadCustomWorkouts = useCallback(async () => {
    const data =
      (await getData('customWorkouts')) || [];
    setCustomWorkouts(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCustomWorkouts();
    }, [loadCustomWorkouts])
  );

  const muscleGroups = workout => {
    const groups = new Set();
    workout.exercises.forEach(ex => {
      const lib = require('@/utils/exercises').exercises.find(
        e => e.id === ex.exerciseId
      );
      if (lib?.majorMuscle) groups.add(lib.majorMuscle);
    });
    return Array.from(groups).join(' · ');
  };

  const handleCreate = async () => {
    const newWorkout = createWorkout('My Workout');
    await saveData('pendingCustomWorkout', newWorkout);
    router.push('/custom-workout-detail');
  };

  const handleStart = workout => {
    router.push({
      pathname: '/active-workout',
      params: { workoutId: workout.id },
    });
  };

  const handleEdit = workoutId => {
    router.push({
      pathname: '/custom-workout-detail',
      params: { workoutId },
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
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          Choose how you want to train
        </Text>
      </View>

      {/* OPTION TABS */}

      <View style={styles.optionContainer}>
        <Pressable
          style={[
            styles.optionButton,
            selectedOption === 'recommended' &&
              styles.selectedOption,
          ]}
          onPress={() =>
            setSelectedOption('recommended')
          }
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === 'recommended' &&
                styles.selectedOptionText,
            ]}
          >
            Recommended
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            selectedOption === 'custom' &&
              styles.selectedOption,
          ]}
          onPress={() => setSelectedOption('custom')}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === 'custom' &&
                styles.selectedOptionText,
            ]}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {/* RECOMMENDED */}

      {selectedOption === 'recommended' && (
        <View style={styles.recommendedContainer}>
          {Object.values(recommendedSplits).map(split => {
            const muscles = splitMuscles[split.id] || [];
            const muscleText = muscles.slice(0, 6).join(' · ') + (muscles.length > 6 ? ' ...' : '');
            const iconName = splitIcons[split.id] || 'barbell-outline';
            return (
              <Pressable
                key={split.id}
                style={styles.splitCard}
                onPress={() =>
                  router.push({
                    pathname: '/weekly-workout',
                    params: { splitId: split.id },
                  })
                }
              >
                <View style={styles.splitIconWrap}>
                  <Ionicons name={iconName} size={22} color="#FFFFFF" />
                </View>
                <View style={styles.splitInfo}>
                  <Text style={styles.splitName}>{split.name.toUpperCase()}</Text>
                  <Text style={styles.splitDesc}>{split.description}</Text>
                  <View style={styles.splitMeta}>
                    <View style={styles.splitDaysBadge}>
                      <Text style={styles.splitDaysText}>{split.days} DAYS</Text>
                    </View>
                    <Text style={styles.splitMuscles}>{muscleText}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#333333" />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* CUSTOM */}

      {selectedOption === 'custom' && (
        <View>
          {/* CREATE BUTTON */}

          <Pressable
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.createButtonText}>
              CREATE WORKOUT
            </Text>
          </Pressable>

          {/* CUSTOM WORKOUT LIST */}

          {customWorkouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="barbell-outline"
                  size={30}
                  color="#333333"
                />
              </View>

              <Text style={styles.emptyTitle}>
                NO CUSTOM WORKOUTS
              </Text>

              <Text style={styles.emptyText}>
                Create your first custom workout
                to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {customWorkouts.map(workout => {
                const exCount =
                  workout.exercises?.length || 0;
                const muscles = muscleGroups(workout);

                return (
                  <View
                    key={workout.id}
                    style={styles.customCard}
                  >
                    {/* WORKOUT INFO */}

                    <Pressable
                      style={styles.customInfo}
                      onPress={() =>
                        handleEdit(workout.id)
                      }
                    >
                      <Text style={styles.customName}>
                        {(
                          workout.name ||
                          'UNNAMED'
                        ).toUpperCase()}
                      </Text>

                      <Text style={styles.customMeta}>
                        {exCount}{' '}
                        {exCount === 1
                          ? 'exercise'
                          : 'exercises'}
                        {muscles
                          ? ` · ${muscles}`
                          : ''}
                      </Text>

                      <View style={styles.customActions}>
                        <Pressable
                          style={styles.editBadge}
                          onPress={() =>
                            handleEdit(
                              workout.id
                            )
                          }
                        >
                          <Ionicons
                            name="create-outline"
                            size={13}
                            color="#888888"
                          />
                          <Text style={styles.editBadgeText}>
                            EDIT
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>

                    {/* START BUTTON */}

                    <Pressable
                      style={styles.startBadge}
                      onPress={() =>
                        handleStart(workout)
                      }
                    >
                      <Ionicons
                        name="play"
                        size={14}
                        color="#000000"
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
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
    marginBottom: 24,
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

  optionContainer: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 5,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#252525',
  },

  optionButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
  },

  selectedOption: {
    backgroundColor: '#FFFFFF',
  },

  optionText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedOptionText: {
    color: '#000000',
  },

  /* RECOMMENDED SPLIT CARDS */

  recommendedContainer: {
    gap: 12,
  },

  splitCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },

  splitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  splitInfo: {
    flex: 1,
    paddingRight: 10,
  },

  splitName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  splitDesc: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  splitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  splitDaysBadge: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },

  splitDaysText: {
    color: '#888888',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  splitMuscles: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },

  /* CREATE BUTTON */

  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },

  createButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* EMPTY STATE */

  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },

  emptyIconWrap: {
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

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  emptyText: {
    color: '#555555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },

  /* CUSTOM WORKOUT LIST */

  list: {
    gap: 10,
  },

  customCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },

  customInfo: {
    flex: 1,
    paddingRight: 12,
  },

  customName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  customMeta: {
    color: '#666666',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },

  customActions: {
    flexDirection: 'row',
    marginTop: 10,
  },

  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#252525',
  },

  editBadgeText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  startBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
