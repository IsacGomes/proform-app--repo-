import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormData } from '../types/Form';

const STORAGE_KEY = '@forms_queue';

export async function getForms(): Promise<FormData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as FormData[];
  } catch (error) {
    console.log('Erro ao buscar formulários:', error);
    return [];
  }
}

export async function addForm(form: FormData): Promise<void> {
  try {
    const current = await getForms();
    const updated = [...current, form];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log('Erro ao salvar formulário:', error);
    throw error;
  }
}

export async function clearForms(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log('Erro ao limpar formulários:', error);
  }
}
