import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureLocationSnapshot } from '../services/locationCapture';
import { fetchCitiesByUF } from '../services/brLocations';
import { addForm } from '../storage/formsStorage';
import {
  FORM_SECTIONS,
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
type SelectFieldKey = 'estado' | 'cidade';

function isModalSelectFieldKey(key: FormFieldDefinition['key']): key is SelectFieldKey {
  return key === 'estado' || key === 'cidade';
}

function getLocationMessage(status: FormData['location']['status']): string {
  if (status === 'captured') return 'com localizacao capturada.';
  if (status === 'denied') return 'sem localizacao (permissao negada).';
  return 'sem localizacao (falha na captura).';
}

export function FormScreen() {
  const navigation = useNavigation<Nav>();
  const [values, setValues] = useState<FormValues>(() => createInitialFormValues());
  const [loading, setLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [modalField, setModalField] = useState<SelectFieldKey | null>(null);
  const [selectSearch, setSelectSearch] = useState('');

  const formTemplate = useMemo(() => getFormTemplate(cityOptions), [cityOptions]);
  const groupedTemplate = useMemo(
    () =>
      FORM_SECTIONS.map((section) => ({
        section,
        fields: formTemplate.filter((field) => field.section === section),
      })).filter((group) => group.fields.length > 0),
    [formTemplate],
  );

  useEffect(() => {
    let active = true;

    async function loadCities() {
      if (!values.estado) {
        setCityOptions([]);
        if (values.cidade) {
          setValues((prev) => ({ ...prev, cidade: '' }));
        }
        return;
      }

      setCityLoading(true);
      const cities = await fetchCitiesByUF(values.estado);
      if (!active) return;

      setCityOptions(cities);
      setCityLoading(false);

      setValues((prev) => (prev.cidade && !cities.includes(prev.cidade) ? { ...prev, cidade: '' } : prev));
    }

    loadCities();

    return () => {
      active = false;
    };
  }, [values.estado]);

  function setFieldValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    if (key === 'estado') {
      setValues((prev) => ({ ...prev, estado: value as FormValues['estado'], cidade: '' }));
      return;
    }

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
      setCityOptions([]);
      Alert.alert('Sucesso', `Formulario salvo offline ${getLocationMessage(location.status)}`);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o formulario.');
    } finally {
      setLoading(false);
    }
  }

  function openSelect(fieldKey: SelectFieldKey) {
    setSelectSearch('');
    setModalField(fieldKey);
  }

  function closeSelect() {
    setModalField(null);
    setSelectSearch('');
  }

  function renderSelectField(field: FormFieldDefinition & { key: SelectFieldKey }) {
    const selected = String(values[field.key] ?? '');
    const disabled = Boolean(field.disabled) || (field.key === 'cidade' && cityLoading);

    return (
      <View key={field.key} style={styles.fieldGroup}>
        <Text style={styles.label}>{field.required ? `${field.label} *` : field.label}</Text>
        <TouchableOpacity
          style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
          onPress={() => openSelect(field.key as SelectFieldKey)}
          disabled={disabled}
        >
          <Text style={[styles.selectButtonText, !selected && styles.selectButtonPlaceholder]}>
            {selected || field.placeholder || 'Selecione'}
          </Text>
          {field.key === 'cidade' && cityLoading && <ActivityIndicator size="small" color="#86EFAC" />}
        </TouchableOpacity>
      </View>
    );
  }

  function renderSexoField(field: FormFieldDefinition & { key: 'sexo' }) {
    const selected = values.sexo;
    const options = field.options ?? [];
    const label = field.required ? `${field.label} *` : field.label;

    return (
      <View key={field.key} style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.sexoOptionsRow}>
          {options.map((option) => {
            const isSelected = selected === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.sexoOptionButton, isSelected && styles.sexoOptionButtonSelected]}
                onPress={() => setFieldValue('sexo', option)}
              >
                <Text style={[styles.sexoOptionText, isSelected && styles.sexoOptionTextSelected]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  function renderField(field: FormFieldDefinition) {
    if (field.type === 'select') {
      if (field.key === 'sexo') {
        return renderSexoField(field as FormFieldDefinition & { key: 'sexo' });
      }

      if (isModalSelectFieldKey(field.key)) {
        return renderSelectField(field as FormFieldDefinition & { key: SelectFieldKey });
      }

      return null;
    }

    const label = field.required ? `${field.label} *` : field.label;
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

  const modalOptions = useMemo(() => {
    if (!modalField) return [];
    const definition = formTemplate.find((item) => item.key === modalField);
    const options = definition?.options ?? [];
    const term = selectSearch.trim().toLocaleLowerCase('pt-BR');

    if (!term) return options;

    return options.filter((option) => option.toLocaleLowerCase('pt-BR').includes(term));
  }, [formTemplate, modalField, selectSearch]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastro Offline</Text>

        {groupedTemplate.map((group) => (
          <View key={group.section} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{group.section}</Text>
            {group.fields.map((field) => renderField(field))}
          </View>
        ))}

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

      <Modal visible={modalField !== null} animationType="slide" transparent onRequestClose={closeSelect}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalField === 'estado' ? 'Selecionar UF' : 'Selecionar cidade'}</Text>

            <TextInput
              style={styles.modalSearch}
              value={selectSearch}
              onChangeText={setSelectSearch}
              placeholder="Buscar..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />

            <FlatList
              data={modalOptions}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setFieldValue(modalField as SelectFieldKey, item as FormValues[SelectFieldKey]);
                    closeSelect();
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyOptions}>Nenhuma opcao encontrada.</Text>}
            />

            <TouchableOpacity style={styles.modalClose} onPress={closeSelect}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  sectionCard: {
    marginTop: 14,
    backgroundColor: '#0B1220',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 10,
  },
  sectionTitle: {
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  selectButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonDisabled: {
    opacity: 0.55,
  },
  selectButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  selectButtonPlaceholder: {
    color: '#9CA3AF',
  },
  sexoOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sexoOptionButton: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  sexoOptionButtonSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#052E1A',
  },
  sexoOptionText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  sexoOptionTextSelected: {
    color: '#86EFAC',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.74)',
  },
  modalCard: {
    maxHeight: '78%',
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSearch: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 8,
    color: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 12,
  },
  modalOptionText: {
    color: '#E2E8F0',
    fontSize: 15,
  },
  emptyOptions: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
  },
  modalClose: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
});
