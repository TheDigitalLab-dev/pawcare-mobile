import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import {
  Badge,
  EmptyState,
  SectionTitle,
  UploadZone,
  type BadgeVariant,
} from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { mockLabExams } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completado',
};
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

export function LabExamsScreen() {
  const navigation = useNavigation<Nav>();
  const [uploaded, setUploaded] = useState(false);

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Exámenes de laboratorio"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      {mockLabExams.length === 0 ? (
        <EmptyState
          icon="flask"
          title="Sin exámenes"
          description="No hay exámenes de laboratorio."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {mockLabExams.map((e) => (
            <ListRow
              key={e.id}
              title={e.exam_name}
              subtitle={e.results}
              showChevron={false}
              trailing={
                <Badge
                  label={STATUS_LABEL[e.status] ?? e.status}
                  variant={STATUS_VARIANT[e.status] ?? 'outline'}
                />
              }
            />
          ))}
        </View>
      )}

      <SectionTitle>Subir resultados</SectionTitle>
      <UploadZone
        label="Adjuntar archivo de laboratorio"
        hint="Toca para subir el PDF o la imagen del resultado"
        selectedName={uploaded ? 'resultado.pdf' : undefined}
        onPress={() => setUploaded(true)}
      />
    </MobileShell>
  );
}
