import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function DayWorkoutScreen() {
  const { workoutId, day, workoutName } = useLocalSearchParams();

  useEffect(() => {
    if (workoutId) {
      router.replace({
        pathname: '/selected-day',
        params: { workoutId, day, workoutName },
      });
    }
  }, [workoutId, day, workoutName]);

  if (!workoutId) {
    return (
      <View style={styles.container}>
        <Text style={styles.restDay}>REST DAY</Text>
        <Text style={styles.restDayLabel}>{day}</Text>
        <Text style={styles.restText}>Recovery is part of the workout.</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restDay: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  restDayLabel: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  restText: {
    color: '#777777',
    marginTop: 8,
  },
});
