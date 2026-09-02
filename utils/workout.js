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


// ===============================
// RECOMMENDED WORKOUTS
// ===============================

export const recommendedWorkouts = {
  push: {
    id: 'recommended-push',
    name: 'Push',

    exercises: [
      createWorkoutExercise('chest-01', 3, '6-10', 120),
      createWorkoutExercise('chest-02', 3, '8-12', 90),
      createWorkoutExercise('chest-03', 3, '10-15', 60),

      createWorkoutExercise('shoulders-01', 3, '8-12', 90),
      createWorkoutExercise('shoulders-02', 3, '12-15', 60),

      createWorkoutExercise('triceps-01', 3, '10-15', 60),
    ],
  },


  pull: {
    id: 'recommended-pull',
    name: 'Pull',

    exercises: [
      createWorkoutExercise('back-01', 3, '6-10', 120),
      createWorkoutExercise('back-02', 3, '8-12', 90),
      createWorkoutExercise('back-03', 3, '8-12', 90),
      createWorkoutExercise('back-04', 3, '10-15', 60),

      createWorkoutExercise('biceps-01', 3, '8-12', 90),
      createWorkoutExercise('biceps-02', 3, '10-15', 60),
    ],
  },


  legs: {
    id: 'recommended-legs',
    name: 'Legs',

    exercises: [
      createWorkoutExercise('quads-01', 3, '6-10', 120),
      createWorkoutExercise('quads-02', 3, '8-12', 90),

      createWorkoutExercise('hamstrings-01', 3, '8-12', 90),
      createWorkoutExercise('hamstrings-02', 3, '10-15', 60),

      createWorkoutExercise('glutes-01', 3, '8-12', 90),

      createWorkoutExercise('calves-01', 4, '10-15', 60),
    ],
  },
};


// ===============================
// WEEKLY SPLIT
// ===============================

export const recommendedWeeklySplit = [
  {
    day: 'Monday',
    workoutId: 'recommended-push',
    name: 'Push',
  },

  {
    day: 'Tuesday',
    workoutId: 'recommended-pull',
    name: 'Pull',
  },

  {
    day: 'Wednesday',
    workoutId: null,
    name: 'Rest',
  },

  {
    day: 'Thursday',
    workoutId: 'recommended-legs',
    name: 'Legs',
  },

  {
    day: 'Friday',
    workoutId: 'recommended-push',
    name: 'Push',
  },

  {
    day: 'Saturday',
    workoutId: 'recommended-pull',
    name: 'Pull',
  },

  {
    day: 'Sunday',
    workoutId: null,
    name: 'Rest',
  },
];