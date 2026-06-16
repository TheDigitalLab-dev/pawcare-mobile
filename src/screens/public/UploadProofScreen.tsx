import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, InfoBanner, SectionTitle, UploadZone } from '@/components';
import { uploadOrderProof, type ProofFile } from '@/services/orders';
import { ApiError } from '@/types/api';
import type { PublicStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PublicStackParamList>;

/** Deriva un nombre y tipo MIME para el comprobante a partir del asset. */
function toProofFile(asset: ImagePicker.ImagePickerAsset): ProofFile {
  const name =
    asset.fileName ?? `comprobante-${asset.uri.split('/').pop() ?? 'pago.jpg'}`;
  const type = asset.mimeType ?? 'image/jpeg';
  return { uri: asset.uri, name, type };
}

/** Subida real del comprobante de pago de un pedido. */
export function UploadProofScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'UploadProof'>>();

  const [file, setFile] = useState<ProofFile | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    setError(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos permiso para acceder a tus imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    setFile(toProofFile(result.assets[0]));
  };

  const onSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await uploadOrderProof(route.params.orderId, file);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo subir el comprobante.');
    } finally {
      setSubmitting(false);
    }
  };

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
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      {success ? (
        <>
          <InfoBanner
            tone="success"
            message="Comprobante recibido. Validaremos tu pago y te contactaremos por correo."
          />
          <Button
            label="Volver al inicio"
            fullWidth
            onPress={() => navigation.navigate('PublicLanding')}
          />
        </>
      ) : (
        <>
          <SectionTitle>Adjunta tu comprobante</SectionTitle>
          <UploadZone
            label="Subir comprobante"
            hint="Toca para elegir una foto de tu galería"
            selectedName={file?.name}
            onPress={() => void pickImage()}
          />

          <InfoBanner message="Validaremos tu pago y confirmaremos el pedido por correo." />

          <Button
            label="Enviar comprobante"
            fullWidth
            loading={submitting}
            disabled={!file || submitting}
            onPress={onSubmit}
          />
        </>
      )}
    </MobileShell>
  );
}
