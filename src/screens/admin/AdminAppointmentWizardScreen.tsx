import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import {
  AsyncBoundary,
  Avatar,
  Button,
  FilterChips,
  InfoBanner,
  SectionTitle,
} from '@/components/ui';
import { ListRow, StepIndicator } from '@/components/domain';
import type { AdminAgendaStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import {
  createAdminAppointment,
  getAdminAvailableDays,
  getAdminAvailableVets,
  getAdminTimeSlots,
  listAdminOwners,
  listAdminPets,
  listAdminServices,
  type AdminOwner,
} from '@/services/admin';
import { ApiError } from '@/types/api';
import { formatDate } from '@/utils/format';
import {
  SPECIES_EMOJI,
  SPECIES_LABEL,
  type AvailableVet,
  type Species,
} from '@/types/models';

type Nav = NativeStackNavigationProp<AdminAgendaStackParamList>;

const STEP_LABELS = ['Dueño', 'Mascota', 'Servicio', 'Día', 'Veterinario', 'Hora'];

interface Selection {
  ownerId?: number;
  petId?: number;
  serviceId?: number;
  day?: string;
  vetId?: number;
  time?: string;
}

function Check() {
  const { colors } = useTheme();
  return <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>;
}

function ownerName(o: AdminOwner): string {
  return o.full_name ?? `${o.first_name} ${o.last_name}`.trim();
}

/** Deduplica veterinarios (el backend repite el id por turnos partidos). */
function uniqueVets(vets: AvailableVet[]): AvailableVet[] {
  const seen = new Set<number>();
  return vets.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
}

export function AdminAppointmentWizardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [{ month, year }] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const owners = useAsync(() => listAdminOwners());
  const pets = useAsync(() => listAdminPets());
  const services = useAsync(() => listAdminServices());
  const days = useAsync(() => getAdminAvailableDays(month, year));

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection>({});
  const patch = (p: Partial<Selection>) => setSel((prev) => ({ ...prev, ...p }));

  const [vets, setVets] = useState<AvailableVet[]>([]);
  const [vetsLoading, setVetsLoading] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const ownerPets = useMemo(
    () => (pets.data ?? []).filter((p) => p.proprietary_id === sel.ownerId),
    [pets.data, sel.ownerId],
  );

  const selectDay = async (d: string) => {
    patch({ day: d, vetId: undefined, time: undefined });
    setVets([]);
    setSlots([]);
    setVetsLoading(true);
    try {
      setVets(uniqueVets(await getAdminAvailableVets(d)));
    } catch {
      setVets([]);
    } finally {
      setVetsLoading(false);
    }
  };

  const selectVet = async (vetId: number) => {
    patch({ vetId, time: undefined });
    setSlots([]);
    if (sel.day === undefined || sel.serviceId === undefined) return;
    setSlotsLoading(true);
    try {
      const result = await getAdminTimeSlots(sel.day, vetId, sel.serviceId);
      setSlots(result.flatMap((s) => (s.available ? [s.time] : [])));
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const canAdvance =
    (step === 0 && sel.ownerId !== undefined) ||
    (step === 1 && sel.petId !== undefined) ||
    (step === 2 && sel.serviceId !== undefined) ||
    (step === 3 && sel.day !== undefined) ||
    (step === 4 && sel.vetId !== undefined) ||
    (step === 5 && sel.time !== undefined);

  const isLast = step === STEP_LABELS.length - 1;

  const submit = async () => {
    const { ownerId, petId, serviceId, day, vetId, time } = sel;
    if (
      ownerId === undefined ||
      petId === undefined ||
      serviceId === undefined ||
      day === undefined ||
      vetId === undefined ||
      time === undefined
    ) {
      return;
    }
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createAdminAppointment({
        owner_id: ownerId,
        pet_id: petId,
        service_id: serviceId,
        assigned_to_id: vetId,
        scheduled_at: `${day}T${time}:00`,
      });
      back?.();
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'No se pudo agendar la cita.');
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    if (isLast) void submit();
    else setStep((s) => s + 1);
  };

  const dayOptions = (days.data ?? []).map((d) => ({ id: d, label: formatDate(d) }));
  const slotOptions = slots.map((s) => ({ id: s, label: s }));

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Nueva cita" onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <StepIndicator steps={STEP_LABELS.length} current={step} labels={STEP_LABELS} />

      {submitError ? <InfoBanner tone="destructive" message={submitError} /> : null}

      {step === 0 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el dueño</SectionTitle>
          <AsyncBoundary
            loading={owners.loading && owners.data === null}
            error={owners.error}
            onRetry={owners.reload}
            empty={(owners.data ?? []).length === 0}
            emptyIcon="person"
            emptyTitle="Sin dueños"
          >
            {(owners.data ?? []).map((o) => (
              <ListRow
                key={o.id}
                title={ownerName(o)}
                subtitle={o.email}
                showChevron={false}
                trailing={sel.ownerId === o.id ? <Check /> : undefined}
                onPress={() => patch({ ownerId: o.id, petId: undefined })}
              />
            ))}
          </AsyncBoundary>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige la mascota</SectionTitle>
          <AsyncBoundary
            loading={pets.loading && pets.data === null}
            error={pets.error}
            onRetry={pets.reload}
            empty={ownerPets.length === 0}
            emptyIcon="paw"
            emptyTitle="Sin mascotas"
            emptyDescription="Este dueño no tiene mascotas registradas."
          >
            {ownerPets.map((pet) => (
              <ListRow
                key={pet.id}
                title={pet.name}
                subtitle={SPECIES_LABEL[pet.species]}
                leading={
                  <Avatar
                    uri={pet.photo_url ?? undefined}
                    fallback={SPECIES_EMOJI[pet.species as Species]}
                  />
                }
                showChevron={false}
                trailing={sel.petId === pet.id ? <Check /> : undefined}
                onPress={() => patch({ petId: pet.id })}
              />
            ))}
          </AsyncBoundary>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el servicio</SectionTitle>
          <AsyncBoundary
            loading={services.loading && services.data === null}
            error={services.error}
            onRetry={services.reload}
            empty={(services.data ?? []).length === 0}
            emptyIcon="medkit"
            emptyTitle="Sin servicios"
          >
            {(services.data ?? []).map((s) => (
              <ListRow
                key={s.id}
                title={s.name}
                subtitle={s.duration_minutes ? `${s.duration_minutes} min` : undefined}
                showChevron={false}
                trailing={sel.serviceId === s.id ? <Check /> : undefined}
                onPress={() =>
                  patch({ serviceId: s.id, vetId: undefined, time: undefined })
                }
              />
            ))}
          </AsyncBoundary>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el día</SectionTitle>
          <AsyncBoundary
            loading={days.loading && days.data === null}
            error={days.error}
            onRetry={days.reload}
            empty={(days.data ?? []).length === 0}
            emptyIcon="calendar"
            emptyTitle="Sin días disponibles"
            emptyDescription="No hay disponibilidad este mes."
          >
            <FilterChips
              options={dayOptions}
              selectedId={sel.day ?? ''}
              onSelect={(id) => void selectDay(id)}
            />
          </AsyncBoundary>
        </View>
      ) : null}

      {step === 4 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el veterinario</SectionTitle>
          <AsyncBoundary
            loading={vetsLoading}
            error={null}
            empty={vets.length === 0}
            emptyIcon="person"
            emptyTitle="Sin veterinarios"
            emptyDescription="No hay veterinarios disponibles ese día."
          >
            {vets.map((v) => (
              <ListRow
                key={v.id}
                title={`${v.first_name} ${v.last_name}`}
                showChevron={false}
                trailing={sel.vetId === v.id ? <Check /> : undefined}
                onPress={() => void selectVet(v.id)}
              />
            ))}
          </AsyncBoundary>
        </View>
      ) : null}

      {step === 5 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige la hora</SectionTitle>
          <AsyncBoundary
            loading={slotsLoading}
            error={null}
            empty={slotOptions.length === 0}
            emptyIcon="time"
            emptyTitle="Sin horarios"
            emptyDescription="No hay horarios disponibles para ese veterinario."
          >
            <FilterChips
              options={slotOptions}
              selectedId={sel.time ?? ''}
              onSelect={(id) => patch({ time: id })}
            />
          </AsyncBoundary>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        {step > 0 ? (
          <Button
            label="Atrás"
            variant="outline"
            disabled={submitting}
            onPress={() => setStep((s) => Math.max(0, s - 1))}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={isLast ? 'Agendar cita' : 'Siguiente'}
          disabled={!canAdvance || submitting}
          loading={submitting}
          onPress={onNext}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={{ fontSize: 12, textAlign: 'center', color: colors.mutedForeground }}>
        Paso {step + 1} de {STEP_LABELS.length}
      </Text>
    </MobileShell>
  );
}
