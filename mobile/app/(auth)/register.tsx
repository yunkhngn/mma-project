import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/atoms/Typography';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
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
      // Register with email, pass blank phone for now
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
    setLoadingGoogle(true);
    try {
      await loginWithGoogle("MOCK_GOOGLE_ID_TOKEN");
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
      >
        <View style={styles.overlay} />
      </ImageBackground>

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
          <Typography style={styles.socialButtonText}>
            G Google
          </Typography>
        </TouchableOpacity>

        <View style={styles.signinContainer}>
          <Typography variant="body" style={styles.signinText}>
            Đã có tài khoản?{' '}
          </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
            <Typography variant="body" style={styles.signinLink}>
              Đăng nhập
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    height: 160,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
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
