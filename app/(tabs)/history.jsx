import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from 'expo-router';

import { getData } from '../../utils/storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const data =
      (await getData('workoutHistory')) || [];

    setHistory(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = date => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>History</Text>

      <Text style={styles.subtitle}>
        Your completed workouts
      </Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No workouts yet
          </Text>

          <Text style={styles.emptyText}>
            Complete your first workout and it will
            appear here.
          </Text>
        </View>
      ) : (
        history.map(workout => (
          <View
            key={workout.id}
            style={styles.card}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.workoutName}>
                  {workout.name}
                </Text>

                <Text style={styles.date}>
                  {formatDate(workout.date)}
                </Text>
              </View>

              <Text style={styles.duration}>
                {formatTime(workout.duration)}
              </Text>
            </View>

            <View style={styles.stats}>
              <Text style={styles.stat}>
                {workout.totalSets} Sets
              </Text>

              <Text style={styles.stat}>
                {workout.totalReps} Reps
              </Text>

              <Text style={styles.stat}>
                {workout.totalVolume} kg
              </Text>
            </View>
          </View>
        ))
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

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    color: '#888888',
    marginTop: 5,
    marginBottom: 25,
  },

  emptyCard: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  emptyText: {
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },

  card: {
    backgroundColor: '#151515',
    borderRadius: 17,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  workoutName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  date: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },

  duration: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  stats: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },

  stat: {
    color: '#888888',
    fontSize: 12,
  },
});