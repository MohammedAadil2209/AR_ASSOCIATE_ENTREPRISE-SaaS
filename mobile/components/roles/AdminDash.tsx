import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import Config from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function AdminDash({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sales, services, users] = await Promise.all([
        fetch(`${Config.API_URL}/sales`).then(r => r.json()),
        fetch(`${Config.API_URL}/services`).then(r => r.json()),
        fetch(`${Config.API_URL}/users`).then(r => r.json())
      ]);
      
      setStats({
        totalSales: Array.isArray(sales) ? sales.length : 0,
        pendingServices: Array.isArray(services) ? services.filter((s: any) => s.status !== 'COMPLETED').length : 0,
        activeUsers: Array.isArray(users) ? users.length : 0,
        revenue: Array.isArray(sales) ? sales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0) : 0
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor="#6366f1" />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>Admin Control</Text>
                    <Text style={styles.subtitle}>Global Operations Node</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.statusText}>LIVE SYNC</Text>
                </View>
            </View>
        </Animated.View>

        <View style={styles.revenueContainer}>
            <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.revenueCard}>
                <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
                <Text style={styles.revenueValue}>₹{stats?.revenue.toLocaleString() || 0}</Text>
                <View style={styles.revenueFooter}>
                    <MaterialCommunityIcons name="trending-up" size={16} color="#10b981" />
                    <Text style={styles.revenueTrend}>+12.5% this month</Text>
                </View>
            </Animated.View>
        </View>

        <View style={styles.statsGrid}>
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statBox}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <MaterialCommunityIcons name="cart-outline" size={24} color="#6366f1" />
                </View>
                <Text style={styles.statValue}>{stats?.totalSales || 0}</Text>
                <Text style={styles.statLabel}>Total Sales</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.statBox}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <MaterialCommunityIcons name="wrench-outline" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statValue}>{stats?.pendingServices || 0}</Text>
                <Text style={styles.statLabel}>Pending Tickets</Text>
            </Animated.View>
        </View>

        <View style={styles.statsGrid}>
            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.statBox}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <MaterialCommunityIcons name="account-group-outline" size={24} color="#10b981" />
                </View>
                <Text style={styles.statValue}>{stats?.activeUsers || 0}</Text>
                <Text style={styles.statLabel}>Staff Nodes</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.statBox}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <MaterialCommunityIcons name="alert-decagram-outline" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Critical Alerts</Text>
            </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.actionSection}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <TouchableOpacity style={styles.wideButton}>
                <MaterialCommunityIcons name="file-chart-outline" size={22} color="#fff" />
                <Text style={styles.wideButtonText}>Generate Master Intelligence Report</Text>
            </TouchableOpacity>
            
            <View style={styles.miniActionRow}>
                <TouchableOpacity style={styles.miniAction}>
                    <MaterialCommunityIcons name="cog" size={20} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.miniActionText}>System Config</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniAction}>
                    <MaterialCommunityIcons name="database-sync" size={20} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.miniActionText}>Force Sync</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05070A' },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 8 },
  statusText: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  revenueContainer: { marginBottom: 20 },
  revenueCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  revenueLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  revenueValue: { color: '#fff', fontSize: 36, fontWeight: '900' },
  revenueFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  revenueTrend: { color: '#10b981', fontSize: 11, fontWeight: '700', marginLeft: 6 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 2 },
  actionSection: { marginTop: 20 },
  sectionTitle: { color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  wideButton: { backgroundColor: '#6366f1', height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  wideButtonText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  miniActionRow: { flexDirection: 'row', gap: 15, marginTop: 15 },
  miniAction: { flex: 1, height: 55, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  miniActionText: { color: 'rgba(255,255,255,0.4)', fontWeight: '800', fontSize: 11 }
});
