import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { saveData, getData } from '@/utils/storage';

export default function HomeScreen() {
  const [name, setName] = useState('');

  const saveWorkout = async () => {
    await saveData('testWorkout', {
      exercise: 'Bench Press',
      weight: 40,
      reps: 10,
    });

    console.log('Workout saved');
  };

  const loadWorkout = async () => {
    const data = await getData('testWorkout');

    console.log('Saved workout:', data);
    setName(data?.exercise || 'No data');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable onPress={saveWorkout}>
        <Text>Save Workout</Text>
      </Pressable>

      <Pressable onPress={loadWorkout} style={{ marginTop: 20 }}>
        <Text>Load Workout</Text>
      </Pressable>

      <Text style={{ marginTop: 20 }}>{name}</Text>
    </View>
  );
}