/**
 * Programa los recordatorios locales calculados por `utils/reminders` (puros y
 * probados con TDD). Capa fina sobre expo-notifications: el `identifier`
 * estable de cada aviso hace la operación idempotente — reprogramar reemplaza,
 * nunca duplica. Los avisos suenan sin conexión (local-first).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderSpec } from '@/utils/reminders';

import { ensureAlarmPermissions } from './alarms';

export const REMINDERS_CHANNEL_ID = 'reminders';

let channelReady = false;

async function ensureChannel(): Promise<void> {
  if (channelReady || Platform.OS !== 'android') {
    channelReady = true;
    return;
  }
  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Recordatorios de citas y vacunas',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
  channelReady = true;
}

/** Programa (o reemplaza) los avisos dados. Sin permiso, no hace nada. */
export async function syncReminders(specs: ReminderSpec[]): Promise<void> {
  if (specs.length === 0) return;
  const granted = await ensureAlarmPermissions();
  if (!granted) return;
  await ensureChannel();

  await Promise.all(
    specs.map((spec) =>
      Notifications.scheduleNotificationAsync({
        identifier: spec.identifier,
        content: { title: spec.title, body: spec.body, sound: 'default' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(spec.triggerAt),
          channelId: REMINDERS_CHANNEL_ID,
        },
      }),
    ),
  );
}
