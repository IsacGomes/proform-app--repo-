export type LocationStatus = 'captured' | 'denied' | 'error';

export interface LocationSnapshot {
  status: LocationStatus;
  capturedAt: string; // ISO timestamp from capture attempt
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export type UF =
  | ''
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

export interface FormPayload {
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

export interface FormData {
  id: string;
  createdAt: string; // ISO
  payload: FormPayload;
  location: LocationSnapshot;
}
