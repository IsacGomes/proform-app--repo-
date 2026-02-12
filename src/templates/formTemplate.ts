import type { UF, FormPayload } from '../types/Form';
import { UF_OPTIONS } from '../services/brLocations';

export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'textarea';
export type FormSection = 'Pessoa' | 'Localização' | 'Contato' | 'Observações';

export const FORM_SECTIONS: readonly FormSection[] = [
  'Pessoa',
  'Localização',
  'Contato',
  'Observações',
];

export interface FormValues {
  nomeCompleto: string;
  apelido: string;
  estado: UF;
  cidade: string;
  zona: string;
  secao: string;
  nivelApoio: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tituloEleitor: string;
  cpf: string;
  rg: string;
  facebook: string;
  instagram: string;
  observacoes: string;
}

export interface FormFieldDefinition {
  key: keyof FormValues;
  label: string;
  section: FormSection;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  disabled?: boolean;
}

export function getFormTemplate(cityOptions: string[]): FormFieldDefinition[] {
  return [
    {
      key: 'nomeCompleto',
      label: 'Nome Completo',
      section: 'Pessoa',
      type: 'text',
      required: true,
      placeholder: 'Nome completo',
    },
    { key: 'apelido', label: 'Apelido', section: 'Pessoa', type: 'text', placeholder: 'Apelido' },
    {
      key: 'dataNascimento',
      label: 'Data de Nascimento',
      section: 'Pessoa',
      type: 'text',
      placeholder: 'DD/MM/AAAA ou AAAA-MM-DD',
    },
    {
      key: 'sexo',
      label: 'Sexo',
      section: 'Pessoa',
      type: 'select',
      options: ['Masculino', 'Feminino', 'Prefiro nao dizer'],
      placeholder: 'Selecione uma opcao',
    },
    {
      key: 'nivelApoio',
      label: 'Nivel de Apoio',
      section: 'Pessoa',
      type: 'text',
      placeholder: 'Nivel de apoio',
    },
    {
      key: 'tituloEleitor',
      label: 'Titulo de Eleitor',
      section: 'Pessoa',
      type: 'text',
      placeholder: 'Titulo de eleitor',
    },
    {
      key: 'cpf',
      label: 'CPF',
      section: 'Pessoa',
      type: 'text',
      required: true,
      placeholder: '000.000.000-00',
    },
    { key: 'rg', label: 'RG', section: 'Pessoa', type: 'text', placeholder: 'RG' },
    {
      key: 'estado',
      label: 'UF',
      section: 'Localização',
      type: 'select',
      required: true,
      options: [...UF_OPTIONS],
    },
    {
      key: 'cidade',
      label: 'Cidade',
      section: 'Localização',
      type: 'select',
      required: true,
      options: cityOptions,
      disabled: cityOptions.length === 0,
      placeholder: cityOptions.length === 0 ? 'Selecione a UF primeiro' : 'Selecione uma cidade',
    },
    { key: 'zona', label: 'Zona', section: 'Localização', type: 'text', placeholder: 'Zona' },
    { key: 'secao', label: 'Secao', section: 'Localização', type: 'text', placeholder: 'Secao' },
    {
      key: 'logradouro',
      label: 'Logradouro',
      section: 'Localização',
      type: 'text',
      placeholder: 'Logradouro',
    },
    { key: 'numero', label: 'Numero', section: 'Localização', type: 'text', placeholder: 'Numero' },
    {
      key: 'complemento',
      label: 'Complemento',
      section: 'Localização',
      type: 'text',
      placeholder: 'Complemento',
    },
    { key: 'bairro', label: 'Bairro', section: 'Localização', type: 'text', placeholder: 'Bairro' },
    { key: 'cep', label: 'CEP', section: 'Localização', type: 'text', placeholder: '00000-000' },
    {
      key: 'telefone',
      label: 'Telefone',
      section: 'Contato',
      type: 'phone',
      required: true,
      placeholder: '(00) 00000-0000',
    },
    { key: 'email', label: 'E-mail', section: 'Contato', type: 'email', placeholder: 'email@dominio.com' },
    {
      key: 'facebook',
      label: 'Facebook',
      section: 'Contato',
      type: 'text',
      placeholder: '@usuario',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      section: 'Contato',
      type: 'text',
      placeholder: '@usuario',
    },
    {
      key: 'observacoes',
      label: 'Observacoes',
      section: 'Observações',
      type: 'textarea',
      placeholder: 'Observacoes',
    },
  ];
}

export function createInitialFormValues(): FormValues {
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

export function validateFormValues(values: FormValues): { valid: boolean; message?: string } {
  if (!values.nomeCompleto.trim()) {
    return { valid: false, message: 'Nome Completo e obrigatorio.' };
  }

  if (!values.estado.trim()) {
    return { valid: false, message: 'UF e obrigatoria.' };
  }

  if (!values.cidade.trim()) {
    return { valid: false, message: 'Cidade e obrigatoria.' };
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

function normalizeUF(value: UF): UF {
  return UF_OPTIONS.includes(value as (typeof UF_OPTIONS)[number]) ? value : '';
}

function normalizeText(value: string): string {
  return value.trim();
}

export function normalizeFormValues(values: FormValues): FormPayload {
  return {
    nomeCompleto: normalizeText(values.nomeCompleto),
    apelido: normalizeText(values.apelido),
    estado: normalizeUF(values.estado),
    cidade: normalizeText(values.cidade),
    zona: normalizeText(values.zona),
    secao: normalizeText(values.secao),
    nivelApoio: normalizeText(values.nivelApoio),
    telefone: normalizeText(values.telefone),
    email: normalizeText(values.email),
    dataNascimento: normalizeText(values.dataNascimento),
    sexo: normalizeText(values.sexo),
    logradouro: normalizeText(values.logradouro),
    numero: normalizeText(values.numero),
    complemento: normalizeText(values.complemento),
    bairro: normalizeText(values.bairro),
    cep: normalizeText(values.cep),
    tituloEleitor: normalizeText(values.tituloEleitor),
    cpf: normalizeText(values.cpf),
    rg: normalizeText(values.rg),
    facebook: normalizeText(values.facebook),
    instagram: normalizeText(values.instagram),
    observacoes: normalizeText(values.observacoes),
  };
}
