import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import Config from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(Config.API_URL);

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const orb1Pos = useSharedValue({ x: 0, y: 0 });
  const orb2Pos = useSharedValue({ x: 0, y: 0 });

  useEffect(() => {
    // Entrance animation
    formOpacity.value = withDelay(400, withTiming(1, { duration: 1000 }));
    formTranslateY.value = withDelay(400, withTiming(0, { duration: 1000, easing: Easing.out(Easing.back(1.5)) }));

    // Floating orbs animation
    orb1Pos.value = withRepeat(
      withSequence(
        withTiming({ x: 20, y: -30 }, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming({ x: -10, y: 10 }, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming({ x: 0, y: 0 }, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    orb2Pos.value = withRepeat(
      withSequence(
        withTiming({ x: -30, y: 20 }, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming({ x: 15, y: -15 }, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        withTiming({ x: 0, y: 0 }, { duration: 5500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }]
  }));

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb1Pos.value.x },
      { translateY: orb1Pos.value.y }
    ]
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb2Pos.value.x },
      { translateY: orb2Pos.value.y }
    ]
  }));

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Credentials Required');
      return;
    }

    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      Config.API_URL = apiUrl;
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        login(data);
        router.replace('/(tabs)');
      } else {
        setError(data.message || 'Access Denied');
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setLoading(false);
      setError(err.name === 'AbortError' ? 'Connection Timeout' : 'Network Error');
      setShowApiSettings(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Glow Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.innerContainer, animatedFormStyle]}>
          <View style={styles.headerSection}>
             <Logo size={180} />
             <Text style={styles.brandSubtitle}>Unified Field Terminal</Text>
          </View>

          <View style={styles.glassCard}>
            <TouchableOpacity 
              style={styles.settingsIcon}
              onPress={() => setShowApiSettings(!showApiSettings)}
            >
              <MaterialCommunityIcons 
                name={showApiSettings ? "close-circle-outline" : "cog-outline"} 
                size={22} 
                color="rgba(255,255,255,0.4)" 
              />
            </TouchableOpacity>

            <Text style={styles.cardHeader}>Authentication</Text>

            {showApiSettings && (
              <View style={styles.apiBox}>
                <Text style={styles.apiLabel}>Endpoint Configuration</Text>
                <TextInput 
                  style={styles.apiInput}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  placeholder="https://api.example.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Operator ID"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Security Key"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.loginButtonContent}>
                  <Text style={styles.loginButtonText}>ESTABLISH CONNECTION</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Secure Terminal Access</Text>
              <View style={styles.secureBadge}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#10b981" />
                <Text style={styles.secureText}>AES-256</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A', // Darker black for better contrast
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.15,
  },
  orb1: {
    backgroundColor: '#6366f1',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  orb2: {
    backgroundColor: '#4f46e5',
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 15,
  },
  brandSubtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 40,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  settingsIcon: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 10,
  },
  cardHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 25,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  apiBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  apiLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  apiInput: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    gap: 10,
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  secureText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
  }
});
