# Plan de notificaciones por tipo de usuario

**Estado actual (auditado el 14-jul-2026):** la app móvil **no muestra notificaciones** de ningún tipo — no hay `expo-notifications`, ni centro de notificaciones in-app, ni badges. El backend no expone endpoints de notificaciones para el móvil, pero **ya notifica por correo** mediante 14 mailers (`appointment`, `vaccination`, `payment`, `medical_report`, `adoption`, `sponsorship`, `inventory`, `campaign`, `contact`, `pet`, `owner`, `settings`, `user`): los **eventos notificables ya existen del lado del servidor**.

Este documento lista las notificaciones que la app debería mostrar, por tipo de usuario, como insumo para el diseño e implementación posterior.

## Canales propuestos

| Canal | Descripción | Cuándo usarlo |
|---|---|---|
| **In-app** | Centro de notificaciones dentro de la app (campana + badge), respaldado por un endpoint nuevo del API y la base local SQLite (funciona offline, se sincroniza al conectar — coherente con local-first). | Todo evento; es el registro persistente. |
| **Push local** | Programada en el dispositivo (`expo-notifications`), sin servidor. | Recordatorios derivados de datos ya sincronizados: cita próxima, vacuna por vencer. |
| **Push remota** | Enviada por el backend (Expo Push / FCM) al ocurrir el evento. | Eventos que nacen en el servidor: confirmaciones, cambios de estado, alertas al personal. |

Prioridades: **Alta** = accionable y sensible al tiempo · **Media** = informativa relevante · **Baja** = opcional/marketing (siempre con opt-out).

## 1. Dueño de mascota (rol `owner`)

| # | Notificación | Evento origen | Canal | Prioridad | Mailer existente |
|---|---|---|---|---|---|
| O1 | Recordatorio de cita (24 h y 2 h antes) | Cita agendada próxima | Push local + in-app | Alta | appointment |
| O2 | Cita confirmada / reprogramada / cancelada por el consultorio | Cambio de estado de la cita | Push remota + in-app | Alta | appointment |
| O3 | Vacuna próxima a vencer o vencida | Esquema de vacunación de la mascota | Push local + in-app | Alta | vaccination |
| O4 | Desparasitación pendiente | Calendario de desparasitación | Push local + in-app | Media | vaccination |
| O5 | Nuevo informe médico / resultado de examen disponible | Informe o examen publicado por el personal | Push remota + in-app | Alta | medical_report |
| O6 | Receta emitida o actualizada | Prescripción creada en consulta | Push remota + in-app | Media | medical_report |
| O7 | Pago registrado / verificado / rechazado | Cambio de estado del pago | Push remota + in-app | Alta | payment |
| O8 | Recordatorio de pago pendiente | Pago reportado sin verificar o saldo pendiente | Push local + in-app | Media | payment |
| O9 | Estado de solicitud de adopción (recibida / aprobada / rechazada) | Cambio de estado de la solicitud | Push remota + in-app | Alta | adoption |
| O10 | Renovación o vencimiento de apadrinamiento | Ciclo del apadrinamiento | Push remota + in-app | Media | sponsorship |
| O11 | Pedido de tienda confirmado / listo para retirar | Cambio de estado del pedido (checkout) | Push remota + in-app | Media | — (nuevo) |
| O12 | **Modo offline activado**: se perdió la conexión, la app sigue funcionando con los datos locales | Detección de pérdida de conectividad | In-app (banner persistente) | Alta | — (local) |
| O13 | **Conexión recuperada — sincronizando con el consultorio** y resultado (sincronización completada / N cambios enviados / conflicto o fallo) | Ciclo de la cola de sincronización (F2–F4 del ADR 0001) | In-app + push local si la app está en segundo plano | Alta | — (local) |
| O14 | **Alarma de medicamento**: hora de administrar la dosis a la mascota bajo tratamiento (medicamento, dosis y mascota en el aviso) | Receta/prescripción activa con posología (frecuencia y duración del tratamiento) | Push local tipo **alarma** (repetida según el horario: cada 6/8/12/24 h) + in-app | Alta | medical_report |
| O15 | Tratamiento por finalizar / finalizado (suspender o renovar según indicación) | Fin de la duración indicada en la receta | Push local + in-app | Media | medical_report |
| O16 | Campañas del consultorio (jornadas de vacunación, promociones) | Campaña creada por el administrador | Push remota + in-app | Baja (opt-out) | campaign |

## 2. Administrador (rol `admin`)

| # | Notificación | Evento origen | Canal | Prioridad | Mailer existente |
|---|---|---|---|---|---|
| A1 | Nueva cita agendada por un dueño | Creación de cita desde la app | Push remota + in-app | Alta | appointment |
| A2 | Cita cancelada o reprogramada por un dueño | Cambio de estado por el dueño | Push remota + in-app | Alta | appointment |
| A3 | Agenda del día (resumen matutino de citas) | Citas del día | Push local + in-app | Media | appointment |
| A4 | Pago reportado por verificar | Dueño registra un pago | Push remota + in-app | Alta | payment |
| A5 | Nueva solicitud de adopción | Solicitud creada desde el dominio público | Push remota + in-app | Alta | adoption |
| A6 | Nuevo apadrinamiento o renovación | Apadrinamiento creado/renovado | Push remota + in-app | Media | sponsorship |
| A7 | Inventario bajo (insumos/productos por agotarse) | Umbral de stock alcanzado | Push remota + in-app | Alta | inventory |
| A8 | Nuevo mensaje de contacto | Formulario público de contacto | Push remota + in-app | Media | contact |
| A9 | Nuevo pedido de tienda | Checkout completado | Push remota + in-app | Media | — (nuevo) |
| A10 | Vacunaciones programadas del día/semana | Calendario de vacunación de la clínica | Push local + in-app | Media | vaccination |
| A11 | Nuevo usuario registrado | Registro de cuenta de dueño | In-app | Baja | user/owner |

## 3. Veterinario (rol `vet`)

| # | Notificación | Evento origen | Canal | Prioridad | Mailer existente |
|---|---|---|---|---|---|
| V1 | Cita asignada o modificada en su agenda | Asignación de la cita al profesional | Push remota + in-app | Alta | appointment |
| V2 | Agenda clínica del día (incluye salidas a domicilio) | Citas del día del profesional | Push local + in-app | Alta | appointment |
| V3 | Resultado de examen de laboratorio cargado | Examen disponible para revisión | Push remota + in-app | Alta | medical_report |
| V4 | Historia clínica actualizada de un paciente bajo su atención | Consulta/registro médico nuevo | In-app | Media | medical_report |
| V5 | Vacunas del día por aplicar | Calendario de vacunación | Push local + in-app | Media | vaccination |
| V6 | Recordatorio de consulta sin cerrar (nota clínica pendiente) | Consulta iniciada sin finalizar | In-app | Media | — (nuevo) |

## 4. Usuario público (sin sesión)

Sin push (no hay identidad ni token). Únicamente avisos **in-app contextuales** al navegar: confirmación de mensaje de contacto enviado, confirmación de checkout, y estado de la solicitud de adopción consultable con el código/correo. Si se registra, pasa al catálogo del dueño.

## Notificaciones del ciclo local-first (detalle)

El estado de conectividad y sincronización es información de primera clase para el usuario — especialmente en la atención a domicilio:

- **Al perder conexión (O12)**: banner in-app persistente "Sin conexión — trabajando con datos locales", con la fecha/hora de la última sincronización. No es un error: es el modo normal de operación en campo.
- **Al recuperar conexión (O13)**: aviso "Conexión recuperada — sincronizando…" y, al terminar, el resultado: "Sincronización completada (N cambios enviados, M recibidos)" o, si algo falla, "No se pudieron sincronizar X cambios — se reintentará" con acceso al detalle. Si la app está en segundo plano, el resultado se emite como push local.
- Toda escritura hecha offline se marca visualmente como **pendiente de sincronizar** hasta que la cola la confirme contra el backend.

## Alarmas de medicación para dueños (detalle)

Los dueños necesitan que la app **programe alarmas con los horarios de los medicamentos** de las mascotas bajo tratamiento:

- **Fuente de datos**: la receta/prescripción emitida en consulta (ya existe en el dominio clínico), extendida con posología estructurada: medicamento, dosis, frecuencia (cada 6/8/12/24 h u horarios fijos) y duración del tratamiento.
- **Programación**: al sincronizar la receta, la app programa **alarmas locales repetidas** (`expo-notifications` con canal Android de alta prioridad, sonido y vibración) por cada toma, desde el inicio hasta el fin del tratamiento. Al ser locales, **suenan aunque no haya conexión** — coherente con local-first.
- **Contenido del aviso**: mascota, medicamento y dosis ("💊 Luna — Amoxicilina 250 mg, toma de las 8:00 p. m."), con acciones rápidas: *Administrado* (registra la toma) y *Posponer 15 min*.
- **Gestión**: pantalla "Tratamientos activos" en el dominio del dueño para ver, silenciar o ajustar horarios de cada tratamiento; las tomas registradas quedan en la historia local y se sincronizan al conectar.
- **Cierre**: al cumplirse la duración indicada se emite O15 y las alarmas se cancelan automáticamente.

## Consideraciones de implementación (resumen)

1. **Coherencia local-first**: el centro in-app se respalda en la tabla local SQLite; las push locales y las alarmas de medicación se programan desde datos ya sincronizados — todas funcionan sin conexión. Las push remotas requieren token de dispositivo registrado en el backend.
2. **Backend**: se necesita un modelo `Notification` + endpoints móviles (listar, marcar leída, preferencias) y el registro de tokens push; los mailers existentes marcan exactamente dónde disparar cada evento (mismo punto de emisión, segundo canal).
3. **Preferencias por usuario**: pantalla de ajustes con opt-in/opt-out por categoría (obligatorio para prioridad Baja/marketing).
4. **Orden de implementación sugerido**: F1 centro in-app + ciclo offline/sync (O12, O13) + push locales de recordatorios (O1, O3, A3, V2) — todo sin cambios complejos de backend → F2 alarmas de medicación (O14, O15: requieren posología estructurada en la receta) y push remotas de eventos críticos (O2, O5, O7, A1, A4, A7) → F3 resto + pantalla de preferencias.
