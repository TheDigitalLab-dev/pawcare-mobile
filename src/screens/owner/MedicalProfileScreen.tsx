import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Card, InfoBanner, SectionTitle } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { mockMedicalProfile } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function MedicalProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const profile = mockMedicalProfile;

  const allergies = profile.allergies ?? [];
  const chronic = profile.chronic_diseases ?? [];

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Perfil médico"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
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
          {profile.blood_type ?? 'No registrado'}
        </Text>
      </Card>

      <SectionTitle>Notas</SectionTitle>
      <Card>
        <Text style={{ fontSize: 15, color: colors.foreground }}>
          {profile.notes ?? 'Sin notas.'}
        </Text>
      </Card>
    </MobileShell>
  );
}
