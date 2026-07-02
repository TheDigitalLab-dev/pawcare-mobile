import { useNavigation } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, Button, SectionTitle } from '@/components/ui';
import { AdminModuleGrid, ListRow, ThemeToggle } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminModulesScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Más" />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <SectionTitle>Módulos clínicos y administrativos</SectionTitle>
      <AdminModuleGrid
        modules={[
          {
            id: 'consultations',
            label: 'Consultas',
            icon: 'medkit',
            onPress: () => navigation.navigate('AdminConsultationsList'),
          },
          {
            id: 'vaccinations',
            label: 'Vacunas',
            icon: 'bandage',
            onPress: () => navigation.navigate('AdminVaccinationsList'),
          },
          {
            id: 'dewormings',
            label: 'Desparasitaciones',
            icon: 'flask',
            onPress: () => navigation.navigate('AdminDewormingsList'),
          },
          {
            id: 'payments',
            label: 'Pagos',
            icon: 'card',
            onPress: () => navigation.navigate('AdminPaymentsList'),
          },
          {
            id: 'reports',
            label: 'Reportes',
            icon: 'document-text',
            onPress: () => navigation.navigate('AdminMedicalReportsList'),
          },
        ]}
      />

      <SectionTitle>Apariencia</SectionTitle>
      <ThemeToggle />

      <SectionTitle>Cuenta y servidor</SectionTitle>
      <View style={{ gap: 8 }}>
        <ListRow
          title="Configurar servidor"
          subtitle="Elige a qué backend se conecta la app"
          leading={<Avatar fallback="🌐" />}
          onPress={() => navigation.navigate('AdminServerSettings')}
        />
      </View>

      <Button
        label="Cerrar sesión"
        variant="outline"
        fullWidth
        onPress={confirmLogout}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
