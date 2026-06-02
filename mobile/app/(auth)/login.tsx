import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/atoms/Typography';
import { FormField } from '@/components/molecules/FormField';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const tempErrors: typeof errors = {};
    if (!email.trim()) tempErrors.email = 'Email hoặc số điện thoại là bắt buộc';
    if (!password) tempErrors.password = 'Mật khẩu là bắt buộc';
    
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng nhập thất bại');
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
        <View style={styles.logoContainer}>
          <Ionicons name="airplane" size={26} color="#1A1A1A" style={styles.logoIcon} />
          <Typography variant="h1" style={styles.logoText}>
            VietTrip
          </Typography>
        </View>
        
        <Typography variant="h1" style={styles.title}>
          Chào mừng trở lại
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Đăng nhập để tiếp tục hành trình VietTrip của bạn.
        </Typography>

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
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.forgotButton} 
          onPress={() => Alert.alert('Thông báo', 'Tính năng đặt lại mật khẩu đang được phát triển')}
          activeOpacity={0.8}
        >
          <Typography variant="caption" style={styles.forgotText}>
            Quên mật khẩu?
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Typography style={styles.loginButtonText}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
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

        <View style={styles.signupContainer}>
          <Typography variant="body" style={styles.signupText}>
            Chưa có tài khoản?{' '}
          </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.8}>
            <Typography variant="body" style={styles.signupLink}>
              Đăng ký
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
    height: 200,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    marginRight: 6,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 0,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
  forgotText: {
    color: '#666666',
    fontWeight: '600',
  },
  loginButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666666',
  },
  signupLink: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
});
