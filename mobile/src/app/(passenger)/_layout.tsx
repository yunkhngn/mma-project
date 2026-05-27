import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, Heart, Calendar, MessageSquare, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/auth-context';

export default function PassengerLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        paddingTop: 5,
        paddingBottom: 25,
        height: 85,
      },
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 20 }}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
