import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const CARD_TOP_OFFSET = Math.round(SCREEN_HEIGHT * 0.3);

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), phone.trim(), password);
      Alert.alert('Thành công', 'Tạo tài khoản thành công!');
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Đã xảy ra lỗi vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Fixed background image */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      {/* Back button — fixed above scroll */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-14 left-5 bg-white/20 p-2 rounded-full"
        style={{ zIndex: 10 }}
      >
        <ArrowLeft size={20} color="white" />
      </TouchableOpacity>

      {/* Scrollable card */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: CARD_TOP_OFFSET - 32, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-[32px] px-6 pt-8 pb-6" style={{ minHeight: SCREEN_HEIGHT - CARD_TOP_OFFSET + 32 }}>
          <Text className="text-2xl font-bold text-gray-900">Tạo tài khoản</Text>
          <Text className="text-gray-500 text-sm mt-1">Bắt đầu hành trình của bạn cùng Nomad</Text>

          {/* Form */}
          <View className="mt-6 gap-y-4">
            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">HỌ VÀ TÊN *</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên của bạn"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">EMAIL *</Text>
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
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">SỐ ĐIỆN THOẠI</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">MẬT KHẨU *</Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
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

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">XÁC NHẬN MẬT KHẨU *</Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={handleRegister}
              disabled={submitting}
              className="bg-black py-4 rounded-full items-center justify-center"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng ký</Text>
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

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="mt-6 self-center"
            >
              <Text className="text-center text-sm text-gray-500">
                Đã có tài khoản? <Text className="text-black font-bold">Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
