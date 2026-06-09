import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/atoms/Typography';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth() as any;

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

  const avatarUri = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';

  const menuItems = [
    {
      id: 'profile',
      title: 'Thông tin cá nhân',
      icon: 'person-outline',
      color: '#007AFF',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Alert.alert('Thông báo', 'Tính năng chỉnh sửa thông tin đang được cập nhật.');
      },
    },
    {
      id: 'payment',
      title: 'Phương thức thanh toán',
      icon: 'wallet-outline',
      color: '#34C759',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Alert.alert('Thông báo', 'Tính năng thanh toán đang được phát triển.');
      },
    },
    {
      id: 'notifications',
      title: 'Cài đặt thông báo',
      icon: 'notifications-outline',
      color: '#FF9500',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Alert.alert('Thông báo', 'Cài đặt thông báo hệ thống.');
      },
    },
    {
      id: 'support',
      title: 'Hỗ trợ & Trợ giúp',
      icon: 'help-circle-outline',
      color: '#5856D6',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Alert.alert('Liên hệ hỗ trợ', 'Tổng đài chăm sóc khách hàng: 1900 xxxx');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F5FB" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.headerTitle}>Tài khoản</Typography>
        </View>

        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Information Card */}
          <View style={styles.profileCard}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <Typography variant="h1" style={styles.userName}>
              {user?.fullName || 'Hành khách'}
            </Typography>
            <Typography variant="body" style={styles.userEmail}>
              {user?.email || 'chua.cap.nhat@viettrip.vn'}
            </Typography>
            <View style={styles.badge}>
              <Typography variant="caption" style={styles.badgeText}>
                HÀNH KHÁCH VIP
              </Typography>
            </View>
          </View>

          {/* Menu Items List */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Typography variant="body" style={styles.menuItemTitle}>
                    {item.title}
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C4BFD3" />
              </TouchableOpacity>
            ))}

            {/* Logout item styled inside menu container */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                </View>
                <Typography variant="body" style={styles.logoutText}>
                  Đăng xuất
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFD1D1" style={{ opacity: 0 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F5FB',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B1527',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120, // spacing above floating tab bar
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#9086A7',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#F3F1FA',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E152D',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8AA0',
    marginBottom: 16,
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
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#9086A7',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1FA',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoutIconContainer: {
    backgroundColor: '#FF3B3015',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E152D',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});