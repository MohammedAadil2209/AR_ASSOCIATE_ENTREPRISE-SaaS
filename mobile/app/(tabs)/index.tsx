import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AdminDash from '../../components/roles/AdminDash';
import SalesDash from '../../components/roles/SalesDash';
import TechDash from '../../components/roles/TechDash';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No active session.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
          <Text style={styles.buttonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Switcher based on role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDash user={user} />;
    case 'SALESMAN':
      return <SalesDash user={user} />;
    case 'TECHNICIAN':
      return <TechDash user={user} />;
    default:
      return (
        <View style={styles.center}>
          <Text style={styles.welcome}>Welcome, {user.name}</Text>
          <Text style={styles.subtext}>Role: {user.role}</Text>
          <Text style={styles.info}>General Staff Access Node</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginBottom: 20 },
  button: { backgroundColor: '#6366f1', padding: 15, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  welcome: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtext: { fontSize: 14, color: '#64748b', marginTop: 5 },
  info: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20 },
  logoutBtn: { marginTop: 40, padding: 10 },
  logoutText: { color: '#ef4444', fontWeight: 'bold' }
});
