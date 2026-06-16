import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, SectionTitle } from '@/components/ui';
import { ListRow, TimelineItem } from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { formatDate, mockConsultations, mockPets, mockVaccinations } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

export function OwnerMedicalHistoryScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Historial médico"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <SectionTitle>Mis mascotas</SectionTitle>
      <View style={{ gap: 8 }}>
        {mockPets.map((pet) => (
          <ListRow
            key={pet.id}
            title={pet.name}
            subtitle={`${SPECIES_LABEL[pet.species]}${pet.breed ? ` · ${pet.breed}` : ''}`}
            leading={<Avatar fallback={SPECIES_EMOJI[pet.species]} />}
            // TODO: navegar al hub médico de la mascota (PetsTab → PetMedicalHub)
            onPress={() => undefined}
          />
        ))}
      </View>

      <SectionTitle>Últimas consultas</SectionTitle>
      <View>
        {mockConsultations.map((c, i) => (
          <TimelineItem
            key={c.id}
            title={c.diagnosis ?? 'Consulta'}
            date={formatDate(c.consultation_date)}
            description={c.veterinarian.full_name}
            last={i === mockConsultations.length - 1}
          />
        ))}
      </View>

      <SectionTitle>Vacunas recientes</SectionTitle>
      <View>
        {mockVaccinations.map((v, i) => (
          <TimelineItem
            key={v.id}
            tone="success"
            title={v.vaccine_name}
            date={formatDate(v.application_date)}
            description={
              v.next_due_date
                ? `Próxima dosis: ${formatDate(v.next_due_date)}`
                : undefined
            }
            last={i === mockVaccinations.length - 1}
          />
        ))}
      </View>
    </MobileShell>
  );
}
