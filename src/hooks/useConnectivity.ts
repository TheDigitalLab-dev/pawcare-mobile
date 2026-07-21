/**
 * Estado de conectividad del dispositivo (expo-network). `true` = en línea.
 *
 * Usa UN solo listener nativo compartido para toda la app (MobileShell monta el
 * banner offline en cada pantalla; sin esto, cada navegación crearía y
 * destruiría su propia suscripción). Los componentes se suscriben al estado en
 * memoria vía `useSyncExternalStore`.
 */
import * as Network from 'expo-network';
import { useSyncExternalStore } from 'react';

function isOnline(state: Network.NetworkState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

let currentOnline = true;
let started = false;
const listeners = new Set<() => void>();

function setOnline(next: boolean): void {
  if (next === currentOnline) return;
  currentOnline = next;
  for (const listener of listeners) listener();
}

function ensureStarted(): void {
  if (started) return;
  started = true;
  Network.getNetworkStateAsync()
    .then((state) => setOnline(isOnline(state)))
    .catch(() => {
      // Sin lectura inicial: se asume en línea hasta el primer evento.
    });
  Network.addNetworkStateListener((state) => setOnline(isOnline(state)));
}

function subscribe(listener: () => void): () => void {
  ensureStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return currentOnline;
}

export function useConnectivity(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
