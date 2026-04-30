import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Config from '../../constants/Config';

export default function InventoryScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cloud Catalog</Text>
        <Text style={styles.subtitle}>Real-Time Inventory Status</Text>
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
        <TextInput 
           style={styles.searchInput}
           placeholder="Search parts or units..."
           placeholderTextColor="#94a3b8"
           value={search}
           onChangeText={setSearch}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStock} color="#6366f1" />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
             <MaterialCommunityIcons name="package-variant" size={48} color="#e2e8f0" />
             <Text style={styles.emptyText}>No materials found in local cache</Text>
          </View>
        ) : filtered.map(item => (
           <View key={item._id} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: item.itemType === 'SPARE' ? '#fff7ed' : '#eef2ff' }]}>
                 <MaterialCommunityIcons 
                    name={item.itemType === 'SPARE' ? "wrench" : "package-variant-closed"} 
                    size={24} 
                    color={item.itemType === 'SPARE' ? "#ea580c" : "#6366f1"} 
                 />
              </View>
              <View style={styles.cardInfo}>
                 <Text style={styles.itemName}>{item.name}</Text>
                 <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
              </View>
              <View style={styles.stockBadge}>
                 <Text style={styles.stockLabel}>Stock</Text>
                 <Text style={styles.stockVal}>{item.quantity}</Text>
              </View>
           </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  searchBox: { margin: 24, marginTop: 0, backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '900', color: '#1e293b' },
  itemCategory: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
  stockBadge: { alignItems: 'flex-end', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  stockLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  stockVal: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }
});
