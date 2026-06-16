import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, InfoBanner, SectionTitle, UploadZone } from '@/components';
import type { PublicStackParamList } from '@/navigation/types';

/** Subida del comprobante de pago de un pedido. */
export function UploadProofScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const route = useRoute<RouteProp<PublicStackParamList, 'UploadProof'>>();
  const [selectedName, setSelectedName] = useState<string | undefined>(undefined);

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Comprobante de pago"
          subtitle={`Pedido #${route.params.orderId}`}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <SectionTitle>Adjunta tu comprobante</SectionTitle>
      <UploadZone
        label="Subir comprobante"
        hint="Toca para elegir foto o documento"
        selectedName={selectedName}
        onPress={() => {
          // No-op: selección de archivo simulada.
          setSelectedName('comprobante.jpg');
        }}
      />

      <InfoBanner message="Validaremos tu pago y confirmaremos el pedido por correo." />

      <Button
        label="Enviar comprobante"
        fullWidth
        disabled={!selectedName}
        onPress={() => navigation.navigate('PublicLanding')}
      />
    </MobileShell>
  );
}
