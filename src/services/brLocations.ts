import type { UF } from '../types/Form';

export const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

const API_BASE = 'https://servicodados.ibge.gov.br/api/v1';
const cityCache = new Map<UF, string[]>();

interface IbgeCityResponse {
  nome?: unknown;
}

function sanitizeCityName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function fetchCitiesByUF(uf: UF): Promise<string[]> {
  if (!uf) return [];

  const cached = cityCache.get(uf);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/localidades/estados/${uf}/municipios`);
    if (!response.ok) {
      throw new Error(`Falha ao carregar cidades (${response.status})`);
    }

    const data = (await response.json()) as IbgeCityResponse[];
    const cities = data
      .map((item) => sanitizeCityName(item.nome))
      .filter((name) => name.length > 0)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    cityCache.set(uf, cities);
    return cities;
  } catch (error) {
    console.log('Erro ao buscar cidades por UF:', error);
    return [];
  }
}
