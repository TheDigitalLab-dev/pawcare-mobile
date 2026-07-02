import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, Badge, ListRow } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listAdoptionPets } from '@/services/public';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

/** Mascotas que puedes patrocinar (datos públicos reales del portal). */
export function SponsorshipsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { data, loading, error, reload } = useAsync(() => listAdoptionPets());
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Patrocinios"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="gift"
        emptyTitle="Sin mascotas para patrocinar"
        emptyDescription="Vuelve pronto: aún no hay mascotas disponibles."
      >
        {items.map((pet) => (
          <ListRow
            key={pet.id}
            title={pet.name}
            subtitle={`${SPECIES_LABEL[pet.species]}${pet.age_display ? ` · ${pet.age_display}` : ''}`}
            leading={
              <Avatar
                uri={pet.photo_url ?? undefined}
                fallback={SPECIES_EMOJI[pet.species]}
              />
            }
            trailing={
              <Badge
                label={`${pet.active_sponsors_count ?? 0} padrinos`}
                variant="info"
              />
            }
            onPress={() => navigation.navigate('SponsorshipDetail', { id: pet.id })}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
