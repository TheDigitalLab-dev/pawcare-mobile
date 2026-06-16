/**
 * Integración REAL del perfil contra `../pawcare`.
 * Idempotente: re-guarda los mismos datos y revierte, para no corromper la
 * cuenta sembrada compartida (otros tests dependen de ella).
 */
import * as authService from '@/services/auth';
import * as profileService from '@/services/profile';
import * as secureStore from '@/utils/secureStore';

beforeAll(async () => {
  await authService.login('owner1@example.com', 'password123');
});

afterAll(async () => {
  await secureStore.clearTokens();
});

describe('profileService.updateProfile', () => {
  it('actualiza la dirección y la revierte (real, no destructivo)', async () => {
    const before = await authService.fetchCurrentUser();
    const original = 'address' in before ? (before.address ?? '') : '';

    await profileService.updateProfile({ address: 'Calle de prueba 123' });
    const updated = await authService.fetchCurrentUser();
    expect('address' in updated ? updated.address : '').toBe('Calle de prueba 123');

    // Revertir al valor original.
    await profileService.updateProfile({ address: original });
  });
});
