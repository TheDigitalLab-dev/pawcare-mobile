import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, ListRow } from '@/components';
import { formatMoney, mockServices } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

/** Catálogo de servicios disponibles. */
export function ServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { colors } = useTheme();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Servicios"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      {mockServices.length === 0 ? (
        <EmptyState
          icon="medkit"
          title="Sin servicios"
          description="Aún no hay servicios publicados."
        />
      ) : (
        mockServices.map((service) => {
          const priceLabel =
            service.price !== undefined
              ? formatMoney(service.price, service.currency)
              : 'Consultar';
          const duration =
            service.duration_minutes !== undefined
              ? ` · ${service.duration_minutes} min`
              : '';
          return (
            <ListRow
              key={service.id}
              title={service.name}
              subtitle={`${priceLabel}${duration}`}
              leading={
                <View>
                  <Ionicons name="medkit" size={22} color={colors.primary} />
                </View>
              }
              showChevron={false}
            />
          );
        })
      )}
    </MobileShell>
  );
}
