import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/atoms/Typography';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      // Sign-in with Google OAuth mock token
      // Under the hood, this triggers Firebase Auth credential sign-in and backend synchronization.
      await loginWithGoogle("MOCK_GOOGLE_ID_TOKEN");
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google Sign-In failed');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
      >
        <View style={styles.overlay}>
          <Typography variant="h1" color="#FFFFFF" style={styles.logo}>
            Nomad
          </Typography>
        </View>
      </ImageBackground>

      <View style={styles.bottomCard}>
        <Typography variant="h1" style={styles.title}>
          Khởi hành chuyến xe của bạn ngay hôm nay.
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Đặt vé xe khách cao cấp, khám phá các tuyến đường và di chuyển liền mạch.
        </Typography>

        <TouchableOpacity 
          style={styles.primaryEmailButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Typography style={styles.primaryEmailButtonText}>
            ✉ Tiếp tục với Email
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.socialButton} 
          onPress={() => Alert.alert('Information', 'Apple Sign-In is mocked for this platform')}
          activeOpacity={0.8}
        >
          <Typography style={styles.socialButtonText}>
             Tiếp tục với Apple
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.socialButton} 
          onPress={handleGoogleSignIn} 
          disabled={loadingGoogle}
          activeOpacity={0.8}
        >
          <Typography style={styles.socialButtonText}>
            G Tiếp tục với Google
          </Typography>
        </TouchableOpacity>

        <Typography variant="caption" style={styles.terms}>
          Bằng việc chọn tiếp tục, bạn đồng ý với{' '}
          <Typography variant="caption" style={styles.link}>Điều khoản Dịch vụ</Typography> và{' '}
          <Typography variant="caption" style={styles.link}>Chính sách Bảo mật</Typography>.
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryEmailButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  primaryEmailButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  socialButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    backgroundColor: 'transparent',
  },
  socialButtonText: {
    fontWeight: '600',
    color: '#1A1A1A',
    fontSize: 15,
  },
  terms: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
