import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import type { PublicStackParamList } from '@/navigation/types';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. Datos que recopilamos',
    body: 'Recopilamos los datos que nos proporcionas al registrarte o realizar un pedido: nombre, correo, teléfono y la información de tus mascotas.',
  },
  {
    heading: '2. Uso de la información',
    body: 'Usamos tus datos para gestionar citas, pedidos, historiales médicos y para comunicarnos contigo sobre nuestros servicios.',
  },
  {
    heading: '3. Protección de datos',
    body: 'Aplicamos medidas razonables de seguridad para proteger tu información. No compartimos tus datos con terceros sin tu consentimiento, salvo obligación legal.',
  },
  {
    heading: '4. Tus derechos',
    body: 'Puedes solicitar el acceso, la rectificación o la eliminación de tus datos personales en cualquier momento a través de nuestros canales de contacto.',
  },
  {
    heading: '5. Cambios en esta política',
    body: 'Podemos actualizar esta política de privacidad. Te notificaremos los cambios relevantes dentro de la aplicación.',
  },
];

/** Política de privacidad (texto legal de ejemplo). */
export function PrivacyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { colors } = useTheme();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Política de privacidad"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      {SECTIONS.map((section) => (
        <Text key={section.heading}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            {section.heading}
            {'\n'}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {section.body}
          </Text>
        </Text>
      ))}
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  body: { fontSize: 14, lineHeight: 21 },
});
