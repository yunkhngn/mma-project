import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/atoms/Typography';
import { FormField } from '@/components/molecules/FormField';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const tempErrors: typeof errors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Họ và tên là bắt buộc';
    if (!email.trim()) tempErrors.email = 'Email hoặc số điện thoại là bắt buộc';
    if (!password) {
      tempErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 8) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất 8 ký tự';
    }
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, fullName.trim(), '');
      Alert.alert('Thành công', 'Tạo tài khoản thành công!');
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="never"
      >
        <TouchableOpacity 
          style={styles.topSpacer} 
          activeOpacity={1} 
          onPress={() => {}}
        />

        <View style={styles.formContainer}>
          <Typography variant="h1" style={styles.title}>
            Tạo tài khoản
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Bắt đầu hành trình của bạn cùng VietTrip
          </Typography>

          <FormField
            label="HỌ VÀ TÊN"
            placeholder="Nhập họ và tên của bạn"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
          />

          <FormField
            label="EMAIL HOẶC SỐ ĐIỆN THOẠI"
            placeholder="nhap@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormField
            label="MẬT KHẨU"
            placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />

          <FormField
            label="XÁC NHẬN MẬT KHẨU"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Typography style={styles.registerButtonText}>
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
            </Typography>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" style={styles.dividerText}>hoặc tiếp tục với</Typography>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleGoogleSignIn} 
            disabled={loadingGoogle}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="logo-google" size={20} color="#1A1A1A" style={styles.buttonIcon} />
              <Typography style={styles.socialButtonText}>
                Google
              </Typography>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLoginPress} 
            activeOpacity={0.8}
            style={styles.signinContainer}
            hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
          >
            <Typography variant="body" style={styles.signinText}>
              Đã có tài khoản?{' '}
              <Typography variant="body" style={styles.signinLink}>
                Đăng nhập
              </Typography>
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSpacer: {
    flex: 1,
    minHeight: 80,
  },
  formContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 24,
  },
  registerButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  socialButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontWeight: '600',
    color: '#1A1A1A',
    fontSize: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    color: '#666666',
  },
  signinLink: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
});
