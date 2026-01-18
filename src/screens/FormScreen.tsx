import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addForm } from '../storage/formsStorage';
import type { FormData } from '../types/Form';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FormScreen() {
  const navigation = useNavigation<Nav>();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha pelo menos nome e e-mail.');
      return;
    }

    const form: FormData = {
      id: Date.now().toString(),
      nome: nome.trim(),
      email: email.trim(),
      observacoes: observacoes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await addForm(form);
      setNome('');
      setEmail('');
      setObservacoes('');
      Alert.alert('Sucesso', 'Formulário salvo offline ✅');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o formulário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro Offline</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite o e-mail"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Digite observações"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar offline'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1F2937', marginTop: 12 }]}
        onPress={() => navigation.navigate('PendingForms')}
      >
        <Text style={[styles.buttonText, { color: '#E5E7EB' }]}>Ver pendentes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#020617', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, color: '#E5E7EB', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { color: '#E5E7EB', marginBottom: 4, marginTop: 12, fontSize: 14 },
  input: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: 24, backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#020617', fontWeight: 'bold', fontSize: 16 },
});
