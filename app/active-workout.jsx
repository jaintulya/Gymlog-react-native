import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  recommendedWorkouts,
  createSet,
} from '../utils/workout';

import { exercises } from '../utils/exercises';
import { getData, saveData } from '../utils/storage';

export default function ActiveWorkoutScreen() {
  const { workoutId } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);

  const [currentExerciseIndex, setCurrentExerciseIndex] =
    useState(0);

  const [setsData, setSetsData] = useState({});

  const [workoutTime, setWorkoutTime] = useState(0);

  const [exerciseTimes, setExerciseTimes] = useState({});

  const [restTime, setRestTime] = useState(0);

  const [isResting, setIsResting] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const [showExtraModal, setShowExtraModal] = useState(false);

  const [skippedExercises, setSkippedExercises] =
    useState([]);

  const [isCustom, setIsCustom] = useState(false);

  /*
    LOAD WORKOUT
  */

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    // 1. Check edited recommended
    const edited = await getData(`editedWorkout_${workoutId}`);
    if (edited) {
      setWorkout(edited);
      setIsCustom(true);
      return;
    }

    // 2. Check custom workout (saved individual)
    const customSaved = await getData(`customWorkout_${workoutId}`);
    if (customSaved) {
      setWorkout(customSaved);
      setIsCustom(true);
      return;
    }

    // 3. Check custom workouts list
    const customList = (await getData('customWorkouts')) || [];
    const found = customList.find(w => w.id === workoutId);
    if (found) {
      setWorkout(found);
      setIsCustom(true);
      return;
    }

    // 4. Check pending custom workout
    const pending = await getData('pendingCustomWorkout');
    if (pending && pending.id === workoutId) {
      setWorkout(pending);
      setIsCustom(true);
      return;
    }

    // 5. Recommended
    const original = Object.values(
      recommendedWorkouts
    ).find(item => item.id === workoutId);

    if (original) {
      setWorkout(original);
      setIsCustom(false);
    } else {
      setWorkout(null);
    }
  };

  /*
    INITIALISE SETS — 3 normal sets per exercise on load
  */

  useEffect(() => {
    if (!workout) return;

    const initial = {};

    workout.exercises.forEach(exercise => {
      if (!setsData[exercise.id]) {
        initial[exercise.id] = Array.from(
          { length: exercise.sets },
          () => createSet(0, 0)
        );
      }
    });

    if (Object.keys(initial).length > 0) {
      setSetsData(prev => ({ ...prev, ...initial }));
    }
  }, [workout]);

  /*
    WORKOUT TIMER
  */

  useEffect(() => {
    if (isPaused || !workout) return;

    const timer = setInterval(() => {
      setWorkoutTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, workout]);

  /*
    EXERCISE TIMER
  */

  useEffect(() => {
    if (isPaused || !workout) return;

    const currentExercise =
      workout.exercises[currentExerciseIndex];

    if (!currentExercise) return;

    const timer = setInterval(() => {
      setExerciseTimes(prev => ({
        ...prev,
        [currentExercise.id]:
          (prev[currentExercise.id] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentExerciseIndex,
    workout,
    isPaused,
  ]);

  /*
    REST TIMER
  */

  useEffect(() => {
    if (
      !isResting ||
      isPaused ||
      restTime <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          setIsResting(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, isPaused, restTime]);

  if (!workout) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Loading workout...
        </Text>
      </View>
    );
  }

  const currentExercise =
    workout.exercises[currentExerciseIndex];

  const exerciseData = exercises.find(
    item => item.id === currentExercise.exerciseId
  );

  const currentSets =
    setsData[currentExercise.id] || [];

  /*
    TIME FORMAT
  */

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  /*
    COMPLETE SET
  */

  const completeSet = (setIndex, weight, reps) => {
    if (!weight || !reps || isPaused) return;

    const list = [...(setsData[currentExercise.id] || [])];

    const existing = list[setIndex] || {};

    const completedSet = {
      ...createSet(Number(weight), Number(reps)),

      exerciseId: currentExercise.exerciseId,

      setType: existing.setType || 'normal',

      completed: true,

      completedAt: new Date().toISOString(),

      restSeconds: restTime || currentExercise.rest,
    };

    list[setIndex] = completedSet;

    setSetsData(prev => ({
      ...prev,
      [currentExercise.id]: list,
    }));

    setRestTime(currentExercise.rest);
    setIsResting(true);
  };

  /*
    EXTRA SET
  */

  const addExtraSet = type => {
    setShowExtraModal(false);

    const newSet = createSet(0, 0);

    newSet.setType = type;

    setSetsData(prev => {
      const list = [
        ...(prev[currentExercise.id] || []),
      ];

      if (type === 'warmup') {
        list.unshift(newSet);
      } else if (type === 'drop') {
        list.push(newSet);
      } else {
        const firstDrop = list.findIndex(
          item => item.setType === 'drop'
        );

        if (firstDrop === -1) {
          list.push(newSet);
        } else {
          list.splice(firstDrop, 0, newSet);
        }
      }

      return {
        ...prev,
        [currentExercise.id]: list,
      };
    });
  };

  /*
    REST CONTROLS
  */

  const decreaseRest = () => {
    setRestTime(prev => Math.max(0, prev - 10));
  };

  const increaseRest = () => {
    setRestTime(prev => prev + 10);
  };

  const skipRest = () => {
    setRestTime(0);
    setIsResting(false);
  };

  /*
    NAVIGATION
  */

  const nextExercise = () => {
    if (
      currentExerciseIndex <
      workout.exercises.length - 1
    ) {
      setCurrentExerciseIndex(
        prev => prev + 1
      );

      setIsResting(false);
      setRestTime(0);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(
        prev => prev - 1
      );

      setIsResting(false);
      setRestTime(0);
    }
  };

  /*
    SKIP EXERCISE
  */

  const skipExercise = () => {
    if (
      !skippedExercises.includes(
        currentExercise.id
      )
    ) {
      setSkippedExercises(prev => [
        ...prev,
        currentExercise.id,
      ]);
    }

    nextExercise();
  };

  /*
    FINISH
  */

  const finishWorkout = () => {
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    Object.values(setsData).forEach(sets => {
      sets.forEach(set => {
        if (set.completed) {
          totalSets++;

          totalReps += Number(set.reps);

          totalVolume +=
            Number(set.weight) *
            Number(set.reps);
        }
      });
    });

    const workoutData = {
      workoutId: workout.id,
      workoutName: workout.name,

      duration: workoutTime,

      exerciseTimes,

      workoutExercises: workout.exercises,

      setsData,

      skippedExercises,

      isCustom,

      totalSets,
      totalReps,
      totalVolume,
    };

    router.push({
      pathname: '/workout-summary',
      params: {
        workoutData:
          JSON.stringify(workoutData),
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>
            WORKOUT TIME
          </Text>

          <Text style={styles.timer}>
            {formatTime(workoutTime)}
          </Text>
        </View>

        <Pressable
          style={styles.pauseButton}
          onPress={() =>
            setIsPaused(prev => !prev)
          }
        >
          <Text style={styles.pauseText}>
            {isPaused ? 'RESUME' : 'PAUSE'}
          </Text>
        </Pressable>
      </View>

      {isPaused && (
        <View style={styles.paused}>
          <Text style={styles.pausedTitle}>
            WORKOUT PAUSED
          </Text>

          <Text style={styles.pausedText}>
            All timers are paused.
          </Text>
        </View>
      )}

      {/* PROGRESS */}

      <Text style={styles.progress}>
        Exercise {currentExerciseIndex + 1} of{' '}
        {workout.exercises.length}
      </Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                ((currentExerciseIndex + 1) /
                  workout.exercises.length) *
                100
              }%`,
            },
          ]}
        />
      </View>

      {/* EXERCISE */}

      <View style={styles.exerciseCard}>
        <Text style={styles.exerciseLabel}>
          EXERCISE {currentExerciseIndex + 1}
        </Text>

        <Text style={styles.exerciseName}>
          {exerciseData?.name ||
            currentExercise.exerciseId}
        </Text>

        {exerciseData && (
          <Text style={styles.target}>
            {exerciseData.majorMuscle} •{' '}
            {exerciseData.targetArea}
          </Text>
        )}

        <View style={styles.exerciseTime}>
          <Text style={styles.exerciseTimeLabel}>
            EXERCISE TIME
          </Text>

          <Text style={styles.exerciseTimeValue}>
            {formatTime(
              exerciseTimes[currentExercise.id] || 0
            )}
          </Text>
        </View>
      </View>

      {/* REST */}

      {isResting && (
        <View style={styles.restCard}>
          <Text style={styles.restLabel}>
            REST
          </Text>

          <Text style={styles.restTime}>
            {formatTime(restTime)}
          </Text>

          <View style={styles.restButtons}>
            <Pressable
              style={styles.restButton}
              onPress={decreaseRest}
            >
              <Text style={styles.restButtonText}>
                −10
              </Text>
            </Pressable>

            <Pressable
              style={styles.restButton}
              onPress={increaseRest}
            >
              <Text style={styles.restButtonText}>
                +10
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.skipRest}
            onPress={skipRest}
          >
            <Text style={styles.skipRestText}>
              SKIP REST
            </Text>
          </Pressable>
        </View>
      )}

      {/* SETS */}

      <Text style={styles.sectionTitle}>
        SETS
      </Text>

      {currentSets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          setData={set}
          disabled={isPaused}
          onDone={completeSet}
        />
      ))}

      {/* EXTRA SET */}

      <Pressable
        style={styles.extraButton}
        onPress={() => setShowExtraModal(true)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.extraText}>
          ADD EXTRA SET
        </Text>
      </Pressable>

      {/* EXTRA SET MODAL */}

      <Modal
        visible={showExtraModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExtraModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExtraModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Extra Set</Text>
              <Pressable
                style={styles.modalClose}
                onPress={() => setShowExtraModal(false)}
              >
                <Ionicons name="close" size={22} color="#888888" />
              </Pressable>
            </View>

            <Pressable
              style={styles.modalOption}
              onPress={() => addExtraSet('warmup')}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="flame-outline" size={22} color="#888888" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Warm-up Set</Text>
                <Text style={styles.modalOptionSub}>
                  Insert at the beginning
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#333333" />
            </Pressable>

            <Pressable
              style={styles.modalOption}
              onPress={() => addExtraSet('normal')}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="barbell-outline" size={22} color="#888888" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Normal Set</Text>
                <Text style={styles.modalOptionSub}>
                  Insert before drop sets
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#333333" />
            </Pressable>

            <Pressable
              style={styles.modalOption}
              onPress={() => addExtraSet('drop')}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="trending-down-outline" size={22} color="#888888" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Drop Set</Text>
                <Text style={styles.modalOptionSub}>
                  Insert at the end
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#333333" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* NAVIGATION */}

      <View style={styles.navigation}>
        <Pressable
          style={[
            styles.navButton,
            currentExerciseIndex === 0 &&
              styles.disabled,
          ]}
          disabled={currentExerciseIndex === 0}
          onPress={previousExercise}
        >
          <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          <Text style={styles.navText}>PREVIOUS</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={skipExercise}
        >
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>

        <Pressable
          style={[
            styles.navButton,
            currentExerciseIndex ===
              workout.exercises.length - 1 &&
              styles.disabled,
          ]}
          disabled={
            currentExerciseIndex ===
            workout.exercises.length - 1
          }
          onPress={nextExercise}
        >
          <Text style={styles.navText}>NEXT</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* FINISH */}

      <Pressable
        style={styles.finish}
        onPress={finishWorkout}
      >
        <Text style={styles.finishText}>
          FINISH WORKOUT
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/*
  SET ROW COMPONENT
*/

function SetRow({
  index,
  setData,
  disabled,
  onDone,
}) {
  const [weight, setWeight] = useState(
    setData?.weight ? String(setData.weight) : ''
  );

  const [reps, setReps] = useState(
    setData?.reps ? String(setData.reps) : ''
  );

  const done = setData?.completed;

  /*
    Sync local state when setData changes externally
    (e.g. after switching exercises back to a completed set)
  */

  if (setData?.weight && String(setData.weight) !== weight) {
    setWeight(String(setData.weight));
  }

  if (setData?.reps && String(setData.reps) !== reps) {
    setReps(String(setData.reps));
  }

  return (
    <View style={styles.setRow}>
      <View style={styles.setNumber}>
        <Text style={styles.setNumberText}>
          {index + 1}
        </Text>
      </View>

      <View style={styles.setType}>
        <Text style={styles.setTypeText}>
          {done
            ? '✓'
            : setData?.setType === 'warmup'
              ? 'W'
              : 'N'}
        </Text>
      </View>

      <View style={styles.setInput}>
        <Text style={styles.inputLabel}>
          WEIGHT
        </Text>

        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="___"
          placeholderTextColor="#555555"
          keyboardType="numeric"
          editable={!disabled && !done}
          style={styles.input}
        />
      </View>

      <View style={styles.setInput}>
        <Text style={styles.inputLabel}>
          REPS
        </Text>

        <TextInput
          value={reps}
          onChangeText={setReps}
          placeholder="___"
          placeholderTextColor="#555555"
          keyboardType="numeric"
          editable={!disabled && !done}
          style={styles.input}
        />
      </View>

      <Pressable
        style={[
          styles.doneButton,
          done && styles.doneActive,
        ]}
        disabled={disabled || done}
        onPress={() =>
          onDone(
            index,
            weight,
            reps
          )
        }
      >
        <Text
          style={[
            styles.doneText,
            done && styles.doneActiveText,
          ]}
        >
          {done ? '✓' : 'DONE'}
        </Text>
      </Pressable>
    </View>
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
  },

  error: {
    color: '#FFFFFF',
  },

  header: {
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

  timerBox: {
    flex: 1,
  },

  timerLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: '700',
  },

  timer: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginTop: 2,
  },

  pauseButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  pauseText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },

  paused: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },

  pausedTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  pausedText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 5,
  },

  progress: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 8,
  },

  progressBar: {
    height: 5,
    backgroundColor: '#252525',
    borderRadius: 5,
    marginBottom: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },

  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252525',
    marginBottom: 15,
  },

  exerciseLabel: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '700',
  },

  exerciseName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },

  target: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },

  exerciseTime: {
    backgroundColor: '#1C1C1C',
    borderRadius: 11,
    alignItems: 'center',
    padding: 12,
    marginTop: 18,
  },

  exerciseTimeLabel: {
    color: '#666666',
    fontSize: 8,
    fontWeight: '700',
  },

  exerciseTimeValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginTop: 4,
  },

  restCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#252525',
  },

  restLabel: {
    color: '#777777',
    fontSize: 10,
    fontWeight: '700',
  },

  restTime: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    marginVertical: 7,
  },

  restButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  restButton: {
    backgroundColor: '#252525',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  restButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  skipRest: {
    padding: 10,
  },

  skipRestText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },

  setRow: {
    backgroundColor: '#151515',
    borderRadius: 13,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },

  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  setNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  setType: {
    width: 28,
    alignItems: 'center',
    marginRight: 5,
  },

  setTypeText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '700',
  },

  setInput: {
    flex: 1,
    marginHorizontal: 3,
  },

  inputLabel: {
    color: '#555555',
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 4,
  },

  input: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#252525',
  },

  doneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginLeft: 5,
  },

  doneActive: {
    backgroundColor: '#252525',
  },

  doneText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },

  doneActiveText: {
    color: '#FFFFFF',
  },

  extraButton: {
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
    marginTop: 8,
  },

  extraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    marginBottom: 18,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  modalClose: {
    padding: 4,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252525',
  },

  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  modalOptionText: {
    flex: 1,
  },

  modalOptionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  modalOptionSub: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
  },

  navigation: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
    marginBottom: 15,
  },

  navButton: {
    flex: 1,
    backgroundColor: '#151515',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#252525',
  },

  navText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  skipText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.3,
  },

  finish: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },

  finishText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});