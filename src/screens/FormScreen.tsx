import React, { useState } from 'react';  
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureLocationSnapshot } from '../services/locationCapture';
import { addForm } from '../storage/formsStorage';
import {
  createInitialFormValues,
  getFormTemplate,
  normalizeFormValues,
  validateFormValues,
  type FormFieldDefinition,
  type FormValues,
} from '../templates/formTemplate';
import type { FormData } from '../types/Form';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FORM_TEMPLATE = getFormTemplate();

function getLocationMessage(status: FormData['location']['status']): string {
  if (status === 'captured') return 'com localizacao capturada.';
  if (status === 'denied') return 'sem localizacao (permissao negada).';
  return 'sem localizacao (falha na captura).';
}

export function FormScreen() {
  const navigation = useNavigation<Nav>();
  const [values, setValues] = useState<FormValues>(() => createInitialFormValues());
  const [loading, setLoading] = useState(false);

  function setFieldValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const validation = validateFormValues(values);
    if (!validation.valid) {
      Alert.alert('Validacao', validation.message ?? 'Dados invalidos.');
      return;
    }

    try {
      setLoading(true);
      const payload = normalizeFormValues(values);
      const location = await captureLocationSnapshot();
      const form: FormData = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        payload,
        location,
      };

      await addForm(form);
      setValues(createInitialFormValues());
      Alert.alert('Sucesso', `Formulario salvo offline ${getLocationMessage(location.status)}`);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o formulario.');
    } finally {
      setLoading(false);
    }
  }

  function renderField(field: FormFieldDefinition) {
    const label = field.required ? `${field.label} *` : field.label;

    if (field.type === 'checkbox') {
      const checked = Boolean(values[field.key]);
      return (
        <View key={field.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={[styles.checkboxRow, checked && styles.checkboxRowChecked]}
            onPress={() => setFieldValue(field.key, (!checked) as FormValues[typeof field.key])}
          >
            <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
              {checked && <Text style={styles.checkboxMark}>X</Text>}
            </View>
            <Text style={styles.checkboxText}>{checked ? 'Sim' : 'Nao'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (field.type === 'select') {
      const selected = String(values[field.key] ?? '');
      return (
        <View key={field.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.optionsRow}>
            {field.options?.map((option) => {
              const isSelected = selected === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setFieldValue(field.key, option as FormValues[typeof field.key])}
                >
                  <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    const value = String(values[field.key] ?? '');
    const keyboardType =
      field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : 'default';

    return (
      <View key={field.key} style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, field.type === 'textarea' && styles.textArea]}
          value={value}
          onChangeText={(text) => setFieldValue(field.key, text as FormValues[typeof field.key])}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={field.type === 'textarea'}
          numberOfLines={field.type === 'textarea' ? 4 : 1}
          keyboardType={keyboardType}
          autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro Offline</Text>

      {FORM_TEMPLATE.map((field) => renderField(field))}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('PendingForms')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ver pendentes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    color: '#E5E7EB',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldGroup: {
    marginTop: 12,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#1F2937',
    fontSize: 14,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#052E1A',
  },
  optionButtonText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: '#86EFAC',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#0F172A',
  },
  checkboxRowChecked: {
    borderColor: '#22C55E',
    backgroundColor: '#052E1A',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#020617',
  },
  checkboxBoxChecked: {
    borderColor: '#22C55E',
    backgroundColor: '#166534',
  },
  checkboxMark: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxText: {
    color: '#E5E7EB',
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#22C55E',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#1F2937',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#E5E7EB',
  },
});
