// Create a workout
export const createWorkout = (name = 'My Workout') => {
  return {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    exercises: [],
  };
};

// Create an exercise inside a workout
export const createWorkoutExercise = (
  exerciseId,
  sets = 3,
  reps = '8-12',
  rest = 90
) => {
  return {
    id: `${exerciseId}-${Date.now()}-${Math.random()}`,
    exerciseId,
    sets,
    reps,
    rest,
  };
};

// Create an actual performed set
export const createSet = (weight = 0, reps = 0) => {
  return {
    id: `${Date.now()}-${Math.random()}`,
    weight,
    reps,
    completed: false,
  };
};

// ─── RECOMMENDED WORKOUTS ──────────────────────────────────────────────

export const recommendedWorkouts = {
  // PUSH A
  'push-a': {
    id: 'push-a',
    name: 'Push A',
    exercises: [
      createWorkoutExercise('chest-01', 3, '6-10', 120), // Barbell Bench Press
      createWorkoutExercise('chest-05', 3, '8-12', 90),  // Incline Dumbbell Press
      createWorkoutExercise('chest-09', 3, '10-15', 60), // Cable Fly
      createWorkoutExercise('shoulders-02', 3, '8-12', 90), // Dumbbell Shoulder Press
      createWorkoutExercise('shoulders-05', 3, '10-20', 60), // Cable Lateral Raise
      createWorkoutExercise('triceps-02', 3, '10-15', 60), // Rope Tricep Pushdown
      createWorkoutExercise('triceps-04', 3, '10-15', 60), // Overhead Cable Extension
    ],
  },
  // PUSH B
  'push-b': {
    id: 'push-b',
    name: 'Push B',
    exercises: [
      createWorkoutExercise('chest-02', 3, '6-10', 120), // Incline Barbell Bench Press
      createWorkoutExercise('chest-07', 3, '8-12', 90),  // Machine Chest Press
      createWorkoutExercise('chest-14', 3, '10-15', 60), // Pec Deck
      createWorkoutExercise('shoulders-06', 3, '8-12', 90), // Machine Shoulder Press (use lateral raise machine? actually we use shoulders-06 as Machine Lateral Raise, but the user wants Machine Shoulder Press. I'll use shoulders-02 as it's a press)
      // Actually Machine Shoulder Press doesn't exist, so I'll use Seated Dumbbell Shoulder Press (shoulders-02) as the primary and change the alternative to something else.
      // I'll change to shoulders-02 for primary.
      // But to match user's intent, I'll use shoulders-02 for both Push A and B? No, Push A already has shoulders-02. I'll use shoulders-01 for variety.
      // I'll use shoulders-01 (Barbell Overhead Press) for Push B.
      // Let me adjust: Push B has Machine Shoulder Press -> I'll use shoulders-01 as a substitute.
      // I'll use shoulders-01 for Push B.
      // Actually I'll just keep shoulders-02 for both but it's fine.
      // Let me just use shoulders-02 for Push B as well.
      createWorkoutExercise('shoulders-02', 3, '8-12', 90), // Seated Dumbbell Shoulder Press (simulating machine)
      createWorkoutExercise('shoulders-04', 3, '10-20', 60), // Dumbbell Lateral Raise
      createWorkoutExercise('shoulders-15', 3, '12-20', 60), // Cable Rear-Delt Fly
      createWorkoutExercise('triceps-01', 3, '10-15', 60), // Cable Pushdown
      createWorkoutExercise('triceps-03', 3, '10-15', 60), // Overhead Dumbbell Extension
    ],
  },
  // PULL A
  'pull-a': {
    id: 'pull-a',
    name: 'Pull A',
    exercises: [
      createWorkoutExercise('back-07', 3, '8-12', 90),  // Lat Pulldown
      createWorkoutExercise('back-05', 3, '8-12', 90),  // Chest-Supported Row
      createWorkoutExercise('back-04', 3, '8-12', 90),  // Seated Cable Row
      createWorkoutExercise('shoulders-10', 3, '10-20', 60), // Reverse Pec Deck
      createWorkoutExercise('biceps-06', 3, '8-12', 90), // Incline Dumbbell Curl
      createWorkoutExercise('biceps-05', 3, '8-15', 60), // Hammer Curl
    ],
  },
  // PULL B
  'pull-b': {
    id: 'pull-b',
    name: 'Pull B',
    exercises: [
      createWorkoutExercise('back-10', 3, '5-12', 90),  // Pull-Up
      createWorkoutExercise('back-06', 3, '8-12', 90),  // One-Arm Dumbbell Row
      createWorkoutExercise('back-09', 3, '8-12', 90),  // Neutral-Grip Lat Pulldown
      createWorkoutExercise('back-14', 3, '8-12', 90),  // Machine Row
      createWorkoutExercise('shoulders-11', 3, '12-20', 60), // Face Pull
      createWorkoutExercise('biceps-02', 3, '8-12', 90), // EZ-Bar Curl
      createWorkoutExercise('biceps-08', 3, '10-15', 60), // Cable Curl
    ],
  },
  // LEGS A
  'legs-a': {
    id: 'legs-a',
    name: 'Legs A',
    exercises: [
      createWorkoutExercise('quads-01', 3, '5-10', 120), // Barbell Squat
      createWorkoutExercise('quads-03', 3, '8-15', 90),  // Leg Press
      createWorkoutExercise('quads-04', 3, '10-15', 60), // Leg Extension
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift
      createWorkoutExercise('hamstrings-03', 3, '10-15', 60), // Lying Leg Curl
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('calves-01', 4, '10-20', 60), // Standing Calf Raise
    ],
  },
  // LEGS B
  'legs-b': {
    id: 'legs-b',
    name: 'Legs B',
    exercises: [
      createWorkoutExercise('quads-09', 3, '5-10', 120), // Hack Squat
      createWorkoutExercise('quads-05', 3, '8-12', 90),  // Bulgarian Split Squat
      createWorkoutExercise('quads-04', 3, '10-15', 60), // Leg Extension (duplicate but fine)
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift (can use Good Morning but RDL is fine)
      createWorkoutExercise('hamstrings-04', 3, '10-15', 60), // Seated Leg Curl
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('calves-02', 4, '10-20', 60), // Seated Calf Raise
    ],
  },
  // UPPER A
  'upper-a': {
    id: 'upper-a',
    name: 'Upper A',
    exercises: [
      createWorkoutExercise('chest-01', 3, '6-10', 120), // Barbell Bench Press
      createWorkoutExercise('back-07', 3, '8-12', 90),  // Lat Pulldown
      createWorkoutExercise('chest-05', 3, '8-12', 90),  // Incline Dumbbell Press
      createWorkoutExercise('back-05', 3, '8-12', 90),  // Chest-Supported Row
      createWorkoutExercise('shoulders-05', 3, '10-20', 60), // Cable Lateral Raise
      createWorkoutExercise('shoulders-10', 3, '10-20', 60), // Reverse Pec Deck
      createWorkoutExercise('triceps-02', 3, '10-15', 60), // Rope Pushdown
      createWorkoutExercise('biceps-06', 3, '8-12', 90), // Incline Dumbbell Curl
    ],
  },
  // UPPER B
  'upper-b': {
    id: 'upper-b',
    name: 'Upper B',
    exercises: [
      createWorkoutExercise('chest-02', 3, '6-10', 120), // Incline Barbell Press
      createWorkoutExercise('back-10', 3, '5-12', 90),  // Pull-Up
      createWorkoutExercise('chest-07', 3, '8-12', 90),  // Machine Chest Press
      createWorkoutExercise('back-04', 3, '8-12', 90),  // Seated Cable Row
      createWorkoutExercise('shoulders-04', 3, '10-20', 60), // Dumbbell Lateral Raise
      createWorkoutExercise('shoulders-09', 3, '10-20', 60), // Rear-Delt Fly
      createWorkoutExercise('triceps-04', 3, '10-15', 60), // Overhead Cable Extension
      createWorkoutExercise('biceps-05', 3, '8-15', 60), // Hammer Curl
    ],
  },
  // LOWER A
  'lower-a': {
    id: 'lower-a',
    name: 'Lower A',
    exercises: [
      createWorkoutExercise('quads-01', 3, '5-10', 120), // Barbell Squat
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift
      createWorkoutExercise('quads-03', 3, '8-15', 90),  // Leg Press
      createWorkoutExercise('hamstrings-03', 3, '10-15', 60), // Lying Leg Curl
      createWorkoutExercise('quads-04', 3, '10-15', 60), // Leg Extension
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('calves-01', 4, '10-20', 60), // Standing Calf Raise
    ],
  },
  // LOWER B
  'lower-b': {
    id: 'lower-b',
    name: 'Lower B',
    exercises: [
      createWorkoutExercise('quads-09', 3, '5-10', 120), // Hack Squat
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift (could use Good Morning but RDL is fine)
      createWorkoutExercise('quads-05', 3, '8-12', 90),  // Bulgarian Split Squat
      createWorkoutExercise('hamstrings-04', 3, '10-15', 60), // Seated Leg Curl
      createWorkoutExercise('quads-04', 3, '10-15', 60), // Leg Extension (duplicate but okay)
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('calves-02', 4, '10-20', 60), // Seated Calf Raise
    ],
  },
  // FULL BODY A
  'full-a': {
    id: 'full-a',
    name: 'Full Body A',
    exercises: [
      createWorkoutExercise('quads-01', 3, '5-10', 120), // Barbell Squat
      createWorkoutExercise('chest-01', 3, '6-10', 120), // Bench Press
      createWorkoutExercise('back-07', 3, '8-12', 90),  // Lat Pulldown
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift
      createWorkoutExercise('shoulders-05', 3, '10-20', 60), // Cable Lateral Raise
      createWorkoutExercise('triceps-02', 3, '10-15', 60), // Rope Pushdown
      createWorkoutExercise('biceps-03', 3, '8-12', 90), // Dumbbell Curl
    ],
  },
  // FULL BODY B
  'full-b': {
    id: 'full-b',
    name: 'Full Body B',
    exercises: [
      createWorkoutExercise('quads-03', 3, '8-15', 90),  // Leg Press
      createWorkoutExercise('chest-05', 3, '8-12', 90),  // Incline Dumbbell Press
      createWorkoutExercise('back-04', 3, '8-12', 90),  // Seated Cable Row
      createWorkoutExercise('hamstrings-04', 3, '10-15', 60), // Seated Leg Curl
      createWorkoutExercise('shoulders-04', 3, '10-20', 60), // Dumbbell Lateral Raise
      createWorkoutExercise('triceps-04', 3, '10-15', 60), // Overhead Cable Extension
      createWorkoutExercise('biceps-05', 3, '8-15', 60), // Hammer Curl
    ],
  },
  // FULL BODY C
  'full-c': {
    id: 'full-c',
    name: 'Full Body C',
    exercises: [
      createWorkoutExercise('quads-09', 3, '5-10', 120), // Hack Squat
      createWorkoutExercise('chest-07', 3, '8-12', 90),  // Machine Chest Press
      createWorkoutExercise('back-10', 3, '5-12', 90),  // Pull-Up
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('shoulders-10', 3, '10-20', 60), // Reverse Pec Deck
      createWorkoutExercise('biceps-08', 3, '10-15', 60), // Cable Curl
      createWorkoutExercise('calves-01', 4, '10-20', 60), // Standing Calf Raise
    ],
  },
  // BRO CHEST
  'bro-chest': {
    id: 'bro-chest',
    name: 'Chest',
    exercises: [
      createWorkoutExercise('chest-01', 3, '6-10', 120), // Barbell Bench Press
      createWorkoutExercise('chest-05', 3, '8-12', 90),  // Incline Dumbbell Press
      createWorkoutExercise('chest-07', 3, '8-12', 90),  // Machine Chest Press
      createWorkoutExercise('chest-09', 3, '10-15', 60), // Cable Fly
      createWorkoutExercise('chest-10', 3, '10-15', 60), // Low Cable Fly
    ],
  },
  // BRO BACK
  'bro-back': {
    id: 'bro-back',
    name: 'Back',
    exercises: [
      createWorkoutExercise('back-10', 3, '5-12', 90),  // Pull-Up
      createWorkoutExercise('back-05', 3, '8-12', 90),  // Chest-Supported Row
      createWorkoutExercise('back-06', 3, '8-12', 90),  // One-Arm Dumbbell Row
      createWorkoutExercise('back-04', 3, '8-12', 90),  // Seated Cable Row
      createWorkoutExercise('back-13', 3, '10-15', 60), // Straight-Arm Pulldown
    ],
  },
  // BRO SHOULDERS
  'bro-shoulders': {
    id: 'bro-shoulders',
    name: 'Shoulders',
    exercises: [
      createWorkoutExercise('shoulders-02', 3, '8-12', 90), // Dumbbell Shoulder Press
      createWorkoutExercise('shoulders-05', 3, '10-20', 60), // Cable Lateral Raise
      createWorkoutExercise('shoulders-06', 3, '10-20', 60), // Machine Lateral Raise
      createWorkoutExercise('shoulders-10', 3, '10-20', 60), // Reverse Pec Deck
      createWorkoutExercise('shoulders-09', 3, '10-20', 60), // Rear-Delt Dumbbell Fly
      createWorkoutExercise('shoulders-05', 3, '10-20', 60), // Lean-Away Cable Lateral Raise (use cable lateral raise)
    ],
  },
  // BRO ARMS
  'bro-arms': {
    id: 'bro-arms',
    name: 'Arms',
    exercises: [
      createWorkoutExercise('biceps-02', 3, '8-12', 90), // EZ-Bar Curl
      createWorkoutExercise('biceps-06', 3, '8-12', 90), // Incline Dumbbell Curl
      createWorkoutExercise('biceps-05', 3, '8-15', 60), // Hammer Curl
      createWorkoutExercise('triceps-02', 3, '10-15', 60), // Rope Pushdown
      createWorkoutExercise('triceps-04', 3, '10-15', 60), // Overhead Cable Extension
      createWorkoutExercise('triceps-09', 3, '10-15', 60), // Single-Arm Cable Extension
    ],
  },
  // BRO LEGS
  'bro-legs': {
    id: 'bro-legs',
    name: 'Legs',
    exercises: [
      createWorkoutExercise('quads-01', 3, '5-10', 120), // Barbell Squat
      createWorkoutExercise('quads-03', 3, '8-15', 90),  // Leg Press
      createWorkoutExercise('quads-04', 3, '10-15', 60), // Leg Extension
      createWorkoutExercise('hamstrings-01', 3, '6-12', 90), // Romanian Deadlift
      createWorkoutExercise('hamstrings-04', 3, '10-15', 60), // Seated Leg Curl
      createWorkoutExercise('glutes-01', 3, '8-12', 90), // Hip Thrust
      createWorkoutExercise('calves-01', 4, '10-20', 60), // Standing Calf Raise
      createWorkoutExercise('calves-02', 4, '10-20', 60), // Seated Calf Raise
    ],
  },
};

// ─── SPLIT DEFINITIONS ──────────────────────────────────────────────

export const recommendedSplits = {
  ppl: {
    id: 'split-ppl',
    name: 'Push / Pull / Legs',
    description: '6-day PPL split for balanced upper/lower development.',
    days: 6,
    workouts: [
      { day: 'Monday', workoutId: 'push-a', name: 'Push A' },
      { day: 'Tuesday', workoutId: 'pull-a', name: 'Pull A' },
      { day: 'Wednesday', workoutId: 'legs-a', name: 'Legs A' },
      { day: 'Thursday', workoutId: 'push-b', name: 'Push B' },
      { day: 'Friday', workoutId: 'pull-b', name: 'Pull B' },
      { day: 'Saturday', workoutId: 'legs-b', name: 'Legs B' },
      { day: 'Sunday', workoutId: null, name: 'Rest' },
    ],
  },
  upperlower: {
    id: 'split-upperlower',
    name: 'Upper / Lower',
    description: '4-day upper/lower split for balanced training.',
    days: 4,
    workouts: [
      { day: 'Monday', workoutId: 'upper-a', name: 'Upper A' },
      { day: 'Tuesday', workoutId: 'lower-a', name: 'Lower A' },
      { day: 'Wednesday', workoutId: null, name: 'Rest' },
      { day: 'Thursday', workoutId: 'upper-b', name: 'Upper B' },
      { day: 'Friday', workoutId: 'lower-b', name: 'Lower B' },
      { day: 'Saturday', workoutId: null, name: 'Rest' },
      { day: 'Sunday', workoutId: null, name: 'Rest' },
    ],
  },
  fullbody: {
    id: 'split-fullbody',
    name: 'Full Body',
    description: '3-day full-body split for complete muscle engagement.',
    days: 3,
    workouts: [
      { day: 'Monday', workoutId: 'full-a', name: 'Full Body A' },
      { day: 'Tuesday', workoutId: null, name: 'Rest' },
      { day: 'Wednesday', workoutId: 'full-b', name: 'Full Body B' },
      { day: 'Thursday', workoutId: null, name: 'Rest' },
      { day: 'Friday', workoutId: 'full-c', name: 'Full Body C' },
      { day: 'Saturday', workoutId: null, name: 'Rest' },
      { day: 'Sunday', workoutId: null, name: 'Rest' },
    ],
  },
  brosplit: {
    id: 'split-brosplit',
    name: 'Bro Split',
    description: '5-day body-part split for focused muscle development.',
    days: 5,
    workouts: [
      { day: 'Monday', workoutId: 'bro-chest', name: 'Chest' },
      { day: 'Tuesday', workoutId: 'bro-back', name: 'Back' },
      { day: 'Wednesday', workoutId: 'bro-shoulders', name: 'Shoulders' },
      { day: 'Thursday', workoutId: 'bro-arms', name: 'Arms' },
      { day: 'Friday', workoutId: 'bro-legs', name: 'Legs' },
      { day: 'Saturday', workoutId: null, name: 'Rest' },
      { day: 'Sunday', workoutId: null, name: 'Rest' },
    ],
  },
};

// ─── LEGACY WEEKLY SPLIT ──────────────────────────────────────────────

export const recommendedWeeklySplit = [
  { day: 'Monday', workoutId: 'push-a', name: 'Push A' },
  { day: 'Tuesday', workoutId: 'pull-a', name: 'Pull A' },
  { day: 'Wednesday', workoutId: 'legs-a', name: 'Legs A' },
  { day: 'Thursday', workoutId: 'push-b', name: 'Push B' },
  { day: 'Friday', workoutId: 'pull-b', name: 'Pull B' },
  { day: 'Saturday', workoutId: 'legs-b', name: 'Legs B' },
  { day: 'Sunday', workoutId: null, name: 'Rest' },
];

// ─── EXERCISE ALTERNATIVES ────────────────────────────────────────────

import { exercises } from './exercises';

export const alternativeMap = {
  // Chest
  'chest-01': ['chest-04', 'chest-07', 'chest-09'], // Barbell Bench Press -> Dumbbell Bench, Machine Press, Cable Fly
  'chest-02': ['chest-05', 'chest-08', 'chest-10'], // Incline Barbell -> Incline Dumbbell, Incline Machine, Low Cable Fly
  'chest-03': ['chest-06', 'chest-11', 'chest-17'], // Decline
  'chest-04': ['chest-01', 'chest-07', 'chest-12'],
  'chest-05': ['chest-02', 'chest-08', 'chest-13'],
  'chest-06': ['chest-03', 'chest-11', 'chest-17'],
  'chest-07': ['chest-01', 'chest-04', 'chest-14'],
  'chest-08': ['chest-02', 'chest-05', 'chest-13'],
  'chest-09': ['chest-12', 'chest-14', 'chest-10'],
  'chest-10': ['chest-09', 'chest-13', 'chest-02'],
  'chest-11': ['chest-09', 'chest-06', 'chest-03'],
  'chest-12': ['chest-09', 'chest-14', 'chest-04'],
  'chest-13': ['chest-10', 'chest-05', 'chest-02'],
  'chest-14': ['chest-09', 'chest-12', 'chest-07'],
  'chest-15': ['chest-16', 'chest-17', 'chest-01'],
  'chest-16': ['chest-15', 'chest-17', 'chest-01'],
  'chest-17': ['chest-03', 'chest-06', 'chest-15'],
  'chest-18': ['chest-02', 'chest-05', 'chest-08'],
  'chest-19': ['chest-12', 'chest-09', 'chest-14'],
  'chest-20': ['back-17', 'chest-12', 'chest-09'],

  // Back
  'back-01': ['back-02', 'back-03', 'back-04'],
  'back-02': ['back-01', 'back-03', 'back-04'],
  'back-03': ['back-01', 'back-02', 'back-14'],
  'back-04': ['back-01', 'back-14', 'back-15'],
  'back-05': ['back-04', 'back-14', 'back-01'],
  'back-06': ['back-15', 'back-01', 'back-04'],
  'back-07': ['back-08', 'back-09', 'back-10'],
  'back-08': ['back-07', 'back-09', 'back-10'],
  'back-09': ['back-07', 'back-08', 'back-12'],
  'back-10': ['back-11', 'back-07', 'back-12'],
  'back-11': ['back-10', 'back-07', 'back-12'],
  'back-12': ['back-10', 'back-11', 'back-07'],
  'back-13': ['back-07', 'back-15', 'back-06'],
  'back-14': ['back-04', 'back-05', 'back-01'],
  'back-15': ['back-06', 'back-04', 'back-14'],
  'back-16': ['back-01', 'back-04', 'back-06'],
  'back-17': ['chest-20', 'back-06', 'back-13'],
  'back-18': ['back-01', 'back-19', 'back-02'],
  'back-19': ['back-18', 'quads-01', 'hamstrings-01'],
  'back-20': ['back-01', 'back-04', 'back-06'],

  // Shoulders
  'shoulders-01': ['shoulders-02', 'shoulders-03', 'shoulders-07'],
  'shoulders-02': ['shoulders-01', 'shoulders-03', 'shoulders-07'],
  'shoulders-03': ['shoulders-01', 'shoulders-02', 'shoulders-07'],
  'shoulders-04': ['shoulders-05', 'shoulders-06', 'shoulders-12'],
  'shoulders-05': ['shoulders-04', 'shoulders-06', 'shoulders-12'],
  'shoulders-06': ['shoulders-04', 'shoulders-05', 'shoulders-12'],
  'shoulders-07': ['shoulders-08', 'shoulders-01', 'shoulders-02'],
  'shoulders-08': ['shoulders-07', 'shoulders-01', 'shoulders-02'],
  'shoulders-09': ['shoulders-10', 'shoulders-11', 'shoulders-15'],
  'shoulders-10': ['shoulders-09', 'shoulders-11', 'shoulders-15'],
  'shoulders-11': ['shoulders-09', 'shoulders-10', 'shoulders-15'],
  'shoulders-12': ['shoulders-04', 'shoulders-05', 'shoulders-06'],
  'shoulders-13': ['shoulders-14', 'shoulders-11', 'shoulders-09'],
  'shoulders-14': ['shoulders-13', 'shoulders-11', 'shoulders-09'],
  'shoulders-15': ['shoulders-09', 'shoulders-10', 'shoulders-11'],

  // Biceps
  'biceps-01': ['biceps-02', 'biceps-03', 'biceps-08'],
  'biceps-02': ['biceps-01', 'biceps-03', 'biceps-08'],
  'biceps-03': ['biceps-04', 'biceps-05', 'biceps-06'],
  'biceps-04': ['biceps-03', 'biceps-05', 'biceps-06'],
  'biceps-05': ['biceps-03', 'biceps-06', 'biceps-08'],
  'biceps-06': ['biceps-03', 'biceps-07', 'biceps-09'],
  'biceps-07': ['biceps-06', 'biceps-01', 'biceps-08'],
  'biceps-08': ['biceps-01', 'biceps-03', 'biceps-09'],
  'biceps-09': ['biceps-08', 'biceps-06', 'biceps-07'],
  'biceps-10': ['biceps-03', 'biceps-04', 'biceps-05'],
  'biceps-11': ['biceps-06', 'biceps-07', 'biceps-10'],
  'biceps-12': ['forearms-04', 'biceps-05', 'biceps-03'],

  // Triceps
  'triceps-01': ['triceps-02', 'triceps-09', 'triceps-05'],
  'triceps-02': ['triceps-01', 'triceps-09', 'triceps-05'],
  'triceps-03': ['triceps-04', 'triceps-05', 'triceps-01'],
  'triceps-04': ['triceps-03', 'triceps-05', 'triceps-01'],
  'triceps-05': ['triceps-03', 'triceps-04', 'triceps-06'],
  'triceps-06': ['triceps-01', 'triceps-05', 'chest-01'],
  'triceps-07': ['triceps-01', 'triceps-02', 'chest-17'],
  'triceps-08': ['triceps-03', 'triceps-04', 'triceps-05'],
  'triceps-09': ['triceps-01', 'triceps-02', 'triceps-05'],
  'triceps-10': ['triceps-01', 'triceps-07', 'chest-15'],

  // Quads
  'quads-01': ['quads-02', 'quads-03', 'quads-09'],
  'quads-02': ['quads-01', 'quads-03', 'quads-10'],
  'quads-03': ['quads-01', 'quads-02', 'quads-10'],
  'quads-04': ['quads-05', 'quads-08', 'quads-03'],
  'quads-05': ['quads-04', 'quads-08', 'quads-06'],
  'quads-06': ['quads-05', 'quads-07', 'quads-08'],
  'quads-07': ['quads-06', 'quads-05', 'quads-08'],
  'quads-08': ['quads-04', 'quads-05', 'quads-06'],
  'quads-09': ['quads-01', 'quads-02', 'quads-03'],
  'quads-10': ['quads-01', 'quads-02', 'quads-09'],
  'quads-11': ['quads-06', 'quads-07', 'quads-05'],
  'quads-12': ['quads-04', 'quads-08', 'quads-05'],

  // Hamstrings
  'hamstrings-01': ['hamstrings-02', 'hamstrings-05', 'hamstrings-03'],
  'hamstrings-02': ['hamstrings-01', 'hamstrings-05', 'hamstrings-03'],
  'hamstrings-03': ['hamstrings-04', 'hamstrings-07', 'hamstrings-01'],
  'hamstrings-04': ['hamstrings-03', 'hamstrings-07', 'hamstrings-01'],
  'hamstrings-05': ['hamstrings-01', 'hamstrings-02', 'hamstrings-03'],
  'hamstrings-06': ['hamstrings-03', 'hamstrings-04', 'hamstrings-01'],
  'hamstrings-07': ['hamstrings-03', 'hamstrings-04', 'hamstrings-01'],

  // Glutes
  'glutes-01': ['glutes-02', 'glutes-03', 'glutes-05'],
  'glutes-02': ['glutes-01', 'glutes-03', 'glutes-05'],
  'glutes-03': ['glutes-01', 'glutes-02', 'glutes-05'],
  'glutes-04': ['glutes-08', 'glutes-09', 'glutes-01'],
  'glutes-05': ['glutes-01', 'glutes-03', 'glutes-02'],
  'glutes-06': ['glutes-07', 'quads-05', 'quads-06'],
  'glutes-07': ['glutes-06', 'quads-05', 'quads-06'],
  'glutes-08': ['glutes-09', 'glutes-04', 'glutes-01'],
  'glutes-09': ['glutes-08', 'glutes-04', 'glutes-01'],

  // Calves
  'calves-01': ['calves-02', 'calves-03', 'calves-04'],
  'calves-02': ['calves-01', 'calves-03', 'calves-05'],
  'calves-03': ['calves-01', 'calves-02', 'calves-04'],
  'calves-04': ['calves-01', 'calves-03', 'calves-05'],
  'calves-05': ['calves-01', 'calves-02', 'calves-03'],
};

export const getAlternatives = (exerciseId) => {
  const ids = alternativeMap[exerciseId] || [];
  return ids
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean);
};