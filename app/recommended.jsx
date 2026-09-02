import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { recommendedWeeklySplit } from '../utils/workout';

const muscleMap = {
  Push: 'Chest • Shoulders • Triceps',
  Pull: 'Back • Biceps',
  Legs: 'Quads • Hamstrings • Glutes • Calves',
  Rest: 'Recovery',
};

export default function RecommendedScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Recommended Plan</Text>
          <Text style={styles.subtitle}>Your weekly workout split</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>WEEKLY PLAN</Text>

      {recommendedWeeklySplit.map(day => {
        const isRest = !day.workoutId;

        return (
          <Pressable
            key={day.day}
            style={styles.dayCard}
            onPress={() =>
              router.push({
                pathname: '/day-workout',
                params: {
                  workoutId: day.workoutId || '',
                  day: day.day,
                  workoutName: day.name,
                },
              })
            }
          >
            <View style={styles.dayCircle}>
              <Text style={styles.dayCircleText}>
                {day.day.substring(0, 1)}
              </Text>
            </View>

            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{day.day}</Text>

              <Text style={styles.workoutName}>
                {day.name}
              </Text>

              <Text style={styles.muscles}>
                {muscleMap[day.name] || 'Workout'}
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>
          </Pressable>
        );
      })}
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
    paddingTop: 55,
    paddingBottom: 60,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
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
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    color: '#777777',
    fontSize: 14,
    marginTop: 4,
  },

  sectionTitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 12,
  },

  dayCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dayCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  dayCircleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  dayInfo: {
    flex: 1,
  },

  dayName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  workoutName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 3,
  },

  muscles: {
    color: '#666666',
    fontSize: 11,
    marginTop: 5,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
  },
});