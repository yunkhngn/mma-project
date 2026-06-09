import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/atoms/Typography';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [fromLocation, setFromLocation] = useState('Bến xe Mỹ Đình');
  const [toLocation, setToLocation] = useState('Bến xe đến');

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Tìm kiếm vé',
      `Đang tìm kiếm chuyến xe từ ${fromLocation} đến ${toLocation === 'Bến xe đến' ? 'các điểm đến' : toLocation}...`
    );
  };

  const avatarUri = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';

  const routes = [
    {
      id: '1',
      title: 'Vũng Tàu',
      price: 'Xe giường nằm từ 200.000đ',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&fit=crop',
      featured: true,
    },
    {
      id: '2',
      title: 'Hà Nội',
      price: 'Xe limousine từ 150.000đ',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?w=500&fit=crop',
      featured: false,
    },
    {
      id: '3',
      title: 'Đà Lạt',
      price: 'Xe giường nằm từ 250.000đ',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&fit=crop',
      featured: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F5FB" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <Typography variant="h2" style={styles.logoText}>Viettrip</Typography>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Hero Title */}
        <View style={styles.heroContainer}>
          <Typography variant="h1" style={styles.heroTitle}>
            Bạn muốn đi đâu{"\n"}tiếp theo?
          </Typography>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          {/* FROM */}
          <View style={styles.inputContainer}>
            <View style={styles.inputField}>
              <Typography variant="caption" style={styles.inputLabel}>TỪ</Typography>
              <Typography variant="body" style={styles.inputValue}>{fromLocation}</Typography>
            </View>
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap} activeOpacity={0.8}>
              <Ionicons name="swap-vertical" size={18} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* TO */}
          <View style={[styles.inputField, styles.toInputField]}>
            <Typography variant="caption" style={styles.inputLabel}>ĐẾN</Typography>
            <Typography variant="body" style={styles.inputValue}>{toLocation}</Typography>
          </View>

          {/* DATE & PASSENGER */}
          <View style={styles.row}>
            <View style={[styles.inputField, styles.halfWidth]}>
              <Typography variant="caption" style={styles.inputLabel}>NGÀY</Typography>
              <Typography variant="body" style={styles.inputValue}>24 - 28 Th10</Typography>
            </View>
            <View style={[styles.inputField, styles.halfWidth]}>
              <Typography variant="caption" style={styles.inputLabel}>HÀNH KHÁCH</Typography>
              <Typography variant="body" style={styles.inputValue}>2 Người lớn</Typography>
            </View>
          </View>

          {/* SEARCH BUTTON */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.9}>
            <Ionicons name="bus" size={20} color="#FFFFFF" style={styles.searchIcon} />
            <Typography variant="body" style={styles.searchButtonText}>Tìm vé xe</Typography>
          </TouchableOpacity>
        </View>

        {/* Popular Routes Section */}
        <View style={styles.sectionHeader}>
          <Typography variant="h2" style={styles.sectionTitle}>Tuyến xe phổ biến</Typography>
          <TouchableOpacity activeOpacity={0.7}>
            <Typography variant="caption" style={styles.viewAllText}>XEM TẤT CẢ</Typography>
          </TouchableOpacity>
        </View>

        {/* Horizontal scroll list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.routesScroll}
          contentContainerStyle={styles.routesContainer}
        >
          {routes.map((route) => (
            <TouchableOpacity key={route.id} activeOpacity={0.95}>
              <ImageBackground source={{ uri: route.image }} style={styles.routeCard} imageStyle={styles.routeImage}>
                {/* Dark transparent overlay for text readability */}
                <View style={styles.routeOverlay} />
                
                {route.featured && (
                  <View style={styles.featuredBadge}>
                    <Typography variant="caption" style={styles.featuredBadgeText}>Nổi bật</Typography>
                  </View>
                )}

                <View style={styles.routeCardBottom}>
                  <Typography variant="h1" style={styles.routeName}>{route.title}</Typography>
                  <Typography variant="body" style={styles.routePrice}>{route.price}</Typography>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120, // offset for absolute bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 0,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  heroContainer: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B1527',
    lineHeight: 38,
    marginBottom: 0,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#9086A7',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: '#F3F1FA',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toInputField: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8AA0',
    letterSpacing: 1,
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E152D',
  },
  swapButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4E0F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  searchButton: {
    backgroundColor: '#000000',
    borderRadius: 18,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1527',
    marginBottom: 0,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C7892',
    letterSpacing: 0.5,
  },
  routesScroll: {
    overflow: 'visible',
  },
  routesContainer: {
    paddingRight: 20,
  },
  routeCard: {
    width: 260,
    height: 320,
    borderRadius: 28,
    marginRight: 16,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'space-between',
  },
  routeImage: {
    borderRadius: 28,
  },
  routeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 21, 39, 0.25)',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  routeCardBottom: {
    justifyContent: 'flex-end',
  },
  routeName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  routePrice: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
});
