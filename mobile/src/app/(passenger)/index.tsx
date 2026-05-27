import React from 'react';
import { View, Text } from 'react-native';

export default function PassengerDashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-800">Passenger Dashboard</Text>
      <Text className="text-gray-500 mt-2 text-center">Chào mừng bạn đã đăng nhập thành công với vai trò Hành khách!</Text>
    </View>
  );
}
