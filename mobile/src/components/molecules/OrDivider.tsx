import React from 'react';
import { View, Text } from 'react-native';

export function OrDivider() {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-[1px] bg-gray-200" />
      <Text className="mx-4 text-xs text-gray-400">hoặc tiếp tục với</Text>
      <View className="flex-1 h-[1px] bg-gray-200" />
    </View>
  );
}
