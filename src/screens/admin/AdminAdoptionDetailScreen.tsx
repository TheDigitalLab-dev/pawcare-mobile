import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, PetAvatar } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getAdminAdoption, type AdoptionRecord } from '@/services/admin';
import { formatDate } from '@/utils/format';
import { SPECIES_EMOJI, SPECIES_LABEL, type Species } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;
type Rt = RouteProp<AdminPatientsStackParamList, 'AdminAdoptionDetail'>;

function speciesLabel(species?: string): string {
  return species && species in SPECIES_LABEL
    ? SPECIES_LABEL[species as Species]
    : (species ?? 'Mascota');
}

function speciesEmoji(species?: string): string {
  return species && species in SPECIES_EMOJI ? SPECIES_EMOJI[species as Species] : '🐾';
}

function Body({ adoption }: { adoption: AdoptionRecord }) {
  const petName = adoption.pet?.name ?? 'Mascota';
  return (
    <>
      <DetailHero
        title={petName}
        subtitle={speciesLabel(adoption.pet?.species)}
        avatar={<PetAvatar fallback={speciesEmoji(adoption.pet?.species)} size="lg" />}
      >
        <Badge label="Adoptada" variant="success" />
      </DetailHero>

      <ListRow
        title="Fecha de adopción"
        subtitle={
          adoption.adoption_date ? formatDate(adoption.adoption_date) : 'Sin fecha'
        }
      />
      <ListRow
        title="Adoptante"
        subtitle={adoption.adopter?.full_name ?? 'Sin registrar'}
      />
      {adoption.adopter?.email ? (
        <ListRow title="Correo" subtitle={adoption.adopter.email} />
      ) : null}
      <ListRow
        title="Procesada por"
        subtitle={adoption.processed_by?.full_name ?? 'Sin registrar'}
      />
      <ListRow title="Notas" subtitle={adoption.notes ?? 'Sin notas'} />
    </>
  );
}

export function AdminAdoptionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getAdminAdoption(params.id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title={data?.pet?.name ?? 'Adopción'} onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body adoption={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
