import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { saveData, getData } from '../utils/storage';

export default function WorkoutSummaryScreen() {
  const { workoutData } = useLocalSearchParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!workoutData) return;

    try {
      const parsed = JSON.parse(workoutData);

      setData(parsed);

      saveHistory(parsed);
    } catch (error) {
      console.log(
        'Summary parsing error:',
        error
      );
    }
  }, [workoutData]);

  const saveHistory = async workout => {
    const oldHistory =
      (await getData('workoutHistory')) || [];

    const historyItem = {
      id: Date.now().toString(),

      workoutId: workout.workoutId,

      workoutName: workout.workoutName,

      date: new Date().toISOString(),

      duration: workout.duration || 0,

      exerciseTimes:
        workout.exerciseTimes || {},

      workoutExercises:
        workout.workoutExercises || [],

      setsData:
        workout.setsData || {},

      skippedExercises:
        workout.skippedExercises || [],

      isCustom:
        workout.isCustom || false,

      totalSets:
        workout.totalSets || 0,

      totalReps:
        workout.totalReps || 0,

      totalVolume:
        workout.totalVolume || 0,
    };

    await saveData(
      'workoutHistory',
      [historyItem, ...oldHistory]
    );
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>
          Loading summary...
        </Text>
      </View>
    );
  }

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.complete}>
        WORKOUT COMPLETE
      </Text>

      <Text style={styles.title}>
        {data.workoutName}
      </Text>

      <View style={styles.mainTime}>
        <Text style={styles.timeLabel}>
          TOTAL WORKOUT TIME
        </Text>

        <Text style={styles.time}>
          {formatTime(data.duration || 0)}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.totalSets || 0}
          </Text>

          <Text style={styles.statLabel}>
            SETS
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.totalReps || 0}
          </Text>

          <Text style={styles.statLabel}>
            REPS
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.totalVolume || 0}
          </Text>

          <Text style={styles.statLabel}>
            KG VOLUME
          </Text>
        </View>
      </View>

      {data.skippedExercises?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            SKIPPED EXERCISES
          </Text>

          <Text style={styles.cardText}>
            {data.skippedExercises.length} exercise(s)
            skipped
          </Text>
        </View>
      )}

      <Pressable
        style={styles.historyButton}
        onPress={() => router.replace('/history')}
      >
        <Text style={styles.historyText}>
          VIEW HISTORY
        </Text>
      </Pressable>

      <Pressable
        style={styles.doneButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.doneText}>
          DONE
        </Text>
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
    paddingTop: 70,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loading: {
    color: '#FFFFFF',
  },

  complete: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },

  mainTime: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#252525',
  },

  timeLabel: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '700',
  },

  time: {
    color: '#FFFFFF',
    fontSize: 43,
    fontWeight: '700',
    marginTop: 7,
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  statLabel: {
    color: '#666666',
    fontSize: 9,
    marginTop: 4,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#151515',
    borderRadius: 15,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  cardText: {
    color: '#777777',
    marginTop: 6,
    fontSize: 12,
  },

  historyButton: {
    backgroundColor: '#151515',
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },

  historyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  doneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 10,
  },

  doneText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});