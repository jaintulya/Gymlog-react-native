import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { saveData } from '@/utils/storage';
import { createWorkout } from '@/utils/workout';

export default function CreateCustomWorkoutScreen() {
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;

    const workout = createWorkout(name.trim());

    await saveData('pendingCustomWorkout', workout);

    router.replace('/custom-workout-detail');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Create Workout
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* NAME INPUT */}

      <View style={styles.section}>
        <Text style={styles.label}>Workout Name</Text>
        <Text style={styles.hint}>
          Give your workout a clear, descriptive name.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Upper Body, Push Day, Legs"
          placeholderTextColor="#555555"
          style={styles.input}
          autoFocus
          maxLength={40}
        />
      </View>

      {/* SUGGESTIONS */}

      <View style={styles.suggestionsSection}>
        <Text style={styles.suggestionsLabel}>
          SUGGESTIONS
        </Text>

        <View style={styles.suggestionsRow}>
          {['Upper Body', 'Push Day', 'Pull Day', 'Leg Day', 'Full Body', 'Arms'].map(
            suggestion => (
              <Pressable
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() =>
                  setName(suggestion)
                }
              >
                <Text style={styles.suggestionText}>
                  {suggestion}
                </Text>
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* CREATE BUTTON */}

      <Pressable
        style={[
          styles.createButton,
          !name.trim() && styles.createButtonDisabled,
        ]}
        onPress={handleCreate}
        disabled={!name.trim()}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={
            name.trim() ? '#000000' : '#444444'
          }
        />
        <Text
          style={[
            styles.createButtonText,
            !name.trim() &&
              styles.createButtonTextDisabled,
          ]}
        >
          CREATE WORKOUT
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
    paddingTop: 55,
    paddingBottom: 60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
  },

  section: {
    marginBottom: 24,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  hint: {
    color: '#555555',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 19,
  },

  input: {
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#252525',
  },

  suggestionsSection: {
    marginBottom: 32,
  },

  suggestionsLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  suggestionChip: {
    backgroundColor: '#151515',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#252525',
  },

  suggestionText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },

  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  createButtonDisabled: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
  },

  createButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  createButtonTextDisabled: {
    color: '#444444',
  },
});
