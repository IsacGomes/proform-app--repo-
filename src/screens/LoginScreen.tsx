import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('operador@proform.app');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login', 'Informe email e senha.');
      return;
    }

    try {
      setLoading(true);
      await signIn({ email, password });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar.';
      Alert.alert('Falha no login', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProForm</Text>
      <Text style={styles.subtitle}>Entre para continuar</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="voce@empresa.com"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Sua senha"
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Demo local: operador@proform.app / 123456</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#020617',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 26,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    color: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  button: {
    backgroundColor: '#22C55E',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#052E16',
    fontSize: 15,
    fontWeight: '800',
  },
  hint: {
    marginTop: 16,
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
  },
});
