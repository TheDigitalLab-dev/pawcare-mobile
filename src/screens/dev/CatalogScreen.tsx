import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChips,
  IconButton,
  InfoBanner,
  SearchBar,
  SectionTitle,
  TextField,
  UploadZone,
  Avatar,
} from '@/components/ui';
import {
  ActionTileGrid,
  AdminModuleGrid,
  AppointmentCard,
  DetailHero,
  HeroCard,
  ListRow,
  PaymentCard,
  ProductCard,
  StatCard,
  StepIndicator,
  TimelineItem,
} from '@/components/domain';

/** Pantalla de desarrollo para validar el design system (no es de producción). */
export function CatalogScreen() {
  const { setPreference, scheme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Catálogo UI"
          subtitle={`tema ${scheme}`}
          rightAction={
            <IconButton
              icon={scheme === 'dark' ? 'sunny' : 'moon'}
              accessibilityLabel="Cambiar tema"
              onPress={() => setPreference(scheme === 'dark' ? 'light' : 'dark')}
            />
          }
        />
      }
      contentStyle={{ gap: 14 }}
    >
      <HeroCard title="Hola, PawCare" subtitle="Resumen de hoy">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard value={2} label="Mascotas" />
          <StatCard value={1} label="Citas" />
        </View>
      </HeroCard>

      <SectionTitle>Botones</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Outline" variant="outline" onPress={() => {}} />
        <Button label="Destructive" variant="destructive" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Button label="Cargando" loading onPress={() => {}} />
      </View>

      <SectionTitle>Entradas</SectionTitle>
      <TextField label="Email" placeholder="tu@email.com" keyboardType="email-address" />
      <TextField label="Con error" placeholder="..." error="Campo obligatorio" />
      <SearchBar value={search} onChangeText={setSearch} />
      <FilterChips
        options={[
          { id: 'all', label: 'Todos' },
          { id: 'dogs', label: 'Perros' },
          { id: 'cats', label: 'Gatos' },
        ]}
        selectedId={filter}
        onSelect={setFilter}
      />
      <UploadZone />

      <SectionTitle>Badges</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Badge label="Confirmada" variant="success" />
        <Badge label="Pendiente" variant="warning" />
        <Badge label="Cancelada" variant="destructive" />
        <Badge label="Admin" variant="info" />
        <Badge label="Outline" variant="outline" />
      </View>

      <SectionTitle>Banners</SectionTitle>
      <InfoBanner message="Tu cita está pendiente de confirmación." tone="info" />
      <InfoBanner message="Tienes un pago vencido." tone="warning" />

      <SectionTitle>Listas</SectionTitle>
      <ListRow
        title="Firulais"
        subtitle="Labrador · 3 años"
        leading={<Avatar fallback="🐶" />}
        onPress={() => {}}
      />
      <AppointmentCard
        petName="Michi"
        dateLabel="Mar 14 jun · 10:30"
        vetName="Dra. López"
        statusLabel="Confirmada"
        statusVariant="success"
        onPress={() => {}}
      />
      <PaymentCard
        concept="Consulta general"
        amountLabel="$ 45.000"
        statusLabel="Pendiente"
        dueLabel="Vence 20 jun"
        onRegister={() => {}}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <ProductCard name="Alimento Premium 2kg" priceLabel="$ 30.000" />
        <ProductCard name="Juguete mordedor" priceLabel="$ 12.000" inStock={false} />
      </View>

      <SectionTitle>Wizard</SectionTitle>
      <StepIndicator steps={4} current={1} labels={['Mascota', 'Vet', 'Día', 'Hora']} />

      <SectionTitle>Historial</SectionTitle>
      <Card>
        <TimelineItem title="Vacuna antirrábica" date="10 jun 2026" />
        <TimelineItem title="Desparasitación" date="01 may 2026" tone="success" last />
      </Card>

      <SectionTitle>Accesos</SectionTitle>
      <ActionTileGrid
        tiles={[
          { id: '1', label: 'Vacunas', icon: 'medkit' },
          { id: '2', label: 'Consultas', icon: 'document-text' },
          { id: '3', label: 'Reportes', icon: 'reader' },
          { id: '4', label: 'Pagos', icon: 'card' },
        ]}
      />
      <AdminModuleGrid
        modules={[
          { id: '1', label: 'Pacientes', icon: 'paw', badge: 24 },
          { id: '2', label: 'Agenda', icon: 'calendar', badge: 5 },
        ]}
      />

      <SectionTitle>Detalle</SectionTitle>
      <DetailHero
        title="Firulais"
        subtitle="Labrador · Macho · 3 años"
        avatar={<Avatar fallback="🐶" size="lg" />}
      />

      <SectionTitle>Vacío</SectionTitle>
      <EmptyState
        title="Sin citas"
        description="Agenda tu primera cita veterinaria."
        actionLabel="Agendar"
        onAction={() => {}}
      />
    </MobileShell>
  );
}
