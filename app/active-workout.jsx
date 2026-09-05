import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
  PanResponder,
  Animated,
  Linking,
  LayoutAnimation,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  recommendedWorkouts,
  createSet,
} from '../utils/workout';

import { exercises } from '../utils/exercises';
import { getData, removeData, saveData } from '../utils/storage';
import { localTimestamp } from '../utils/date-time';

export default function ActiveWorkoutScreen() {
  const { workoutId, startedAt: startedAtParam } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);

  const [currentExerciseIndex, setCurrentExerciseIndex] =
    useState(0);

  const [setsData, setSetsData] = useState({});

  const [workoutTime, setWorkoutTime] = useState(0);

  const [exerciseTimes, setExerciseTimes] = useState({});
  const [exerciseTiming, setExerciseTiming] = useState({});

  const [restTime, setRestTime] = useState(0);

  const [isResting, setIsResting] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const [showExtraModal, setShowExtraModal] = useState(false);

  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [setEditMode, setSetEditMode] = useState(false);
  const [setDrag, setSetDrag] = useState(null);

  const [isCustom, setIsCustom] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [setsInitialized, setSetsInitialized] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const finishingRef = useRef(false);
  const loadedSessionWorkoutIdRef = useRef(null);
  const loadRequestIdRef = useRef(0);

  /*
    LOAD WORKOUT
  */

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    const requestId = ++loadRequestIdRef.current;
    const isCurrentRequest = () => loadRequestIdRef.current === requestId;
    // Prevent a previously mounted workout screen from saving its old state
    // while a new workoutId is loading.
    loadedSessionWorkoutIdRef.current = null;
    const savedSession = await getData('activeWorkoutSession');
    if (!isCurrentRequest()) return;
    const shouldRestoreSession =
      savedSession?.status === 'active' &&
      savedSession?.workoutId === workoutId &&
      savedSession.workout &&
      savedSession.workout.id === workoutId;

    if (shouldRestoreSession) {
      loadedSessionWorkoutIdRef.current = workoutId;
      setWorkout(savedSession.workout);
      setCurrentExerciseIndex(savedSession.currentExerciseIndex || 0);
      setSetsData(savedSession.setsData || {});
      setWorkoutTime(savedSession.workoutTime || 0);
      setExerciseTimes(savedSession.exerciseTimes || {});
      setExerciseTiming(savedSession.exerciseTiming || {});
      setRestTime(savedSession.restTime || 0);
      setIsResting(false);
      setIsPaused(false);
      setIsCustom(!!savedSession.isCustom);
      setStartedAt(savedSession.startedAt || localTimestamp());
      setRecordId(savedSession.recordId || `${workoutId}-${Date.now()}`);
      setSetsInitialized(true);
      setSessionReady(true);
      return;
    }

    if (savedSession?.workoutId === workoutId) {
      await removeData('activeWorkoutSession');
      if (!isCurrentRequest()) return;
    }

    const beginSession = async (nextWorkout, custom) => {
      if (!isCurrentRequest()) return;
      const sessionStartedAt = startedAtParam || localTimestamp();
      const sessionRecordId = `${workoutId}-${Date.now()}`;

      setWorkout(nextWorkout);
      setIsCustom(custom);
      setStartedAt(sessionStartedAt);
      setRecordId(sessionRecordId);
      setSessionReady(true);
      loadedSessionWorkoutIdRef.current = workoutId;

      // Persist immediately so leaving the screen right after Start Workout
      // still creates a resumable ongoing session.
      await saveData('activeWorkoutSession', {
        status: 'active',
        workoutId,
        workout: nextWorkout,
        currentExerciseIndex: 0,
        setsData: {},
        workoutTime: 0,
        exerciseTimes: {},
        exerciseTiming: {},
        restTime: 0,
        isCustom: custom,
        startedAt: sessionStartedAt,
        recordId: sessionRecordId,
      });
    };

    // 1. Check edited recommended
    const edited = await getData(`editedWorkout_${workoutId}`);
    if (!isCurrentRequest()) return;
    if (edited) {
      await beginSession(edited, true);
      return;
    }

    // 2. Check custom workout (saved individual)
    const customSaved = await getData(`customWorkout_${workoutId}`);
    if (!isCurrentRequest()) return;
    if (customSaved) {
      await beginSession(customSaved, true);
      return;
    }

    // 3. Check custom workouts list
    const customList = (await getData('customWorkouts')) || [];
    if (!isCurrentRequest()) return;
    const found = customList.find(w => w.id === workoutId);
    if (found) {
      await beginSession(found, true);
      return;
    }

    // 4. Check pending custom workout
    const pending = await getData('pendingCustomWorkout');
    if (!isCurrentRequest()) return;
    if (pending && pending.id === workoutId) {
      await beginSession(pending, true);
      return;
    }

    // 5. Recommended
    const original = Object.values(
      recommendedWorkouts
    ).find(item => item.id === workoutId);

    if (original) {
      await beginSession(original, false);
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
    setSetsInitialized(true);
  }, [workout]);

  useEffect(() => {
    if (
      finishingRef.current ||
      loadedSessionWorkoutIdRef.current !== workoutId ||
      !sessionReady ||
      !setsInitialized ||
      !workout ||
      !startedAt ||
      !recordId
    ) return;

    saveData('activeWorkoutSession', {
      status: 'active',
      workoutId,
      workout,
      currentExerciseIndex,
      setsData,
      workoutTime,
      exerciseTimes,
      exerciseTiming,
      restTime,
      isCustom,
      startedAt,
      recordId,
    });
  }, [
    workoutId,
    workout,
    currentExerciseIndex,
    setsData,
    workoutTime,
    exerciseTimes,
    exerciseTiming,
    restTime,
    isCustom,
    startedAt,
    recordId,
    sessionReady,
    setsInitialized,
  ]);

  /*
    WORKOUT TIMER
  */

  useEffect(() => {
    if (isPaused || isFinishing || !workout) return;

    const timer = setInterval(() => {
      setWorkoutTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isFinishing, workout]);

  /*
    EXERCISE TIMER
  */

  useEffect(() => {
    if (isPaused || isFinishing || !workout) return;

    const currentExercise =
      workout.exercises[currentExerciseIndex];

    if (!currentExercise) return;

    const timer = setInterval(() => {
      setExerciseTimes(prev => ({
        ...prev,
        [currentExercise.id]:
          (prev[currentExercise.id] || 0) + 1,
      }));
      setExerciseTiming(prev =>
        prev[currentExercise.id]
          ? prev
          : {
              ...prev,
              [currentExercise.id]: {
                exerciseStartedAt: localTimestamp(),
              },
            }
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentExerciseIndex,
    workout,
    isPaused,
    isFinishing,
  ]);

  /*
    REST TIMER
  */

  useEffect(() => {
    if (
      !isResting ||
      isPaused ||
      isFinishing ||
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
  }, [isResting, isPaused, isFinishing, restTime]);

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
    if (!reps || isPaused) return;

    const list = [...(setsData[currentExercise.id] || [])];

    const existing = list[setIndex] || {};

    const completedSet = {
      ...createSet(Number(weight), Number(reps)),

      exerciseId: currentExercise.exerciseId,

      setType: existing.setType || 'normal',

      completed: true,

      completedAt: localTimestamp(),

      setNumber: existing.setNumber || setIndex + 1,

      restSeconds: restTime || currentExercise.rest,
    };

    list[setIndex] = completedSet;
    list.sort((a, b) => Number(b.completed) - Number(a.completed));

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

  const editSet = setIndex => {
    if (isPaused) return;

    setSetsData(prev => {
      const list = [...(prev[currentExercise.id] || [])];
      const set = list[setIndex];
      if (!set) return prev;

      list[setIndex] = { ...set, completed: false };
      list.sort((a, b) => Number(b.completed) - Number(a.completed));
      return { ...prev, [currentExercise.id]: list };
    });
  };

  const moveSet = (setId, toIndex) => {
    if (isPaused) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setSetsData(prev => {
      const list = [...(prev[currentExercise.id] || [])];
      const fromIndex = list.findIndex(set => set.id === setId);
      if (fromIndex === -1) return prev;
      const targetIndex = Math.max(
        0,
        Math.min(list.length - 1, toIndex)
      );
      if (targetIndex === fromIndex) return prev;

      const [movedSet] = list.splice(fromIndex, 1);
      list.splice(targetIndex, 0, movedSet);
      list.sort((a, b) => Number(b.completed) - Number(a.completed));
      return { ...prev, [currentExercise.id]: list };
    });
  };

  const startSetDrag = (setId, fromIndex) => {
    setSetDrag({ setId, fromIndex, toIndex: fromIndex });
  };

  const previewSetDrag = (setId, fromIndex, distance) => {
    const toIndex = Math.max(
      0,
      Math.min(currentSets.length - 1, fromIndex + Math.round(distance / 70))
    );

    setSetDrag(current =>
      current?.setId === setId && current.toIndex !== toIndex
        ? { ...current, toIndex }
        : current
    );
  };

  const endSetDrag = (setId, fromIndex, toIndex) => {
    setSetDrag(null);
    if (toIndex !== fromIndex) moveSet(setId, toIndex);
  };

  const deleteSet = setId => {
    if (isPaused) return;

    setSetsData(prev => ({
      ...prev,
      [currentExercise.id]: (prev[currentExercise.id] || []).filter(
        set => set.id !== setId
      ),
    }));
  };

  const openExerciseVideo = () => {
    if (!exerciseData) return;
    const search = encodeURIComponent(`${exerciseData.name} proper form tutorial`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${search}`);
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
      const now = localTimestamp();
      setExerciseTiming(prev => {
        const current = prev[currentExercise.id];
        if (!current) return prev;
        return {
          ...prev,
          [currentExercise.id]: {
            ...current,
            exerciseCompletedAt: now,
            exerciseDuration: exerciseTimes[currentExercise.id] || 0,
          },
        };
      });
      setCurrentExerciseIndex(
        prev => prev + 1
      );

      setIsResting(false);
      setRestTime(0);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      const now = localTimestamp();
      setExerciseTiming(prev => {
        const current = prev[currentExercise.id];
        if (!current) return prev;
        return {
          ...prev,
          [currentExercise.id]: {
            ...current,
            exerciseCompletedAt: now,
            exerciseDuration: exerciseTimes[currentExercise.id] || 0,
          },
        };
      });
      setCurrentExerciseIndex(
        prev => prev - 1
      );

      setIsResting(false);
      setRestTime(0);
    }
  };

  /*
    FINISH
  */

  const finishWorkout = async () => {
    finishingRef.current = true;
    setIsFinishing(true);
    setSessionReady(false);
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

    const skippedExercises = workout.exercises
      .filter(exercise => {
        const exerciseSets = setsData[exercise.id] || [];
        return !exerciseSets.some(
          set => set.completed && Number(set.reps) > 0
        );
      })
      .map(exercise => exercise.exerciseId);

    const completedAt = localTimestamp();
    const finalExerciseTiming = { ...exerciseTiming };
    const currentTiming = finalExerciseTiming[currentExercise.id];
    if (currentTiming) {
      finalExerciseTiming[currentExercise.id] = {
        ...currentTiming,
        exerciseCompletedAt: completedAt,
        exerciseDuration: exerciseTimes[currentExercise.id] || 0,
      };
    }

    const workoutData = {
      recordId,
      workoutId: workout.id,
      workoutName: workout.name,

      startedAt,
      completedAt,

      duration: workoutTime,

      exerciseTimes,

      exerciseTiming: finalExerciseTiming,

      workoutExercises: workout.exercises,

      setsData,

      skippedExercises,

      isCustom,

      totalSets,
      totalReps,
      totalVolume,
    };

    await removeData('activeWorkoutSession');
    await saveData('activeWorkoutSession', {
      status: 'completed',
      recordId,
      completedAt,
    });

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

        <View style={styles.exerciseNameRow}>
          <Text style={styles.exerciseName}>
            {exerciseData?.name ||
              currentExercise.exerciseId}
          </Text>
          <Pressable
            accessibilityLabel="Exercise instructions"
            style={styles.infoButton}
            onPress={() => setShowExerciseInfo(true)}
          >
            <Ionicons name="help" size={16} color="#000000" />
          </Pressable>
        </View>

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

      <View style={styles.setsHeader}>
        <Text style={styles.sectionTitle}>SETS</Text>
        <Pressable
          style={[styles.setsEditButton, setEditMode && styles.setsEditButtonActive]}
          onPress={() => {
            setSetEditMode(prev => !prev);
            setSetDrag(null);
          }}
        >
          <Ionicons
            name={setEditMode ? 'checkmark' : 'pencil'}
            size={15}
            color={setEditMode ? '#000000' : '#FFFFFF'}
          />
          <Text style={[styles.setsEditText, setEditMode && styles.setsEditTextActive]}>
            {setEditMode ? 'DONE' : 'EDIT'}
          </Text>
        </Pressable>
      </View>

      {currentSets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          setData={set}
          disabled={isPaused}
          onDone={completeSet}
          onEdit={editSet}
          onDelete={deleteSet}
          isEditing={setEditMode}
          dragState={setDrag}
          onDragStart={startSetDrag}
          onDragMove={previewSetDrag}
          onDragEnd={endSetDrag}
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

      <Modal
        visible={showExerciseInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExerciseInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exercise guide</Text>
              <Pressable
                style={styles.modalClose}
                accessibilityLabel="Close exercise guide"
                onPress={() => setShowExerciseInfo(false)}
              >
                <Ionicons name="close" size={22} color="#888888" />
              </Pressable>
            </View>
            <Text style={styles.guideExerciseName}>
              {exerciseData?.name || currentExercise.exerciseId}
            </Text>
            <Text style={styles.guideLabel}>TARGET MUSCLE</Text>
            <Text style={styles.guideText}>
              {exerciseData
                ? `${exerciseData.majorMuscle} — ${exerciseData.targetArea}`
                : 'Target information is unavailable.'}
            </Text>
            {exerciseData?.minorMuscles?.length > 0 && (
              <>
                <Text style={styles.guideLabel}>SECONDARY MUSCLES</Text>
                <Text style={styles.guideText}>
                  {exerciseData.minorMuscles.join(', ')}
                </Text>
              </>
            )}
            <Text style={styles.guideLabel}>HOW TO DO IT</Text>
            <Text style={styles.guideText}>
              {exerciseData?.description || 'Instructions are unavailable for this exercise.'}
            </Text>
            <Text style={styles.guideText}>
              Set up the {exerciseData?.equipment?.toLowerCase() || 'equipment'} securely, use a controlled full range of motion, and keep the target muscle under tension. Stop if you feel sharp pain.
            </Text>
            <Pressable style={styles.videoButton} onPress={openExerciseVideo}>
              <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
              <Text style={styles.videoButtonText}>WATCH PROPER FORM VIDEO</Text>
            </Pressable>
            <Pressable
              style={styles.closeGuideButton}
              onPress={() => setShowExerciseInfo(false)}
            >
              <Text style={styles.closeGuideText}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
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
  onEdit,
  onDelete,
  isEditing,
  dragState,
  onDragStart,
  onDragMove,
  onDragEnd,
}) {
  const [weight, setWeight] = useState(
    setData?.weight ? String(setData.weight) : ''
  );

  const [reps, setReps] = useState(
    setData?.reps ? String(setData.reps) : ''
  );

  const done = setData?.completed;
  const [isDragging, setIsDragging] = useState(false);
  const latestDragValues = useRef({});
  const scale = useRef(new Animated.Value(1)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const previewY = useRef(new Animated.Value(0)).current;
  const previewOffset =
    dragState && dragState.setId !== setData.id
      ? dragState.fromIndex < dragState.toIndex &&
        index > dragState.fromIndex &&
        index <= dragState.toIndex
        ? -70
        : dragState.toIndex < dragState.fromIndex &&
          index >= dragState.toIndex &&
          index < dragState.fromIndex
          ? 70
          : 0
      : 0;

  useEffect(() => {
    Animated.spring(previewY, {
      toValue: previewOffset,
      useNativeDriver: true,
    }).start();
  }, [previewOffset, previewY]);

  latestDragValues.current = {
    disabled,
    isEditing,
    setId: setData.id,
    index,
    dragState,
    onDragStart,
    onDragMove,
    onDragEnd,
  };
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        latestDragValues.current.isEditing && !latestDragValues.current.disabled,
      onMoveShouldSetPanResponder: (_, gesture) =>
        latestDragValues.current.isEditing &&
        !latestDragValues.current.disabled &&
        Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        dragY.setValue(0);
        setIsDragging(true);
        latestDragValues.current.onDragStart(
          latestDragValues.current.setId,
          latestDragValues.current.index
        );
        Animated.spring(scale, {
          toValue: 1.03,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        dragY.setValue(gesture.dy);
        latestDragValues.current.onDragMove(
          latestDragValues.current.setId,
          latestDragValues.current.index,
          gesture.dy
        );
      },
      onPanResponderRelease: (_, gesture) => {
        setIsDragging(false);
        const current = latestDragValues.current;
        const targetIndex =
          current.dragState?.setId === current.setId
            ? current.dragState.toIndex
            : current.index + Math.round(gesture.dy / 70);
        latestDragValues.current.onDragEnd(
          current.setId,
          current.index,
          targetIndex
        );
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        latestDragValues.current.onDragEnd(
          latestDragValues.current.setId,
          latestDragValues.current.index,
          latestDragValues.current.index
        );
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

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
    <Animated.View
      style={[
        styles.setRow,
        isDragging && styles.draggingSet,
        { transform: [{ translateY: isDragging ? dragY : previewY }, { scale }] },
      ]}
    >
      <View style={styles.setNumber}>
        <Text style={styles.setNumberText}>
          {index + 1}
        </Text>
      </View>

      <View style={styles.setType}>
        <Text style={styles.setTypeText}>
          {setData?.setType === 'warmup'
            ? 'W'
            : setData?.setType === 'drop'
              ? 'D'
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

      <View style={styles.setActions}>
        {isEditing ? (
          <>
            <View
              style={[styles.setActionButton, styles.dragHandle, disabled && styles.actionDisabled]}
              {...panResponder.panHandlers}
            >
              <Ionicons name="reorder-three" size={22} color="#777777" />
            </View>
            <Pressable
              style={[styles.deleteSetButton, disabled && styles.actionDisabled]}
              disabled={disabled}
              accessibilityLabel="Delete set"
              onPress={() => onDelete(setData.id)}
            >
              <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
            </Pressable>
          </>
        ) : done ? (
          <Pressable
            style={[styles.setActionButton, disabled && styles.actionDisabled]}
            disabled={disabled}
            accessibilityLabel="Edit completed set"
            onPress={() => onEdit(index)}
          >
            <Ionicons name="pencil" size={15} color="#000000" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.doneButton, styles.setActionButton]}
            disabled={disabled}
            onPress={() => onDone(index, weight, reps)}
          >
            <Text style={styles.doneText}>DONE</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
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
    flex: 1,
  },

  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  },

  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  setsEditButton: {
    alignItems: 'center',
    borderColor: '#333333',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  setsEditButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  setsEditText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  setsEditTextActive: {
    color: '#000000',
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

  draggingSet: {
    borderColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    zIndex: 10,
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
    margin: 0,
    padding: 0,
  },

  doneText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },

  setActions: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    height: 39,
    marginLeft: 5,
    gap: 5,
  },

  dragHandle: {
    backgroundColor: '#252525',
  },

  setActionButton: {
    alignSelf: 'center',
    margin: 0,
    padding: 0,
    width: 48,
    height: 39,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionDisabled: {
    opacity: 0.3,
  },

  deleteSetButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#402020',
    borderColor: '#703030',
    borderRadius: 8,
    borderWidth: 1,
    height: 39,
    justifyContent: 'center',
    width: 36,
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

  guideExerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
  },

  guideLabel: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 12,
  },

  guideText: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  videoButton: {
    alignItems: 'center',
    backgroundColor: '#CC0000',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 13,
  },

  videoButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  closeGuideButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 22,
    paddingVertical: 13,
  },

  closeGuideText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
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
