# Plan: Alcanzar 80% de Code Coverage

## 📊 Estado Actual

- **Coverage**: 58.79% (1947 / 3312 líneas)
- **Target**: 80% (2650 líneas necesarias)
- **Gap**: 703 líneas adicionales a cubrir

## 🎯 Objetivo

Alcanzar 80% de coverage en 4 semanas, priorizando archivos de alto impacto.

## 🔍 Hallazgos Clave

### ✅ Excelente
- **67 archivos con 100% coverage** (1151 líneas):
  - Todos los actions médicos (consultation, vaccination, prescription)
  - Todos los sponsorship actions & controllers
  - Todos los auth actions
  - Todos los mailers
  - Todos los modelos core (Pet, Owner, User, Medical)

### ❌ Problema Principal
- **21 archivos con 0% coverage** (1172 líneas):
  - 7 medical controllers (785 líneas) - **ALTO IMPACTO**
  - 10 medical actions (252 líneas)
  - 4 misc controllers/helpers (135 líneas)

## 📋 Plan de Implementación (4 Fases)

### Fase 0: Setup (1 día) - PRIMERO

**Objetivo**: Permitir commits mientras trabajamos en coverage

**Archivos a modificar**:
- `spec/support/simplecov.rb`

**Cambios**:
```ruby
# Cambiar de:
minimum_coverage 80

# A:
minimum_coverage 60  # Temporal mientras trabajamos
```

**Verificación**:
- Ejecutar `bundle exec rspec` → debe pasar
- Coverage reportado en `coverage/index.html`
- Commits no bloqueados

---

### Fase 1: Medical Controllers (2 semanas) → +13.5% coverage

**Objetivo**: 58.79% → 72.3%

**Archivos a crear** (orden de prioridad):

#### Semana 1
1. **spec/requests/admin/consultations_spec.rb** (139 líneas coverage)
   - Test: index, show, create, update, complete
   - Template: `spec/requests/admin/adoptions_spec.rb`
   - Estimado: 120 líneas de test
   - Impacto: +4.2% coverage

2. **spec/requests/admin/vaccination_schedules_spec.rb** (132 líneas)
   - Test: index, show, create, update, complete_item
   - Estimado: 100 líneas de test
   - Impacto: +4.0% coverage

3. **spec/requests/admin/vaccinations_spec.rb** (126 líneas)
   - Test: index, show, create, update, destroy
   - Estimado: 90 líneas de test
   - Impacto: +3.8% coverage

#### Semana 2
4. **spec/requests/admin/lab_exams_spec.rb** (130 líneas)
   - Test: index, show, create, update_results
   - Estimado: 95 líneas de test
   - Impacto: +3.9% coverage

5. **spec/requests/admin/dewormings_spec.rb** (117 líneas)
   - Test: index, show, create, update, destroy
   - Estimado: 85 líneas de test
   - Impacto: +3.5% coverage

**Archivos críticos**:
- `app/controllers/admin/consultations_controller.rb`
- `app/controllers/admin/vaccination_schedules_controller.rb`
- `app/controllers/admin/vaccinations_controller.rb`
- `app/controllers/admin/lab_exams_controller.rb`
- `app/controllers/admin/dewormings_controller.rb`

**Verificación Fase 1**:
- `bundle exec rspec spec/requests/admin/consultations_spec.rb` → pasa
- `bundle exec rspec spec/requests/admin/vaccination*.rb` → pasa
- Coverage: ~72.3%

---

### Fase 2: Controllers Restantes (1 semana) → +3.3% coverage

**Objetivo**: 72.3% → 75.6%

**Archivos a crear**:

1. **spec/requests/admin/prescriptions_spec.rb** (95 líneas)
   - Estimado: 75 líneas de test
   - Impacto: +2.9% coverage

2. **spec/requests/admin/medical_profiles_spec.rb** (46 líneas)
   - Estimado: 40 líneas de test
   - Impacto: +1.4% coverage

3. **spec/requests/dashboard_spec.rb** (17 líneas)
   - Test: index (stats básicas)
   - Estimado: 20 líneas de test
   - Impacto: +0.5% coverage

4. **spec/requests/owner_pages_spec.rb** (parcial)
   - Completar coverage de endpoints faltantes
   - Estimado: 30 líneas de test
   - Impacto: +0.5% coverage

**Archivos críticos**:
- `app/controllers/admin/prescriptions_controller.rb`
- `app/controllers/admin/medical_profiles_controller.rb`
- `app/controllers/dashboard_controller.rb`

**Verificación Fase 2**:
- Coverage: ~75.6%

---

### Fase 3: Actions y Helpers (1 semana) → +4.5% coverage

**Objetivo**: 75.6% → 80.1%

**Archivos a crear**:

1. **spec/actions/admin/medical/create_deworming_spec.rb** (38 líneas)
2. **spec/actions/admin/medical/create_lab_exam_spec.rb** (42 líneas)
3. **spec/actions/admin/medical/create_prescription_spec.rb** (35 líneas)
4. **spec/actions/admin/medical/update_lab_exam_results_spec.rb** (30 líneas)
5. **spec/actions/admin/medical/email_report_spec.rb** (28 líneas)
6. **spec/actions/admin/medical/generate_report_spec.rb** (79 líneas)

7. **spec/helpers/mailer_helper_spec.rb** (75 líneas)
   - Test: métodos de formateo de emails

8. **Completar spec/requests/auth_spec.rb**
   - Cubrir casos edge faltantes (27 líneas)
   - refresh_token con token inválido
   - logout sin sesión
   - reset password con token expirado

**Archivos críticos**:
- `app/actions/admin/medical/create_deworming.rb`
- `app/actions/admin/medical/create_lab_exam.rb`
- `app/actions/admin/medical/create_prescription.rb`
- `app/actions/admin/medical/update_lab_exam_results.rb`
- `app/actions/admin/medical/email_report.rb`
- `app/actions/admin/medical/generate_report.rb`
- `app/helpers/mailer_helper.rb`
- `app/controllers/auth_controller.rb`

**Verificación Fase 3**:
- Coverage: ~80.1% ✅

---

### Fase 4: Ajuste Final (opcional)

Si no llegamos a 80%, atacar archivos con coverage parcial:
- `application_mailer.rb` (62.5%)
- `lib/tasks/chepino.rake` (63.6%)

---

## 🚀 Quick Wins (Empezar Aquí)

Para ganar momentum, empezar con estos archivos pequeños:

1. **Dashboard controller** (17 líneas) → 2 horas
   - Solo testear GET /dashboard → stats básicas

2. **Medical profiles controller** (46 líneas) → 4 horas
   - show + update

3. **Create deworming action** (38 líneas) → 6 horas
   - happy path + validación

**Total Quick Wins**: ~12 horas → +1.5% coverage (60% → 61.5%)

---

## 📝 Template para Request Specs

Usar como base: `spec/requests/admin/adoptions_spec.rb`

**Estructura estándar**:

```ruby
require 'rails_helper'

RSpec.describe "Admin::Consultations", type: :request do
  let(:admin) { create(:user, role: :admin) }
  let(:vet) { create(:user, role: :vet) }
  let(:pet) { create(:pet) }

  before { sign_in admin }

  describe "GET /admin/consultations" do
    it "returns consultations list" do
      create(:consultation, pet: pet, administered_by: vet)

      get "/admin/consultations"

      expect(response).to have_http_status(:ok)
      expect(json_response[:consultations]).to be_an(Array)
    end
  end

  describe "POST /admin/consultations" do
    it "creates consultation" do
      params = {
        consultation: {
          pet_id: pet.id,
          reason: "Checkup",
          diagnosis: "Healthy",
          administered_by_id: vet.id
        }
      }

      post "/admin/consultations", params: params

      expect(response).to have_http_status(:created)
      expect(Consultation.count).to eq(1)
    end
  end

  # ... más tests
end
```

---

## 📊 Tracking de Progreso

### Semana 1
- [ ] Setup: Bajar minimum_coverage a 60%
- [ ] consultations_spec.rb → 62.9%
- [ ] vaccination_schedules_spec.rb → 66.9%
- [ ] vaccinations_spec.rb → 70.7%

### Semana 2
- [ ] lab_exams_spec.rb → 74.6%
- [ ] dewormings_spec.rb → 78.1%

### Semana 3
- [ ] prescriptions_spec.rb → 81.0% ✅
- [ ] (Opcional) medical_profiles, dashboard

### Semana 4
- [ ] Actions médicos
- [ ] mailer_helper_spec
- [ ] Auth edge cases
- [ ] Subir minimum_coverage a 80%

---

## ⚠️ Consideraciones

1. **No bloquear desarrollo**: Bajar mínimo a 60% al inicio
2. **TDD en nuevos features**: Nuevos controllers deben tener tests desde el inicio
3. **CI debe pasar**: Todos los tests deben pasar antes de merge
4. **Incremental**: Subir coverage gradualmente, no todo de una vez

---

## 🎯 Criterios de Éxito

- [ ] Coverage >= 80%
- [ ] Todos los tests pasan
- [ ] `npm run push` funciona sin bloqueos
- [ ] Coverage reportado en `coverage/index.html`
- [ ] SimpleCov configurado con `minimum_coverage 80`
