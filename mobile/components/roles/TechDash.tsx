import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import Config from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function TechDash({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState({ name: '', qty: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, resProd] = await Promise.all([
        fetch(`${Config.API_URL}/services`).then(r => r.json()),
        fetch(`${Config.API_URL}/products`).then(r => r.json())
      ]);
      setData(Array.isArray(resData) ? resData : []);
      setProducts(Array.isArray(resProd) ? resProd.filter((p:any) => p.itemType === 'SPARE') : []);
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
    try {
       await fetch(`${Config.API_URL}/partlogs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             technicianName: user?.name || 'Tech',
             partName: selection.name,
             action: 'ISSUED',
             quantity: selection.qty,
             syncedFromMobile: true
          })
       });
       setIsModalOpen(false);
       setSelection({ name: '', qty: 1 });
       fetchData();
    } catch (e) {
       alert("Sync Failed.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#6366f1" />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0] || 'Tech'}</Text>
                <Text style={styles.statusBadge}>ACTIVE SESSION</Text>
              </View>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account-hard-hat" size={24} color="#6366f1" />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{data.length}</Text>
                <Text style={styles.statLabel}>Tickets</Text>
              </View>
              <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>Online</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <TouchableOpacity style={styles.mainAction} onPress={() => setIsModalOpen(true)}>
              <View style={styles.actionIconCircle}>
                  <MaterialCommunityIcons name="plus-circle" size={32} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Log Spare Parts</Text>
                  <Text style={styles.actionSubtitle}>Update inventory in real-time</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SERVICE QUEUE</Text>
              <TouchableOpacity onPress={fetchData}>
                <MaterialCommunityIcons name="refresh" size={18} color="#6366f1" />
              </TouchableOpacity>
            </View>

            {loading && data.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
            ) : (
              data.map((item: any, idx) => (
                  <Animated.View 
                    key={idx} 
                    entering={FadeInDown.delay(300 + idx * 100).duration(500)}
                    layout={Layout.springify()}
                    style={styles.ticketCard}
                  >
                     <View style={styles.ticketHeader}>
                        <View style={styles.priorityDot} />
                        <Text style={styles.ticketId}>TKT-00{idx + 1}</Text>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>PENDING</Text>
                        </View>
                     </View>
                     
                     <Text style={styles.ticketTitle} numberOfLines={2}>
                        {item.description || 'General Service Maintenance'}
                     </Text>
                     
                     <View style={styles.ticketFooter}>
                        <View style={styles.metaItem}>
                           <MaterialCommunityIcons name="map-marker-outline" size={14} color="#94a3b8" />
                           <Text style={styles.metaText}>{item.areaSector || 'Field Station'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                           <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                           <Text style={styles.metaText}>2h ago</Text>
                        </View>
                     </View>
                  </Animated.View>
              ))
            )}
            
            {data.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>All clear for today!</Text>
              </View>
            )}
        </View>
      </ScrollView>

      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHandle} />
               <Text style={styles.modalTitle}>Component Log</Text>
               <Text style={styles.modalSubtitle}>Select the part used for this service</Text>
               
               <ScrollView style={styles.pickerContainer} showsVerticalScrollIndicator={false}>
                  <View style={styles.chipGrid}>
                    {products.map((p: any) => (
                       <TouchableOpacity 
                          key={p._id} 
                          style={[styles.partChip, selection.name === p.name && styles.activePartChip]}
                          onPress={() => setSelection({...selection, name: p.name})}
                       >
                          <MaterialCommunityIcons 
                            name={selection.name === p.name ? "check-circle" : "circle-outline"} 
                            size={18} 
                            color={selection.name === p.name ? "#fff" : "rgba(255,255,255,0.3)"} 
                          />
                          <Text style={[styles.partChipText, selection.name === p.name && styles.activePartChipText]}>{p.name}</Text>
                       </TouchableOpacity>
                    ))}
                  </View>
               </ScrollView>

               <View style={styles.qtyRow}>
                  <Text style={styles.qtyLabel}>Quantity</Text>
                  <View style={styles.qtyControls}>
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
                style={[styles.confirmBtn, !selection.name && styles.btnDisabled]} 
                onPress={handleSyncAction}
                disabled={!selection.name}
               >
                  <Text style={styles.confirmBtnText}>CONFIRM & SYNC</Text>
                  <MaterialCommunityIcons name="sync" size={18} color="#fff" />
               </TouchableOpacity>
               
               <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeModalBtn}>
                  <Text style={styles.closeModalText}>Dismiss</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: 1,
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  mainAction: {
    backgroundColor: '#6366f1',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  listSection: {
    marginTop: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  ticketCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  ticketId: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  tag: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '900',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
    marginBottom: 15,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 25,
  },
  pickerContainer: {
    maxHeight: 300,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  partChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activePartChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366f1',
  },
  partChipText: {
    fontWeight: '700',
    color: '#94a3b8',
    marginLeft: 8,
  },
  activePartChipText: {
    color: '#fff',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 20,
  },
  confirmBtn: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  closeModalBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
  }
});
