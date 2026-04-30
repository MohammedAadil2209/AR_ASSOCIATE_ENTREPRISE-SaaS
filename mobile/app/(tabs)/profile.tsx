import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0]}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Field Identity</Text>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account-circle-outline" size={20} color="#94a3b8" />
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="identifier" size={20} color="#94a3b8" />
          <Text style={styles.infoLabel}>Station ID</Text>
          <Text style={styles.infoValue}>ST-9921</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>System Settings</Text>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#475569" />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#475569" />
          <Text style={styles.menuText}>Security & Privacy</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="help-circle-outline" size={22} color="#475569" />
          <Text style={styles.menuText}>Support Center</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>TERMINATE SESSION</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}>AR ASSOCIATE FIELD v1.2.0-STABLE</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#6366f1', padding: 40, paddingTop: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  profileCard: { alignItems: 'center' },
  avatar: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  userName: { color: '#fff', fontSize: 24, fontWeight: '900' },
  roleBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  section: { padding: 24, marginTop: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  infoLabel: { flex: 1, marginLeft: 10, fontSize: 13, color: '#64748b', fontWeight: 'bold' },
  infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '900' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  menuText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  logoutButton: { margin: 24, marginTop: 10, backgroundColor: '#fee2e2', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  version: { textAlign: 'center', fontSize: 9, fontWeight: 'bold', color: '#cbd5e1', marginBottom: 40, textTransform: 'uppercase' }
});
