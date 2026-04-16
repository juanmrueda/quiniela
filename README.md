# Quiniela Mundial FIFA 2026

App web progresiva (PWA) para quiniela interna del Mundial FIFA 2026. Funciona en iOS, Android y desktop sin necesidad de App Store ni Google Play.

## Acceso

Solo correos corporativos de los 4 dominios autorizados:

- `@by-media.com`
- `@digitalfactory.com.gt`
- `@auditsa.gt`
- `@4amsaatchi.com`

Login exclusivo con Google OAuth — sin contraseñas.

## Roles

| Rol | Descripción |
|---|---|
| `super_admin` | Desarrollador. Acceso técnico completo, gestión de roles, override de API |
| `admin` | Admins del día a día. Resultados, usuarios, notificaciones — sin configuración técnica |
| `user` | Los 100 participantes. Predicciones, ranking, perfil |

## Reglas del juego

**Mecánica:**
- Costo: Q.100 por participante (descuento en nómina). La empresa duplica el total recaudado.
- Las predicciones se bloquean **5 minutos antes** de cada partido.
- Sin predicción = 0 puntos en ese encuentro.
- Campeón / Subcampeón / Tercer lugar se predicen antes del inicio del torneo (bloqueo 5 min antes del primer partido).
- Las predicciones de fase eliminatoria se habilitan al terminar la fase de grupos.
- En fase eliminatoria solo cuentan los 90 minutos oficiales (sin tiempo extra ni penales).

**Puntuación:**

| Acierto | Puntos |
|---|---|
| Resultado exacto | 5 |
| Ganador / empate correcto | 3 |
| Goles de un equipo acertados | 1 |
| Campeón del mundial | 30 |
| Subcampeón | 20 |
| Tercer lugar | 10 |

**Premios:**
- 1er lugar: 50% del pozo
- 2do lugar: 30% del pozo
- 3er lugar: 20% del pozo

**Desempate (en orden):**
1. Mayor puntos en fase de grupos
2. Acertar campeón en proyección inicial
3. Acertar subcampeón en proyección inicial
4. Acertar tercer lugar en proyección inicial

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth + Google OAuth |
| Tiempo real | Supabase Realtime |
| Hosting | Vercel |
| API de fútbol | API-Football (RapidAPI) |
| Notificaciones push | OneSignal |
| Cron jobs | Vercel Cron Functions |

**Costo de infraestructura: $0/mes** en tiers gratuitos para 100 usuarios.

## Pantallas (20 total)

| Grupo | Pantallas |
|---|---|
| Auth | A1 Splash, A2 Login Google |
| Onboarding | B1 Proyección inicial (campeón/sub/3ro) |
| Navegación principal | C1 Dashboard, C2 Partidos grupos, C3 Ranking (individual + por empresa), C4 Detalle partido + predicción, C5 Mi perfil, C6 Fase eliminatoria |
| Secundarias usuario | D1 Pozo y premios, D2 Perfil de otro jugador, D3 Mis estadísticas |
| Admin | E1 Admin dashboard, E2 Gestión de resultados, E3 Gestión de usuarios, E4 Envío de notificaciones, E5 Gestión de roles (solo super_admin) |

## Notificaciones push (7 tipos automáticas)

1. **24h antes del partido** — recordatorio si no ha predicho
2. **1h antes del partido** — último aviso si no ha predicho
3. **Bloqueo de predicción** — cuando el partido está por iniciar
4. **Resultado + puntos** — personalizado por usuario al finalizar partido
5. **Cambio en el ranking** — cuando el jugador sube o baja de posición
6. **Recordatorio proyección inicial** — 24h antes del primer partido del torneo
7. **Fase eliminatoria desbloqueada** — al terminar la fase de grupos

## Fechas clave

| Evento | Fecha |
|---|---|
| Inicio desarrollo | 17 abril 2026 |
| Entrega app lista | 5 mayo 2026 |
| Inicio Mundial FIFA 2026 | 11 junio 2026 |
| Final del Mundial | 19 julio 2026 |

## Cuentas y servicios necesarios

Antes de iniciar, crear cuenta en cada servicio:

- [ ] [github.com](https://github.com) — repositorio del proyecto
- [ ] [supabase.com](https://supabase.com) — base de datos y autenticación
- [ ] [vercel.com](https://vercel.com) — hosting y deploy
- [ ] [rapidapi.com](https://rapidapi.com) — API-Football para resultados
- [ ] [onesignal.com](https://onesignal.com) — notificaciones push
- [ ] Google Cloud Console — proyecto OAuth (requiere admin de Google Workspace)

## Desarrollo local

```bash
# Clonar repositorio
git clone https://github.com/tu-org/quiniela-2026.git
cd quiniela-2026

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys de Supabase, API-Football y OneSignal

# Correr en desarrollo
npm run dev
```

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API-Football (RapidAPI)
RAPIDAPI_KEY=
RAPIDAPI_HOST=v3.football.api-sports.io

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# Dominios permitidos (separados por coma)
ALLOWED_DOMAINS=by-media.com,digitalfactory.com.gt,auditsa.gt,4amsaatchi.com

# App
NEXT_PUBLIC_APP_URL=https://quiniela2026.vercel.app
```

## Base de datos — tablas principales

| Tabla | Descripción |
|---|---|
| `users` | Participantes: id, email, name, avatar, role, company, created_at |
| `teams` | 48 selecciones del Mundial |
| `matches` | 104 partidos con fecha, fase, equipos y resultado |
| `predictions` | Predicción de cada usuario por partido |
| `tournament_picks` | Proyección inicial (campeón / subcampeón / tercer lugar) |
| `leaderboard` | Vista materializada del ranking con desempates |
| `notifications_log` | Registro de notificaciones enviadas |

## Estructura del proyecto

```
quiniela-2026/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── partidos/
│   │   │   └── [id]/
│   │   ├── ranking/
│   │   ├── perfil/
│   │   └── eliminatoria/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── resultados/
│   │   ├── usuarios/
│   │   ├── notificaciones/
│   │   └── roles/
│   └── api/
│       ├── cron/
│       │   ├── sync-results/
│       │   ├── lock-predictions/
│       │   └── send-reminders/
│       └── webhooks/
├── components/
│   ├── ui/           # shadcn/ui
│   ├── match/
│   ├── ranking/
│   └── admin/
├── lib/
│   ├── supabase/
│   ├── football-api/
│   ├── onesignal/
│   └── scoring/
├── supabase/
│   ├── migrations/
│   └── seed/         # equipos y partidos FIFA 2026
└── public/
    ├── icons/        # PWA icons
    └── manifest.json
```
