import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import Colors from '@/constants/Colors';

function Icon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{symbol}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Icon symbol="◎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scene"
        options={{
          title: 'Scene',
          tabBarIcon: ({ color }) => <Icon symbol="◉" color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <Icon symbol="◈" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon symbol="◯" color={color} />,
        }}
      />
    </Tabs>
  );
}
