import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#252525',
          height: 65,
          paddingTop: 5,
          paddingBottom: 5,
        },

        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#666666',

        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'workout') {
            iconName = 'barbell';
          } else if (route.name === 'history') {
            iconName = 'time';
          } else if (route.name === 'progress') {
            iconName = 'stats-chart';
          } else {
            iconName = 'settings';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}