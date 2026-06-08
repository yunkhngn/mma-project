import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/atoms/Typography';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/onboarding');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể đăng xuất');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="airplane" size={24} color="#1A1A1A" style={styles.headerIcon} />
          <Typography variant="h1" style={styles.headerTitle}>
            VietTrip
          </Typography>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
          </View>
          <Typography variant="h1" style={styles.welcomeText}>
            Xin chào,
          </Typography>
          <Typography variant="h1" style={styles.userName}>
            {user?.fullName || 'Hành khách'}
          </Typography>
          <Typography variant="body" style={styles.userEmail}>
            {user?.email || 'Chưa cập nhật email'}
          </Typography>
          <View style={styles.badge}>
            <Typography variant="caption" style={styles.badgeText}>
              TÀI KHOẢN PASSENGER
            </Typography>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Typography variant="h2" style={styles.infoTitle}>
            Bắt đầu chuyến hành trình
          </Typography>
          <Typography variant="body" style={styles.infoSubtitle}>
            Tìm kiếm các tuyến xe chất lượng cao, đặt vé nhanh chóng và tiện lợi trực tiếp trên ứng dụng.
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 0,
  },
  logoutButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#E6F4FE',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  badgeText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
