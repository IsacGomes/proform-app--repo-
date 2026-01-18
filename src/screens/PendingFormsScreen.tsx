import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getForms, clearForms } from '../storage/formsStorage';
import type { FormData } from '../types/Form';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PendingFormsScreen() {
  const navigation = useNavigation<Nav>();
  const [forms, setForms] = useState<FormData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadForms = useCallback(async () => {
    setRefreshing(true);
    const data = await getForms();
    setForms(data);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pendentes ({forms.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Form')}>
          <Text style={styles.link}>Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={forms}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl tintColor="#22C55E" refreshing={refreshing} onRefresh={loadForms} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum pendente. Salve algo na tela principal.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.email}</Text>
            {!!item.observacoes && <Text style={styles.cardText}>{item.observacoes}</Text>}
            <Text style={styles.cardDate}>
              Criado em {new Date(item.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}
      />

      {forms.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={async () => {
            await clearForms();
            loadForms();
          }}
        >
          <Text style={styles.clearButtonText}>Limpar tudo (dev)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16, paddingTop: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: '#E5E7EB', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#22C55E', fontWeight: '600' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '600' },
  cardSubtitle: { color: '#9CA3AF', fontSize: 14, marginBottom: 6 },
  cardText: { color: '#D1D5DB', fontSize: 14, marginBottom: 6 },
  cardDate: { color: '#6B7280', fontSize: 12 },
  clearButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearButtonText: { color: '#FCA5A5', fontWeight: '600' },
});
