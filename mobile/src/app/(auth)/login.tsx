import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [role, setRole] = useState<'passenger' | 'admin'>('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password, role);
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã xảy ra lỗi vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background Image Header */}
      <View className="h-[30%] w-full relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }} 
          className="w-full h-full object-cover"
        />
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-14 left-5 bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-10 justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Chào mừng trở lại</Text>
          <Text className="text-gray-500 text-sm mt-1">Đăng nhập để tiếp tục hành trình của bạn.</Text>

          {/* Role Switcher */}
          <View className="flex-row bg-gray-100 p-1.5 rounded-full mt-6">
            <TouchableOpacity 
              onPress={() => setRole('passenger')}
              className={`flex-1 py-3 rounded-full items-center ${role === 'passenger' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${role === 'passenger' ? 'text-gray-900' : 'text-gray-500'}`}>
                Hành khách
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('admin')}
              className={`flex-1 py-3 rounded-full items-center ${role === 'admin' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${role === 'admin' ? 'text-gray-900' : 'text-gray-500'}`}>
                Quản trị viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="mt-6 gap-y-4">
            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                EMAIL HOẶC SỐ ĐIỆN THOẠI
              </Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="nhap@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                MẬT KHẨU
              </Text>
              <View className="relative">
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="align-self-end mt-1">
              <Text className="text-right text-xs text-gray-500 font-semibold">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={submitting}
            className="bg-black py-4 rounded-full items-center justify-center"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-xs text-gray-400">hoặc tiếp tục với</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <TouchableOpacity className="border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base">Google</Text>
          </TouchableOpacity>

          {role === 'passenger' && (
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              className="mt-6 self-center"
            >
              <Text className="text-center text-sm text-gray-500">
                Chưa có tài khoản? <Text className="text-black font-bold">Đăng ký</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
