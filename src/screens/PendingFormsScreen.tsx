import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearForms, getForms } from '../storage/formsStorage';
import type { FormData } from '../types/Form';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getLocationText(location: FormData['location']): string {
  if (
    location.status === 'captured' &&
    location.latitude !== null &&
    location.longitude !== null
  ) {
    const accuracy = location.accuracy !== null ? ` | +/- ${location.accuracy.toFixed(1)}m` : '';
    return `GPS: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}${accuracy}`;
  }

  if (location.status === 'denied') {
    return 'GPS: sem localizacao (permissao negada)';
  }

  return 'GPS: sem localizacao (falha na captura)';
}

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
            <Text style={styles.cardTitle}>{item.payload.nomeCompleto || 'Sem nome informado'}</Text>
            <Text style={styles.cardText}>Telefone: {item.payload.telefone || '-'}</Text>
            <Text style={styles.cardText}>CPF: {item.payload.cpf || '-'}</Text>
            <Text style={styles.cardText}>{getLocationText(item.location)}</Text>
            <Text style={styles.cardDate}>Criado em {new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  cardTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  cardText: { color: '#D1D5DB', fontSize: 13, marginBottom: 4 },
  cardDate: { color: '#6B7280', fontSize: 12, marginTop: 6 },
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
