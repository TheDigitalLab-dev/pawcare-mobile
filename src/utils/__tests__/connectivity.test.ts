import { connectivityEvent } from '@/utils/connectivity';

describe('connectivityEvent', () => {
  it('al perder conexión anuncia el modo local (O12)', () => {
    const e = connectivityEvent(true, false);
    expect(e?.title).toContain('Sin conexión');
    expect(e?.body).toContain('datos locales');
  });

  it('al recuperar conexión anuncia la sincronización (O13)', () => {
    const e = connectivityEvent(false, true);
    expect(e?.title).toContain('Conexión recuperada');
    expect(e?.body).toContain('sincronizar');
  });

  it('sin transición no hay evento', () => {
    expect(connectivityEvent(true, true)).toBeNull();
    expect(connectivityEvent(false, false)).toBeNull();
  });
});
