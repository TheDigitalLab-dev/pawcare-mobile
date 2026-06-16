import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, SectionTitle } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDate } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

interface ScheduleItem {
  id: number;
  label: string;
  dueDate: string;
  completed: boolean;
}
interface Schedule {
  id: number;
  name: string;
  pet_name: string;
  items: ScheduleItem[];
}

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 1,
    name: 'Esquema cachorro',
    pet_name: 'Firulais',
    items: [
      { id: 1, label: 'Primera dosis quíntuple', dueDate: '2026-01-15', completed: true },
      { id: 2, label: 'Refuerzo quíntuple', dueDate: '2026-07-15', completed: false },
      { id: 3, label: 'Antirrábica', dueDate: '2026-04-10', completed: true },
    ],
  },
  {
    id: 2,
    name: 'Esquema anual',
    pet_name: 'Michi',
    items: [
      { id: 4, label: 'Triple felina', dueDate: '2026-03-01', completed: false },
      { id: 5, label: 'Antirrábica', dueDate: '2026-03-01', completed: false },
    ],
  },
];

export function AdminVaccinationSchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);

  const completeItem = (scheduleId: number, itemId: number) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, completed: true } : it,
              ),
            }
          : s,
      ),
    );
  };

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Esquemas de vacunación"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      {schedules.map((schedule) => (
        <ScheduleBlock key={schedule.id} schedule={schedule} onComplete={completeItem} />
      ))}
    </MobileShell>
  );
}

function ScheduleBlock({
  schedule,
  onComplete,
}: {
  schedule: Schedule;
  onComplete: (scheduleId: number, itemId: number) => void;
}) {
  return (
    <>
      <SectionTitle>{`${schedule.name} · ${schedule.pet_name}`}</SectionTitle>
      {schedule.items.map((item) => (
        <ListRow
          key={item.id}
          title={item.label}
          subtitle={`Vence: ${formatDate(item.dueDate)}`}
          trailing={
            item.completed ? (
              <Badge label="Completado" variant="success" />
            ) : (
              <Button
                label="Completar"
                size="sm"
                onPress={() => onComplete(schedule.id, item.id)}
              />
            )
          }
        />
      ))}
    </>
  );
}
