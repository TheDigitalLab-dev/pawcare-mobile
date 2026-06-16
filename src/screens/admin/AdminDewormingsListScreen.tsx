import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, Fab } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDate, mockDewormings } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminDewormingsListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Desparasitaciones"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 4, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar desparasitación"
          // No-op: sin backend (sin formulario dedicado en este stack).
          onPress={() => {}}
        />
      }
    >
      {mockDewormings.length === 0 ? (
        <EmptyState
          icon="flask"
          title="Sin desparasitaciones"
          description="No hay desparasitaciones registradas."
        />
      ) : (
        mockDewormings.map((d, index) => (
          <TimelineItem
            key={d.id}
            title={d.product_name}
            date={`Aplicada: ${formatDate(d.application_date)}`}
            description={`${d.dose ?? 'Dosis no especificada'} · Próxima: ${formatDate(d.next_due_date)}`}
            last={index === mockDewormings.length - 1}
          />
        ))
      )}
    </MobileShell>
  );
}
