/**
 * Tests del hook `useAsync` usando datos REALES del backend (servicio de pets).
 */
import { renderHook, waitFor } from '@testing-library/react-native';

import { useAsync } from '@/hooks/useAsync';
import * as authService from '@/services/auth';
import * as petsService from '@/services/pets';
import * as secureStore from '@/utils/secureStore';
import { ApiError } from '@/types/api';

beforeAll(async () => {
  await authService.login('owner1@example.com', 'password123');
});

afterAll(async () => {
  await secureStore.clearTokens();
});

describe('useAsync', () => {
  it('arranca en loading y expone data al resolverse', async () => {
    const { result } = renderHook(() => useAsync(() => petsService.listPets()));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('expone un ApiError cuando la petición falla', async () => {
    const { result } = renderHook(() => useAsync(() => petsService.getPet(99999999)));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.status).toBe(404);
    expect(result.current.data).toBeNull();
  });
});
