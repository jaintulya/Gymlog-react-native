import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { recommendedSplits } from '../utils/workout';

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

export default function RecommendedScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View>
          <Text style={styles.title}>Recommended</Text>
          <Text style={styles.subtitle}>Choose your weekly split</Text>
        </View>
      </View>

      {/* SPLIT CARDS */}
      {Object.values(recommendedSplits).map(split => {
        const muscles = splitMuscles[split.id] || [];
        const muscleText = muscles.slice(0, 6).join(' · ') + (muscles.length > 6 ? ' ...' : '');

        return (
          <Pressable
            key={split.id}
            style={styles.splitCard}
            onPress={() =>
              router.push({
                pathname: '/weekly-workout',
                params: {
                  splitId: split.id,
                },
              })
            }
          >
            <View style={styles.splitIconWrap}>
              <Ionicons
                name={splitIcons[split.id] || 'barbell-outline'}
                size={22}
                color="#FFFFFF"
              />
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
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  splitCard: {
    backgroundColor: '#151515',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  splitInfo: {
    flex: 1,
    paddingRight: 12,
  },
  splitName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  splitDesc: {
    color: '#666666',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  splitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
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
});
