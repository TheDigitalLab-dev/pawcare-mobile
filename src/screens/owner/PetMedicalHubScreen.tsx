import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { ActionTileGrid } from '@/components/domain';
import type { ActionTile } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function PetMedicalHubScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'PetMedicalHub'>>();
  const { petId } = route.params;

  const tiles: ActionTile[] = [
    {
      id: 'profile',
      label: 'Perfil médico',
      icon: 'medkit',
      onPress: () => navigation.navigate('MedicalProfile', { petId }),
    },
    {
      id: 'vaccinations',
      label: 'Vacunas',
      icon: 'bandage',
      onPress: () => navigation.navigate('Vaccinations', { petId }),
    },
    {
      id: 'dewormings',
      label: 'Desparasitaciones',
      icon: 'flask',
      onPress: () => navigation.navigate('Dewormings', { petId }),
    },
    {
      id: 'consultations',
      label: 'Consultas',
      icon: 'document-text',
      onPress: () => navigation.navigate('Consultations', { petId }),
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'reader',
      onPress: () => navigation.navigate('MedicalReports', { petId }),
    },
    {
      id: 'treatments',
      label: 'Tratamientos',
      icon: 'alarm',
      onPress: () => navigation.navigate('Treatments'),
    },
  ];

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Salud"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <ActionTileGrid tiles={tiles} />
    </MobileShell>
  );
}
