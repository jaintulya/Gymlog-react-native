import { View, Text, StyleSheet } from 'react-native';

export default function CustomWorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Custom Workout</Text>

      <Text style={styles.subtitle}>
        Build your own workout here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#888888',
    marginTop: 8,
  },
});