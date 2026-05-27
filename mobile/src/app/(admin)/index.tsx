import React from 'react';
import { View, Text } from 'react-native';

export default function AdminDashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-800">Admin Dashboard</Text>
      <Text className="text-gray-500 mt-2 text-center">Chào mừng bạn đã đăng nhập thành công với vai trò Quản trị viên!</Text>
    </View>
  );
}
