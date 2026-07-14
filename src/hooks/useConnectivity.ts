/**
 * Estado de conectividad del dispositivo (expo-network). `true` = en línea.
 * Base del banner offline global y de los eventos O12/O13 del centro.
 */
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

function isOnline(state: Network.NetworkState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function useConnectivity(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Network.getNetworkStateAsync().then((state) => {
      if (!cancelled) setOnline(isOnline(state));
    });
    const sub = Network.addNetworkStateListener((state) => setOnline(isOnline(state)));
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return online;
}
