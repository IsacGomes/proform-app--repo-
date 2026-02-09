export type LocationStatus = 'captured' | 'denied' | 'error';

export interface LocationSnapshot {
  status: LocationStatus;
  capturedAt: string; // ISO timestamp from capture attempt
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export type EstadoCivil = '' | 'Solteiro' | 'Casado' | 'Divorciado';

export interface FormPayload {
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
  tags: string[];
  observacoes: string;
}

export interface FormData {
  id: string;
  createdAt: string; // ISO
  payload: FormPayload;
  location: LocationSnapshot;
}
