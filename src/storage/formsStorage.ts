import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UF, FormData, FormPayload, LocationSnapshot, LocationStatus } from '../types/Form';
import { UF_OPTIONS } from '../services/brLocations';

const STORAGE_KEY = '@forms_queue';

const UF_VALUES: UF[] = ['', ...(UF_OPTIONS as readonly UF[])];

interface LegacyFormData {
  id?: unknown;
  nome?: unknown;
  email?: unknown;
  observacoes?: unknown;
  createdAt?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeUF(value: unknown): UF {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toUpperCase();
  return UF_VALUES.includes(trimmed as UF) ? (trimmed as UF) : '';
}

function sanitizeStatus(value: unknown): LocationStatus {
  if (value === 'captured' || value === 'denied' || value === 'error') return value;
  return 'error';
}

function sanitizeNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function createEmptyPayload(): FormPayload {
  return {
    nomeCompleto: '',
    apelido: '',
    estado: '',
    cidade: '',
    zona: '',
    secao: '',
    nivelApoio: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    sexo: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    tituloEleitor: '',
    cpf: '',
    rg: '',
    facebook: '',
    instagram: '',
    observacoes: '',
  };
}

function sanitizePayload(value: unknown): FormPayload {
  const payload = createEmptyPayload();
  if (!isRecord(value)) return payload;

  return {
    nomeCompleto: sanitizeString(value.nomeCompleto),
    apelido: sanitizeString(value.apelido),
    estado: sanitizeUF(value.estado),
    cidade: sanitizeString(value.cidade),
    zona: sanitizeString(value.zona),
    secao: sanitizeString(value.secao),
    nivelApoio: sanitizeString(value.nivelApoio),
    telefone: sanitizeString(value.telefone),
    email: sanitizeString(value.email),
    dataNascimento: sanitizeString(value.dataNascimento),
    sexo: sanitizeString(value.sexo),
    logradouro: sanitizeString(value.logradouro),
    numero: sanitizeString(value.numero),
    complemento: sanitizeString(value.complemento),
    bairro: sanitizeString(value.bairro),
    cep: sanitizeString(value.cep),
    tituloEleitor: sanitizeString(value.tituloEleitor),
    cpf: sanitizeString(value.cpf),
    rg: sanitizeString(value.rg),
    facebook: sanitizeString(value.facebook),
    instagram: sanitizeString(value.instagram),
    observacoes: sanitizeString(value.observacoes),
  };
}

function sanitizeLocation(value: unknown, fallbackCapturedAt: string): LocationSnapshot {
  if (!isRecord(value)) {
    return {
      status: 'error',
      capturedAt: fallbackCapturedAt,
      latitude: null,
      longitude: null,
      accuracy: null,
    };
  }

  const capturedAt = sanitizeString(value.capturedAt) || fallbackCapturedAt;

  return {
    status: sanitizeStatus(value.status),
    capturedAt,
    latitude: sanitizeNumberOrNull(value.latitude),
    longitude: sanitizeNumberOrNull(value.longitude),
    accuracy: sanitizeNumberOrNull(value.accuracy),
  };
}

function sanitizeLegacyForm(value: LegacyFormData, index: number): FormData {
  const createdAt = sanitizeString(value.createdAt) || new Date().toISOString();
  const id = sanitizeString(value.id) || `legacy-${createdAt}-${index}`;

  const payload = createEmptyPayload();
  payload.nomeCompleto = sanitizeString(value.nome);
  payload.email = sanitizeString(value.email);
  payload.observacoes = sanitizeString(value.observacoes);

  return {
    id,
    createdAt,
    payload,
    location: {
      status: 'error',
      capturedAt: createdAt,
      latitude: null,
      longitude: null,
      accuracy: null,
    },
  };
}

function sanitizeFormItem(value: unknown, index: number): FormData | null {
  if (!isRecord(value)) return null;

  const hasNewShape = 'payload' in value && 'location' in value;
  if (hasNewShape) {
    const createdAt = sanitizeString(value.createdAt) || new Date().toISOString();
    const id = sanitizeString(value.id) || `generated-${createdAt}-${index}`;

    return {
      id,
      createdAt,
      payload: sanitizePayload(value.payload),
      location: sanitizeLocation(value.location, createdAt),
    };
  }

  const hasLegacyShape = 'nome' in value || 'email' in value || 'observacoes' in value;
  if (hasLegacyShape) {
    return sanitizeLegacyForm(value as LegacyFormData, index);
  }

  return null;
}

function sanitizeForms(raw: unknown): FormData[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => sanitizeFormItem(item, index))
    .filter((item): item is FormData => item !== null);
}

export async function getForms(): Promise<FormData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data) as unknown;
    const safeForms = sanitizeForms(parsed);

    if (JSON.stringify(safeForms) !== data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safeForms));
    }

    return safeForms;
  } catch (error) {
    console.log('Erro ao buscar formularios:', error);
    return [];
  }
}

export async function addForm(form: FormData): Promise<void> {
  try {
    const safeForm = sanitizeFormItem(form, 0);
    if (!safeForm) {
      throw new Error('Invalid form payload');
    }

    const current = await getForms();
    const updated = [...current, safeForm];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log('Erro ao salvar formulario:', error);
    throw error;
  }
}

export async function clearForms(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log('Erro ao limpar formularios:', error);
  }
}
