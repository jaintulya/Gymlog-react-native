import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function WorkoutScreen() {
  const [selectedOption, setSelectedOption] = useState('recommended');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          Choose how you want to train
        </Text>

        {/* OPTION TABS */}

        <View style={styles.optionContainer}>
          <Pressable
            style={[
              styles.optionButton,
              selectedOption === 'recommended' &&
                styles.selectedOption,
            ]}
            onPress={() => setSelectedOption('recommended')}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === 'recommended' &&
                  styles.selectedOptionText,
              ]}
            >
              ⭐ Recommended
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
              ✨ Custom
            </Text>
          </Pressable>
        </View>

        {/* RECOMMENDED */}

        {selectedOption === 'recommended' && (
          <View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Recommended Weekly Plan
              </Text>

              <Text style={styles.cardDescription}>
                A simple weekly workout split to help you stay
                consistent.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push('/recommended')}
              >
                <Text style={styles.primaryButtonText}>
                  View Weekly Plan
                </Text>
              </Pressable>
            </View>

          </View>
        )}

        {/* CUSTOM */}

        {selectedOption === 'custom' && (
          <View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Create Your Workout
              </Text>

              <Text style={styles.cardDescription}>
                Build your own workout by choosing exercises,
                sets, reps and rest time.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push('/custom-workout')}
              >
                <Text style={styles.primaryButtonText}>
                  Create Workout
                </Text>
              </Pressable>
            </View>

          </View>
        )}

      </View>
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
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },

  subtitle: {
    color: '#888888',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 25,
  },

  optionContainer: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 5,
    marginBottom: 20,
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

  card: {
    backgroundColor: '#151515',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 8,
  },

  cardDescription: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});