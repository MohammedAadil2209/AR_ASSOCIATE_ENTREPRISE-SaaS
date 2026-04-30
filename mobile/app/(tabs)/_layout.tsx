import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontWeight: '900',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Operations',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="flash-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="package-variant-closed" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
