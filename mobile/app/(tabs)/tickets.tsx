import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/atoms/Typography';

interface Ticket {
  id: string;
  from: string;
  fromTime: string;
  fromStation: string;
  to: string;
  toTime: string;
  toStation: string;
  date: string;
  price: string;
  seat: string;
  busType: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketCode: string;
}

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const tickets: Ticket[] = [
    {
      id: '1',
      from: 'Hà Nội',
      fromTime: '08:00',
      fromStation: 'Bến xe Mỹ Đình',
      to: 'Vũng Tàu',
      toTime: '14:30',
      toStation: 'Bến xe Vũng Tàu',
      date: '24 Th10, 2026',
      price: '200.000đ',
      seat: 'A3 (Tầng 1)',
      busType: 'Limousine Giường Nằm',
      status: 'upcoming',
      ticketCode: 'VT-8899201',
    },
    {
      id: '2',
      from: 'Hải Phòng',
      fromTime: '14:00',
      fromStation: 'Bến xe Vĩnh Niệm',
      to: 'Hà Nội',
      toTime: '16:00',
      toStation: 'Bến xe Gia Lâm',
      date: '12 Th09, 2026',
      price: '120.000đ',
      seat: 'B08',
      busType: 'Ghế Ngồi Cao Cấp',
      status: 'completed',
      ticketCode: 'VT-4410294',
    },
    {
      id: '3',
      from: 'Hà Nội',
      fromTime: '09:00',
      fromStation: 'Bến xe Mỹ Đình',
      to: 'Sa Pa',
      toTime: '15:30',
      toStation: 'Bến xe Sa Pa',
      date: '05 Th08, 2026',
      price: '280.000đ',
      seat: 'A12 (Tầng 2)',
      busType: 'Limousine Cabin Đôi',
      status: 'cancelled',
      ticketCode: 'VT-1029481',
    },
  ];

  const handleTabPress = (tab: 'upcoming' | 'history') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'upcoming') {
      return ticket.status === 'upcoming';
    } else {
      return ticket.status === 'completed' || ticket.status === 'cancelled';
    }
  });

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'upcoming':
        return (
          <View style={[styles.badge, styles.upcomingBadge]}>
            <Typography variant="caption" style={styles.upcomingBadgeText}>Sắp đi</Typography>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.badge, styles.completedBadge]}>
            <Typography variant="caption" style={styles.completedBadgeText}>Đã hoàn thành</Typography>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.badge, styles.cancelledBadge]}>
            <Typography variant="caption" style={styles.cancelledBadgeText}>Đã hủy</Typography>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F5FB" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.headerTitle}>Vé của tôi</Typography>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTabButton]}
            onPress={() => handleTabPress('upcoming')}
            activeOpacity={0.8}
          >
            <Typography
              variant="body"
              style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}
            >
              Sắp đi
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => handleTabPress('history')}
            activeOpacity={0.8}
          >
            <Typography
              variant="body"
              style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}
            >
              Lịch sử
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Tickets Scroll */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                {/* Upper part of ticket */}
                <View style={styles.ticketMain}>
                  <View style={styles.ticketHeader}>
                    <Typography variant="caption" style={styles.ticketCode}>{ticket.ticketCode}</Typography>
                    {getStatusBadge(ticket.status)}
                  </View>

                  <View style={styles.tripRouteContainer}>
                    <View style={styles.stationBlock}>
                      <Typography variant="h2" style={styles.timeText}>{ticket.fromTime}</Typography>
                      <Typography variant="body" style={styles.cityText}>{ticket.from}</Typography>
                      <Typography variant="caption" style={styles.stationText} numberOfLines={1}>
                        {ticket.fromStation}
                      </Typography>
                    </View>

                    <View style={styles.arrowBlock}>
                      <Ionicons name="arrow-forward" size={18} color="#8E8AA0" />
                      <View style={styles.durationLine} />
                      <Typography variant="caption" style={styles.busTypeText} numberOfLines={1}>
                        {ticket.busType}
                      </Typography>
                    </View>

                    <View style={styles.stationBlock}>
                      <Typography variant="h2" style={[styles.timeText, styles.alignRight]}>
                        {ticket.toTime}
                      </Typography>
                      <Typography variant="body" style={[styles.cityText, styles.alignRight]}>
                        {ticket.to}
                      </Typography>
                      <Typography variant="caption" style={[styles.stationText, styles.alignRight]} numberOfLines={1}>
                        {ticket.toStation}
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.ticketDetailsGrid}>
                    <View style={styles.gridItem}>
                      <Typography variant="caption" style={styles.gridLabel}>NGÀY ĐI</Typography>
                      <Typography variant="body" style={styles.gridValue}>{ticket.date}</Typography>
                    </View>
                    <View style={styles.gridItem}>
                      <Typography variant="caption" style={styles.gridLabel}>VỊ TRÍ GHẾ</Typography>
                      <Typography variant="body" style={styles.gridValue}>{ticket.seat}</Typography>
                    </View>
                  </View>
                </View>

                {/* Dashed Separator */}
                <View style={styles.separatorContainer}>
                  <View style={styles.leftCutout} />
                  <View style={styles.dashedLine} />
                  <View style={styles.rightCutout} />
                </View>

                {/* Lower part of ticket (QR action) */}
                <View style={styles.ticketFooter}>
                  <View style={styles.footerInfo}>
                    <Typography variant="caption" style={styles.footerLabel}>TỔNG CỘNG</Typography>
                    <Typography variant="h2" style={styles.priceText}>{ticket.price}</Typography>
                  </View>
                  
                  {ticket.status === 'upcoming' ? (
                    <TouchableOpacity style={styles.qrButton} activeOpacity={0.8}>
                      <Ionicons name="qr-code-outline" size={20} color="#1A1A1F" style={{ marginRight: 6 }} />
                      <Typography variant="body" style={styles.qrButtonText}>Hiện mã QR</Typography>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.qrButton, styles.disabledButton]} disabled activeOpacity={1}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#8E8AA0" style={{ marginRight: 6 }} />
                      <Typography variant="body" style={styles.qrButtonTextDisabled}>Hoàn tất</Typography>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={80} color="#C4BFD3" style={{ marginBottom: 16 }} />
              <Typography variant="body" style={styles.emptyText}>Bạn chưa có vé xe nào ở mục này</Typography>
            </View>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAE5F4',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#9086A7',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7892',
  },
  activeTabText: {
    color: '#1B1527',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // space above absolute tab bar
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#9086A7',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ticketMain: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8AA0',
    letterSpacing: 0.5,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  upcomingBadge: {
    backgroundColor: '#E6FDF4',
  },
  upcomingBadgeText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 11,
  },
  completedBadge: {
    backgroundColor: '#F3F1FA',
  },
  completedBadgeText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 11,
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },
  cancelledBadgeText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 11,
  },
  tripRouteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stationBlock: {
    width: '35%',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E152D',
    marginBottom: 2,
  },
  cityText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B1527',
    marginBottom: 4,
  },
  stationText: {
    fontSize: 11,
    color: '#8E8AA0',
  },
  alignRight: {
    textAlign: 'right',
  },
  arrowBlock: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationLine: {
    height: 1,
    width: '80%',
    backgroundColor: '#E4E0F3',
    marginVertical: 4,
  },
  busTypeText: {
    fontSize: 10,
    color: '#8E8AA0',
    fontWeight: '600',
  },
  ticketDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F1FA',
    paddingTop: 16,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8AA0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E152D',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  leftCutout: {
    width: 10,
    height: 20,
    backgroundColor: '#F6F5FB',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: -1,
  },
  rightCutout: {
    width: 10,
    height: 20,
    backgroundColor: '#F6F5FB',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E4E0F3',
    borderStyle: 'dashed',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAF9FC',
  },
  footerInfo: {
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8AA0',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E152D',
    marginBottom: 0,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0F3',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#9086A7',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledButton: {
    backgroundColor: '#F3F1FA',
    borderColor: '#F3F1FA',
  },
  qrButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E152D',
  },
  qrButtonTextDisabled: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8AA0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#8E8AA0',
    fontSize: 15,
    textAlign: 'center',
  },
});
