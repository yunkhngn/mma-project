import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Role = 'passenger' | 'admin';

interface Props {
  value: Role;
  onChange: (role: Role) => void;
}

export function RoleSelector({ value, onChange }: Props) {
  return (
    <View className="flex-row bg-gray-100 p-1.5 rounded-full mt-6">
      <TouchableOpacity
        onPress={() => onChange('passenger')}
        activeOpacity={0.75}
        className={`flex-1 py-3 rounded-full items-center ${value === 'passenger' ? 'bg-white shadow-sm' : ''}`}
      >
        <Text className={`font-semibold text-sm ${value === 'passenger' ? 'text-gray-900' : 'text-gray-500'}`}>
          Hành khách
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('admin')}
        activeOpacity={0.75}
        className={`flex-1 py-3 rounded-full items-center ${value === 'admin' ? 'bg-white shadow-sm' : ''}`}
      >
        <Text className={`font-semibold text-sm ${value === 'admin' ? 'text-gray-900' : 'text-gray-500'}`}>
          Quản trị viên
        </Text>
      </TouchableOpacity>
    </View>
  );
}
