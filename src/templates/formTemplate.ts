import type { EstadoCivil, FormPayload } from '../types/Form';

export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';

export interface FormValues {
  lideranca: string;
  isLideranca: boolean;
  tipo: string;
  nomeCompleto: string;
  apelido: string;
  estado: EstadoCivil;
  cidade: string;
  zona: string;
  secao: string;
  nivelApoio: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  localidade: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tituloEleitor: string;
  cpf: string;
  rg: string;
  validacao: string;
  facebook: string;
  instagram: string;
  categoria: string;
  tags: string;
  observacoes: string;
}

export interface FormFieldDefinition {
  key: keyof FormValues;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const ESTADO_OPTIONS = ['Solteiro', 'Casado', 'Divorciado'] as const;

const FORM_TEMPLATE: FormFieldDefinition[] = [
  { key: 'lideranca', label: 'Lideranca', type: 'text', placeholder: 'Informe a lideranca' },
  { key: 'isLideranca', label: 'E lideranca?', type: 'checkbox' },
  { key: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Tipo de cadastro' },
  { key: 'nomeCompleto', label: 'Nome Completo', type: 'text', required: true, placeholder: 'Nome completo' },
  { key: 'apelido', label: 'Apelido', type: 'text', placeholder: 'Apelido' },
  { key: 'estado', label: 'Estado', type: 'select', options: [...ESTADO_OPTIONS] },
  { key: 'cidade', label: 'Cidade', type: 'text', placeholder: 'Cidade' },
  { key: 'zona', label: 'Zona', type: 'text', placeholder: 'Zona' },
  { key: 'secao', label: 'Secao', type: 'text', placeholder: 'Secao' },
  { key: 'nivelApoio', label: 'Nivel de Apoio', type: 'text', placeholder: 'Nivel de apoio' },
  { key: 'telefone', label: 'Telefone', type: 'phone', required: true, placeholder: '(00) 00000-0000' },
  { key: 'email', label: 'E-mail', type: 'email', placeholder: 'email@dominio.com' },
  {
    key: 'dataNascimento',
    label: 'Data de Nascimento',
    type: 'text',
    placeholder: 'DD/MM/AAAA ou AAAA-MM-DD',
  },
  { key: 'sexo', label: 'Sexo', type: 'text', placeholder: 'Sexo' },
  { key: 'localidade', label: 'Localidade', type: 'text', placeholder: 'Localidade' },
  { key: 'logradouro', label: 'Logradouro', type: 'text', placeholder: 'Logradouro' },
  { key: 'numero', label: 'Numero', type: 'text', placeholder: 'Numero' },
  { key: 'complemento', label: 'Complemento', type: 'text', placeholder: 'Complemento' },
  { key: 'bairro', label: 'Bairro', type: 'text', placeholder: 'Bairro' },
  { key: 'cep', label: 'CEP', type: 'text', placeholder: '00000-000' },
  { key: 'tituloEleitor', label: 'Titulo de Eleitor', type: 'text', placeholder: 'Titulo de eleitor' },
  { key: 'cpf', label: 'CPF', type: 'text', required: true, placeholder: '000.000.000-00' },
  { key: 'rg', label: 'RG', type: 'text', placeholder: 'RG' },
  { key: 'validacao', label: 'Validacao', type: 'text', placeholder: 'Status de validacao' },
  { key: 'facebook', label: 'Facebook', type: 'text', placeholder: '@usuario' },
  { key: 'instagram', label: 'Instagram', type: 'text', placeholder: '@usuario' },
  { key: 'categoria', label: 'Categoria', type: 'text', placeholder: 'Categoria' },
  { key: 'tags', label: 'Tags', type: 'text', placeholder: 'tag1, tag2, tag3' },
  { key: 'observacoes', label: 'Observacoes', type: 'textarea', placeholder: 'Observacoes' },
];

export function getFormTemplate(): FormFieldDefinition[] {
  return FORM_TEMPLATE;
}

export function createInitialFormValues(): FormValues {
  return {
    lideranca: '',
    isLideranca: false,
    tipo: '',
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
    localidade: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    tituloEleitor: '',
    cpf: '',
    rg: '',
    validacao: '',
    facebook: '',
    instagram: '',
    categoria: '',
    tags: '',
    observacoes: '',
  };
}

export function validateFormValues(values: FormValues): { valid: boolean; message?: string } {
  if (!values.nomeCompleto.trim()) {
    return { valid: false, message: 'Nome Completo e obrigatorio.' };
  }

  if (!values.telefone.trim()) {
    return { valid: false, message: 'Telefone e obrigatorio.' };
  }

  if (!values.cpf.trim()) {
    return { valid: false, message: 'CPF e obrigatorio.' };
  }

  const dataNascimento = values.dataNascimento.trim();
  if (dataNascimento) {
    const isValidDateFormat = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/.test(dataNascimento);
    if (!isValidDateFormat) {
      return { valid: false, message: 'Use DD/MM/AAAA ou AAAA-MM-DD em Data de Nascimento.' };
    }
  }

  return { valid: true };
}

function normalizeEstado(value: EstadoCivil): EstadoCivil {
  return ESTADO_OPTIONS.includes(value as (typeof ESTADO_OPTIONS)[number]) ? value : '';
}

function normalizeText(value: string): string {
  return value.trim();
}

export function normalizeFormValues(values: FormValues): FormPayload {
  return {
    lideranca: normalizeText(values.lideranca),
    isLideranca: values.isLideranca,
    tipo: normalizeText(values.tipo),
    nomeCompleto: normalizeText(values.nomeCompleto),
    apelido: normalizeText(values.apelido),
    estado: normalizeEstado(values.estado),
    cidade: normalizeText(values.cidade),
    zona: normalizeText(values.zona),
    secao: normalizeText(values.secao),
    nivelApoio: normalizeText(values.nivelApoio),
    telefone: normalizeText(values.telefone),
    email: normalizeText(values.email),
    dataNascimento: normalizeText(values.dataNascimento),
    sexo: normalizeText(values.sexo),
    localidade: normalizeText(values.localidade),
    logradouro: normalizeText(values.logradouro),
    numero: normalizeText(values.numero),
    complemento: normalizeText(values.complemento),
    bairro: normalizeText(values.bairro),
    cep: normalizeText(values.cep),
    tituloEleitor: normalizeText(values.tituloEleitor),
    cpf: normalizeText(values.cpf),
    rg: normalizeText(values.rg),
    validacao: normalizeText(values.validacao),
    facebook: normalizeText(values.facebook),
    instagram: normalizeText(values.instagram),
    categoria: normalizeText(values.categoria),
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
    observacoes: normalizeText(values.observacoes),
  };
}
