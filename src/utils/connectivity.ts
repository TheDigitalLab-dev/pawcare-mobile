/**
 * Transiciones de conectividad (plan-notificaciones.md, O12/O13). El modo
 * offline NO es un error: es la operación normal en campo (local-first);
 * estos eventos informan al usuario y quedan en el centro de notificaciones.
 */

export interface ConnectivityEvent {
  type: 'conectividad';
  title: string;
  body: string;
}

export function connectivityEvent(
  prevOnline: boolean,
  online: boolean,
): ConnectivityEvent | null {
  if (prevOnline === online) return null;
  if (!online) {
    return {
      type: 'conectividad',
      title: '📴 Sin conexión',
      body: 'Trabajando con los datos locales del teléfono; tus cambios se guardan aquí y nada se pierde.',
    };
  }
  return {
    type: 'conectividad',
    title: '📶 Conexión recuperada',
    body: 'Los cambios locales pendientes se van a sincronizar con el consultorio.',
  };
}
