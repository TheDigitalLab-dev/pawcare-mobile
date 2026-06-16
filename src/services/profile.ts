/**
 * Servicio de Perfil (usuario autenticado) contra `../pawcare`.
 * Endpoints JSON: PATCH /profile, PATCH /profile/password.
 */
import { api } from './api';

export interface ProfileInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  identity_document?: string;
  address?: string;
  phone?: string;
  sex?: string;
  phone_type?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function updateProfile(input: ProfileInput): Promise<void> {
  await api.patch('/profile', input);
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await api.patch('/profile/password', input);
}

/** Elimina la cuenta del usuario autenticado (acción permanente). */
export async function deleteAccount(): Promise<void> {
  await api.delete('/profile');
}
