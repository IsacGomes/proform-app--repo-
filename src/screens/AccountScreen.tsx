import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getForms } from '../storage/formsStorage';

export function AccountScreen() {
  const [offlineCount, setOfflineCount] = useState(0);

  const user = {
    name: 'Usuario',
    email: 'usuario@exemplo.com',
    role: 'Operador',
  };

  const loadOfflineCount = useCallback(async () => {
    const forms = await getForms();
    setOfflineCount(forms.length);
  }, []);

  useEffect(() => {
    loadOfflineCount();
  }, [loadOfflineCount]);

  function handleShowOfflineAlert() {
    Alert.alert(
      'Formularios offline',
      offlineCount === 0
        ? 'Nenhum formulario completo pendente.'
        : `Voce tem ${offlineCount} formulario(s) completo(s) salvo(s) offline aguardando envio.`,
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha conta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Funcao</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statusLabel}>Pendentes offline</Text>
        <Text style={styles.statusValue}>{offlineCount} no dispositivo</Text>

        <TouchableOpacity style={styles.button} onPress={handleShowOfflineAlert}>
          <Text style={styles.buttonText}>Ver detalhes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={loadOfflineCount}>
          <Text style={styles.secondaryButtonText}>Atualizar contagem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16, paddingTop: 32 },
  title: { color: '#E5E7EB', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  label: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase', marginTop: 8 },
  value: { color: '#F9FAFB', fontSize: 16, fontWeight: '500' },
  statusLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 4 },
  statusValue: { color: '#F9FAFB', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#020617', fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#1F2937' },
  secondaryButtonText: { color: '#E5E7EB', fontWeight: '500' },
});
