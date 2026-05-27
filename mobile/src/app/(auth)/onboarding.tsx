import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      {/* Background Image Header */}
      <View className="h-[50%] w-full relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }} 
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-black/10" />
        <Text className="absolute top-16 left-6 text-white text-3xl font-extrabold tracking-widest">
          Nomad
        </Text>
      </View>

      {/* Sheet Content Card */}
      <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-10 justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-center text-gray-900 leading-snug">
            Khởi hành chuyến xe của bạn ngay hôm nay.
          </Text>
          <Text className="text-center text-gray-500 mt-3 text-sm leading-relaxed px-4">
            Đặt vé xe khách cao cấp, khám phá các tuyến đường mới và di chuyển liền mạch.
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-y-3 mt-6">
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="bg-black py-4 rounded-full flex-row justify-center items-center gap-x-2"
          >
            <Mail size={18} color="white" />
            <Text className="text-white font-semibold text-base">Tiếp tục với Email</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-50 border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base">Tiếp tục với Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-50 border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base">Tiếp tục với Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Legal Terms */}
        <Text className="text-center text-xs text-gray-400 mt-4 leading-normal">
          Bằng việc chọn tiếp tục, bạn đồng ý với{' '}
          <Text className="underline text-gray-600 font-medium">Điều khoản Dịch vụ</Text> và{' '}
          <Text className="underline text-gray-600 font-medium">Chính sách Bảo mật</Text>.
        </Text>
      </View>
    </View>
  );
}
