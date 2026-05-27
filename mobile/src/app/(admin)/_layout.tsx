import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, MessageSquareCode, Settings, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#208AEF',
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
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="chats" 
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
