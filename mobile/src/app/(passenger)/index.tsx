import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Bell, ArrowUpDown, Bus } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

const POPULAR_ROUTES = [
  {
    id: 1,
    destination: 'Vũng Tàu',
    description: 'Xe giường nằm từ 200.000đ',
    badge: 'Nổi bật',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    id: 2,
    destination: 'Đà Lạt',
    description: 'Từ 300.000đ',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    destination: 'Hà Giang',
    description: 'Từ 250.000đ',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
  },
];

export default function PassengerHome() {
  const { user, firebaseUser, logout } = useAuth();
  const [from, setFrom] = useState('Bến xe Mỹ Đình');
  const [to, setTo] = useState('');

  const swapLocations = () => {
    const prev = from;
    setFrom(to || 'Bến xe đến');
    setTo(prev);
  };

  const initials = user?.fullName?.split(' ').at(-1)?.[0]?.toUpperCase() ?? 'U';
  const displayName = user?.fullName?.split(' ').at(-1) ?? 'bạn';
  // Prefer backend avatar, then Firebase Google photo, then initials
  const avatarUri = user?.avatar ?? firebaseUser?.photoURL ?? null;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f7" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarRing} activeOpacity={0.8} onPress={logout}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={StyleSheet.absoluteFillObject} />
            ) : (
              <Text style={styles.avatarInitial}>{initials}</Text>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Xin chào</Text>
            <Text style={styles.appName}>{displayName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Bell size={20} color="#111111" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={styles.heroText}>Bạn muốn đi đâu{'\n'}tiếp theo?</Text>
      </View>

      {/* ── Search card ── */}
      <View style={styles.card}>
        {/* FROM */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>TỪ</Text>
            <TextInput
              value={from}
              onChangeText={setFrom}
              placeholder="Bến xe xuất phát"
              style={styles.fieldInput}
              placeholderTextColor="#b0b0ba"
            />
          </View>
          <TouchableOpacity onPress={swapLocations} style={styles.swapButton} activeOpacity={0.75}>
            <ArrowUpDown size={15} color="#374151" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* TO */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>ĐẾN</Text>
            <TextInput
              value={to}
              onChangeText={setTo}
              placeholder="Bến xe đến"
              style={styles.fieldInput}
              placeholderTextColor="#b0b0ba"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* DATE + PASSENGERS */}
        <View style={styles.metaRow}>
          <View style={styles.metaField}>
            <Text style={styles.fieldLabel}>NGÀY</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.metaValue}>24 – 28 Th10</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaField}>
            <Text style={styles.fieldLabel}>HÀNH KHÁCH</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.metaValue}>2 Người lớn</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH BUTTON */}
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.85}>
          <Bus size={17} color="#ffffff" strokeWidth={2} />
          <Text style={styles.searchButtonText}>Tìm vé xe</Text>
        </TouchableOpacity>
      </View>

      {/* ── Popular routes ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tuyến xe phổ biến</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>XEM TẤT CẢ</Text>
          </TouchableOpacity>
        </View>

        {/* Featured card */}
        <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
          <Image
            source={{ uri: POPULAR_ROUTES[0].image }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{POPULAR_ROUTES[0].badge}</Text>
            </View>
            <Text style={styles.featuredTitle}>{POPULAR_ROUTES[0].destination}</Text>
            <Text style={styles.featuredSubtitle}>{POPULAR_ROUTES[0].description}</Text>
          </View>
        </TouchableOpacity>

        {/* Small cards */}
        <View style={styles.smallCardsRow}>
          {POPULAR_ROUTES.slice(1).map((route) => (
            <TouchableOpacity key={route.id} style={styles.smallCard} activeOpacity={0.9}>
              <Image
                source={{ uri: route.image }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
              <View style={styles.smallCardContent}>
                <Text style={styles.smallCardTitle}>{route.destination}</Text>
                <Text style={styles.smallCardSubtitle}>{route.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e0e0ea',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444458',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8e8ea0',
    marginBottom: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ebebf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111111',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#1e1b2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a0a0b0',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    padding: 0,
  },
  swapButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f0f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f4',
    marginHorizontal: -4,
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  metaField: {
    flex: 1,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#f0f0f4',
    marginHorizontal: 12,
    marginVertical: 2,
  },
  searchButton: {
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7b7b90',
    letterSpacing: 0.8,
  },
  featuredCard: {
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallCard: {
    flex: 1,
    height: 155,
    borderRadius: 20,
    overflow: 'hidden',
  },
  smallCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  smallCardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  smallCardSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
});
