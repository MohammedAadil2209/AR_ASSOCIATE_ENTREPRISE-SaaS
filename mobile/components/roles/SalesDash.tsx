import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import Config from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function SalesDash({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selection, setSelection] = useState({ name: '', qty: 1 });
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        fetch(`${Config.API_URL}/customers`).then(r => r.json()),
        fetch(`${Config.API_URL}/products`).then(r => r.json())
      ]);
      setCustomers(Array.isArray(custRes) ? custRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes.filter((p:any) => p.itemType === 'UNIT') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncAction = async () => {
    if (!selection.name) return;
    setSyncing(true);
    try {
       await fetch(`${Config.API_URL}/saleslogs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             salesPersonName: user?.name || 'Sales Rep',
             unitName: selection.name,
             action: 'OUT_FOR_DELIVERY',
             quantity: selection.qty,
             syncedFromMobile: true
          })
       });
       setIsModalOpen(false);
       setSelection({ name: '', qty: 1 });
       fetchData();
    } catch (e) {
       alert("Network Sync Failed.");
    } finally {
       setSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#6366f1" />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <View>
                <Text style={styles.title}>Sales Terminal</Text>
                <Text style={styles.subtitle}>Unified Commerce Node</Text>
            </View>
            <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                <MaterialCommunityIcons name="sync" size={20} color="#6366f1" className={loading ? "rotate-90" : ""} />
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <TouchableOpacity style={styles.mainAction} onPress={() => setIsModalOpen(true)}>
                <View style={styles.actionIconCircle}>
                    <MaterialCommunityIcons name="cart-arrow-right" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>Register Dispatch</Text>
                    <Text style={styles.actionSubtitle}>Synchronize sales with HQ</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
        </Animated.View>

        <View style={styles.statsRow}>
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statMiniCard}>
                <Text style={styles.statMiniLabel}>ACTIVE LEADS</Text>
                <Text style={styles.statMiniValue}>{customers.length}</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.statMiniCard}>
                <Text style={styles.statMiniLabel}>UNITS IN STOCK</Text>
                <Text style={styles.statMiniValue}>{products.length}</Text>
            </Animated.View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIORITY CLIENTS</Text>
          {loading && customers.length === 0 ? (
              <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
          ) : (
            customers.slice(0, 8).map((c: any, i) => (
                <Animated.View 
                    key={i} 
                    entering={FadeInDown.delay(400 + i * 100).duration(500)}
                    layout={Layout.springify()}
                    style={styles.customerCard}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{c.name?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.customerName}>{c.name}</Text>
                        <Text style={styles.customerDetail}>{c.city || 'Standard Channel'}</Text>
                    </View>
                    <TouchableOpacity style={styles.contactBtn}>
                        <MaterialCommunityIcons name="phone-outline" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHandle} />
               <Text style={styles.modalTitle}>Dispatch Logistics</Text>
               <Text style={styles.modalSubtitle}>Select product and quantity for field exit</Text>
               
               <Text style={styles.inputLabel}>Product Model</Text>
               <ScrollView style={styles.pickerScroll} horizontal showsHorizontalScrollIndicator={false}>
                  {products.map((p: any) => (
                     <TouchableOpacity 
                        key={p._id} 
                        style={[styles.chip, selection.name === p.name && styles.activeChip]}
                        onPress={() => setSelection({...selection, name: p.name})}
                     >
                        <Text style={[styles.chipText, selection.name === p.name && styles.activeChipText]}>{p.name}</Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>

               <View style={styles.qtyContainer}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => setSelection({...selection, qty: Math.max(1, selection.qty - 1)})} style={styles.qtyBtn}>
                        <MaterialCommunityIcons name="minus" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{selection.qty}</Text>
                    <TouchableOpacity onPress={() => setSelection({...selection, qty: selection.qty + 1})} style={styles.qtyBtn}>
                        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
               </View>

               <TouchableOpacity 
                  style={[styles.confirmBtn, (!selection.name || syncing) && styles.btnDisabled]} 
                  onPress={handleSyncAction}
                  disabled={!selection.name || syncing}
               >
                  {syncing ? (
                     <ActivityIndicator color="#fff" />
                  ) : (
                     <View style={styles.confirmBtnContent}>
                        <Text style={styles.confirmBtnText}>AUTHORIZE DISPATCH</Text>
                        <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                     </View>
                  )}
               </TouchableOpacity>
               
               <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Cancel Operation</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05070A' },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  refreshBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mainAction: { backgroundColor: '#6366f1', borderRadius: 24, padding: 22, flexDirection: 'row', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  actionIconCircle: { width: 54, height: 54, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  actionSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 15, marginTop: 15, marginBottom: 35 },
  statMiniCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statMiniLabel: { color: '#64748b', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  statMiniValue: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  section: { marginTop: 0 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 42, height: 42, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)' },
  avatarText: { color: '#6366f1', fontWeight: '900', fontSize: 16 },
  customerName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  customerDetail: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },
  contactBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50 },
  modalHandle: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, alignSelf: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  modalSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 30 },
  inputLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  pickerScroll: { marginBottom: 30 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeChip: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1' },
  chipText: { color: '#64748b', fontWeight: '800', fontSize: 13 },
  activeChipText: { color: '#fff' },
  qtyContainer: { marginBottom: 35 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 6 },
  qtyBtn: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '900' },
  confirmBtn: { backgroundColor: '#6366f1', height: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  confirmBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  btnDisabled: { opacity: 0.4 },
  closeBtn: { marginTop: 20, alignItems: 'center' },
  closeBtnText: { color: '#64748b', fontSize: 13, fontWeight: '700' }
});
