import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Card, InfoBanner, SectionTitle } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getMedicalProfile } from '@/services/medical';
import type { MedicalProfile } from '@/types/models';

function ProfileBody({ profile }: { profile: MedicalProfile | null }) {
  const { colors } = useTheme();
  const allergies = profile?.allergies ?? [];
  const chronic = profile?.chronic_diseases ?? [];

  return (
    <>
      <SectionTitle>Alergias</SectionTitle>
      {allergies.length === 0 ? (
        <InfoBanner message="Sin alergias registradas." tone="success" />
      ) : (
        <Card style={{ gap: 6 }}>
          {allergies.map((a) => (
            <Text key={a} style={{ fontSize: 15, color: colors.foreground }}>
              • {a}
            </Text>
          ))}
        </Card>
      )}

      <SectionTitle>Enfermedades crónicas</SectionTitle>
      {chronic.length === 0 ? (
        <InfoBanner message="Sin enfermedades crónicas registradas." tone="success" />
      ) : (
        <Card style={{ gap: 6 }}>
          {chronic.map((d) => (
            <Text key={d} style={{ fontSize: 15, color: colors.foreground }}>
              • {d}
            </Text>
          ))}
        </Card>
      )}

      <SectionTitle>Tipo de sangre</SectionTitle>
      <Card>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
          {profile?.blood_type ?? 'No registrado'}
        </Text>
      </Card>

      <SectionTitle>Notas</SectionTitle>
      <Card>
        <Text style={{ fontSize: 15, color: colors.foreground }}>
          {profile?.notes ?? 'Sin notas.'}
        </Text>
      </Card>
    </>
  );
}

export function MedicalProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'MedicalProfile'>>();
  const { petId } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getMedicalProfile(petId));

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Perfil médico" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        <ProfileBody profile={data} />
      </AsyncBoundary>
    </MobileShell>
  );
}
