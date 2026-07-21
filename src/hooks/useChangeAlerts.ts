/**
 * Conecta una lista recién sincronizada con el motor de alertas por cambio:
 * cada vez que llegan datos nuevos se diffea contra el snapshot local y las
 * novedades caen al centro de notificaciones. Local-first: si la base no está
 * lista, simplemente no registra (nunca rompe la pantalla).
 */
import { useEffect } from 'react';

import { initDatabase } from '@/db/database';
import { processChangeAlerts, type ChangeAlertConfig } from '@/services/changeAlerts';

export function useChangeAlerts<T>(data: T[] | null, config: ChangeAlertConfig<T>): void {
  useEffect(() => {
    if (!data) return;
    try {
      processChangeAlerts(initDatabase(), data, config);
    } catch {
      // Base local no disponible: el diff se hará en la próxima carga.
    }
  }, [data, config]);
}
