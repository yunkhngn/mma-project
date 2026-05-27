import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, Heart, Ticket, MessageSquare } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACTIVE_BG = '#1e1b2e';
const NAV_BG = '#fafafc';
const BORDER_COLOR = '#ebebf0';
const INACTIVE_COLOR = '#94949f';

const TAB_CONFIG = [
  { name: 'index',     label: 'Khám phá', Icon: Compass       },
  { name: 'favorites', label: 'Yêu thích', Icon: Heart         },
  { name: 'bookings',  label: 'Đặt chỗ',   Icon: Ticket        },
  { name: 'messages',  label: 'Tin nhắn',  Icon: MessageSquare },
] as const;

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 10,
        left: 16,
        right: 16,
        backgroundColor: NAV_BG,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        shadowColor: '#1e1b2e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {TAB_CONFIG.map(({ name, label, Icon }, index) => {
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={name}
            onPress={() => navigation.navigate(name)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused ? ACTIVE_BG : 'transparent',
              }}
            >
              <Icon size={17} color={isFocused ? '#ffffff' : INACTIVE_COLOR} />
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '600' : '400',
                color: isFocused ? ACTIVE_BG : INACTIVE_COLOR,
                letterSpacing: 0.1,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PassengerLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="messages" />
    </Tabs>
  );
}
