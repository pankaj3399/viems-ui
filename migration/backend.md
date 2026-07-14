# VIEMS Backend Reference (Do Not Modify)

> **Purpose:** This document is a complete reference of the NestJS backend that powers VIEMS. It exists so that anyone working on the frontend — now or in the future — understands exactly how the backend works, what it expects, what it returns, and what you must never break. **Read this before writing any API call.**

---

## Table of Contents

- [1. Backend Overview](#1-backend-overview)
- [2. How to Start the Backend](#2-how-to-start-the-backend)
- [3. Environment Variables](#3-environment-variables)
- [4. Database Architecture](#4-database-architecture)
- [5. NestJS Module Map](#5-nestjs-module-map)
- [6. Authentication System (JWT + Passport)](#6-authentication-system-jwt--passport)
- [7. Role-Based Access Control (RBAC)](#7-role-based-access-control-rbac)
- [8. Complete API Endpoint Reference](#8-complete-api-endpoint-reference)
- [9. WebSocket System (Socket.IO)](#9-websocket-system-socketio)
- [10. File Storage System (S3 / MinIO)](#10-file-storage-system-s3--minio)
- [11. Email System (AWS SES)](#11-email-system-aws-ses)
- [12. Scheduled Jobs (Cron)](#12-scheduled-jobs-cron)
- [13. Error Messages Reference](#13-error-messages-reference)
- [14. Critical Rules — What You Must Never Do](#14-critical-rules--what-you-must-never-do)

---

## 1. Backend Overview

```
Technology:      NestJS 6.x (Node.js)
Language:        TypeScript
ORM:             TypeORM 0.2.x
Database:        MySQL
Auth:            Passport.js + JWT (passport-jwt)
File Storage:    AWS S3 / MinIO (S3-compatible)
Email:           AWS SES + Nodemailer
WebSockets:      Socket.IO (via @nestjs/websockets)
API Docs:        Swagger UI at /api
Package Manager: npm
Process Manager: PM2 (production)
```

### File Location
```
/server/
├── src/
│   ├── main.ts                    ← Entry point. Creates the NestJS app, enables CORS, Helmet, rate limiting.
│   ├── app.module.ts              ← Root module. Imports all feature modules.
│   ├── app.controller.ts          ← Root controller (minimal).
│   ├── app.service.ts             ← Root service (minimal).
│   │
│   ├── auth/                      ← Authentication (login, register, password reset, OTP)
│   ├── users/                     ← User management (profile, settings, user info)
│   ├── migrants/                  ← Migrant CRUD, travel history, credibility analysis
│   ├── cases/                     ← Case CRUD, assignments, templates, bulk archive/restore
│   ├── leads/                     ← Lead management
│   ├── employees/                 ← Employee management (admin-only)
│   ├── files/                     ← File upload/download, document management, S3 integration
│   ├── dashboard/                 ← Dashboard data, schedule, calendar
│   ├── search/                    ← Global search across entities
│   ├── notifications/             ← WebSocket gateway for real-time events
│   ├── logbox/                    ← Audit log storage and retrieval
│   ├── mails/                     ← Email sending service (SES)
│   ├── templates/                 ← Document templates
│   ├── geodata/                   ← Countries, states, cities data
│   ├── jobInfo/                   ← Job titles and info
│   ├── initdata/                  ← Initial app data loader (case types, statuses, etc.)
│   ├── customFields/              ← Custom field definitions
│   ├── archiveRequests/           ← Archive request workflow
│   ├── archivingManagement/       ← Scheduled archiving cron jobs
│   │
│   ├── guards/                    ← Route guards (RolesGuard, StatusesGuard)
│   ├── interceptors/              ← Request/response interceptors
│   ├── filters/                   ← Global exception filters
│   ├── helpers/                   ← Shared utility functions
│   ├── constants/                 ← Error messages, roles, statuses, notification types
│   ├── config/                    ← Environment config service
│   ├── dto/                       ← Shared DTOs
│   ├── interfaces/                ← Shared TypeScript interfaces
│   ├── database/                  ← Database connection config
│   ├── migrations/                ← TypeORM migration files
│   └── validators/                ← Custom validation pipes
│
├── uploads/                       ← Local file upload directory (dev fallback)
├── ormconfig.js                   ← TypeORM connection config
├── .env                           ← Environment variables
└── package.json
```

---

## 2. How to Start the Backend

```bash
# Development mode (auto-rebuild on file changes)
cd server
npm run start:dev
# → Backend starts on port 8081 (from APP_PORT in .env)
# → WebSocket starts on port 8082 (from WEB_SOCKET_PORT in .env)

# Production mode
npm run build        # Compiles TypeScript to /dist
npm run start:prod   # Runs compiled JS from /dist

# Run database migrations
npm run migrations:roll    # Runs main + logbox migrations
npm run dev:migrations:roll  # Runs migrations + seed fake data
```

---

## 3. Environment Variables

These are loaded from `/server/.env`. Every variable controls a critical behavior.

| Variable | Example Value | What It Controls |
| :--- | :--- | :--- |
| `APP_ENV` | `dev` | Environment mode (`dev` or `prod`). Affects logging verbosity. |
| `APP_PORT` | `8081` | **The port the REST API listens on.** All frontend API calls go here. |
| `DATABASE_HOST` | `localhost` | MySQL server hostname. |
| `DATABASE_PORT` | `3306` | MySQL server port. |
| `DATABASE_USER` | `root` | MySQL username. |
| `DATABASE_PASSWORD` | `Victor123` | MySQL password. |
| `DATABASE_NAME` | `eeuknet-ltd-viems` | **Main application database.** Contains all business data. |
| `DATABASE_LOGS_HOST` | `localhost` | Logs database hostname (can be same server). |
| `DATABASE_LOGS_PORT` | `3306` | Logs database port. |
| `DATABASE_LOGS_NAME` | `eeuknet-ltd-viems-logs` | **Separate database for audit logs.** Keeps logs isolated from app data. |
| `JWT_SECRET` | `supersecret` | **The secret key for signing/verifying JWT tokens.** If you change this, ALL existing tokens become invalid and every user gets logged out. |
| `MAX_REQUESTS_NUMBER` | `100` | Rate limit: max requests per IP per 15-minute window. |
| `OTP_LOGIN` | `false` | If `true`, login returns `{ status: 200 }` instead of a token, and the user must verify an OTP code sent to their email. |
| `WEB_SOCKET_PORT` | `8082` | **Port for the Socket.IO WebSocket server.** Frontend connects to this for real-time notifications. |
| `AWS_ACCESS_KEY_ID` | (your key) | AWS credentials for SES email sending. |
| `AWS_SECRET_ACCESS_KEY` | (your key) | AWS credentials for SES email sending. |
| `AWS_SES_REGION` | `eu-west-2` | AWS region for SES. |
| `MAIL_LOGIN` | `noreply@stage.viems.com` | The "from" email address for system emails. |
| `AWS_S3_ACCESS_KEY_ID` | `minioadmin` | S3/MinIO access key for file storage. |
| `AWS_S3_SECRET_ACCESS_KEY` | `minioadmin` | S3/MinIO secret key for file storage. |
| `AWS_S3_BUCKET` | `viems-documents` | **The S3 bucket name.** All uploaded documents go here. |
| `AWS_S3_ENDPOINT` | `http://localhost:9000` | S3/MinIO endpoint URL. For local dev, this points to MinIO. |
| `AWS_S3_REGION` | `us-east-1` | S3 region (MinIO ignores this but it must be set). |
| `AWS_S3_FORCE_PATH_STYLE` | `true` | Required for MinIO compatibility. Set `true` for local dev. |

---

## 4. Database Architecture

The backend uses **two separate MySQL databases**, connected via TypeORM with named connections.

### Main Database: `eeuknet-ltd-viems`
Contains all business entities. TypeORM entities are files ending in `.entity.ts`.

**Key entity tables (inferred from backend module structure):**
- `users` — User accounts, roles, status, personal info
- `migrants` — Migrant records with personal details, nationality
- `cases` — Immigration cases linked to migrants and assigned to employees
- `case_templates` — Reusable case templates
- `leads` — Sales/intake leads
- `employees` — Employee records (linked to users)
- `tasks` — Tasks assigned to users
- `events` — Calendar/scheduler events
- `files` / `documents` — File metadata (actual files stored in S3/MinIO)
- `folders` — Folder hierarchy for file explorer
- `custom_fields` — User-defined custom fields
- `archive_requests` — Requests to archive/restore data
- `archiving_schedules` — Cron job configuration for auto-archiving
- `geodata` — Countries, states, cities (loaded from `geodata.sql`, ~93MB)
- `job_info` / `job_titles` — Job title reference data

### Logs Database: `eeuknet-ltd-viems-logs`
Contains audit trail entries. TypeORM entities are files ending in `.table.ts`.
- Stores who did what and when (user actions, system events)
- Connected via the `"logbox"` named connection in `ormconfig.js`

### TypeORM Configuration

```javascript
// ormconfig.js — TWO database connections
module.exports = [
  {
    // DEFAULT connection (main app data)
    type: "mysql",
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_NAME,        // eeuknet-ltd-viems
    entities: ["dist/**/entities/*.entity{.js,.ts}"],
    migrations: ["dist/migrations/initdata/*.js"],
    synchronize: false,                 // Manual migrations only
    logging: true
  },
  {
    name: "logbox",                     // NAMED connection (logs)
    type: "mysql",
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_LOGS_NAME,   // eeuknet-ltd-viems-logs
    entities: ["dist/**/entities/*.table{.js,.ts}"],
    migrations: ["dist/migrations/logbox/*.js"],
    synchronize: false,
    logging: true
  }
];
```

> **WARNING:** `synchronize` is `false`. The backend does NOT auto-create tables. All schema changes MUST go through TypeORM migration files. Running `synchronize: true` in production will corrupt your database.

---

## 5. NestJS Module Map

Every feature is a self-contained NestJS module. Here is the complete module tree loaded in `app.module.ts`:

```
AppModule
├── AuthModule              ← POST /auth/login, /auth/register, /auth/reset, /auth/newpass, /auth/createpass, /auth/otppass
├── UsersModule             ← GET/PATCH /users/userinfo, /users/settings, /users/profile, /users/verify
├── MigrantsModule          ← CRUD /migrants, /migrants/archive, /migrants/restore, /migrants/{id}/travel-history
├── CasesModule             ← CRUD /cases, /cases/assignments, /cases/archive, /cases/bulk-archive, /cases/bulk-restore
├── LeadsModule             ← CRUD /leads, /leads/archive, /leads/restore
├── EmployeesModule         ← CRUD /employees, /employees/send-registration-link, /employees/restore-blocked
├── FilesModule             ← /files/view, /files/upload, /files/create, /files/edit, /files/archive, /files/image
├── DashboardModule         ← GET /dashboard/schedule, /dashboard/calendar, /events
├── TemplatesModule         ← CRUD /templates (document templates)
├── InitdataModule          ← GET /initdata/{name} (loads dropdown data, case types, statuses)
├── GeodataModule           ← GET /geodata/states (countries/states)
├── JobInfoModule           ← GET /jobinfo/jobTitles
├── SystemSearchModule      ← GET /search?q={query}
├── LogboxModule            ← GET /logs (audit trail)
├── NotificationsModule     ← WebSocket gateway (Socket.IO on port 8082)
├── MailsModule             ← Internal email sending service (AWS SES)
├── ArchiveRequestsModule   ← CRUD /archive-requests
├── ArchivingManagementModule ← GET/PUT /archiving/settings, /archiving/log, auto-archive cron
├── CustomFieldsModule      ← CRUD /custom-fields, /custom-fields/types
├── ConfigModule            ← Reads .env variables into ConfigService
└── ScheduleModule          ← NestJS cron scheduler (used by ArchivingManagement)
```

---

## 6. Authentication System (JWT + Passport)

### How JWT Works in This Backend

1. **Login** → Backend validates email/password → Creates a JWT signed with `JWT_SECRET` → Returns `{ token: "..." }`.
2. **Every subsequent request** → Frontend sends `Authorization: Bearer <token>` header → Passport's `JwtStrategy` extracts the token, decodes the payload, looks up the user in the database, and attaches the full user object to `req.user`.
3. **Token extraction** → The JWT strategy extracts tokens from **two places** (both work):
   - `Authorization: Bearer <token>` header (primary)
   - `?Authorization=Bearer <token>` URL query parameter (for file downloads, where headers can't be sent)

### JWT Strategy Configuration (from `jwt.strategy.ts`)

```typescript
super({
  secretOrKey: configService.get('JWT_SECRET'),
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),     // Header: Authorization: Bearer xxx
    ExtractJwt.fromUrlQueryParameter('Authorization') // URL: ?Authorization=Bearer xxx
  ]),
  ignoreExpiration: false,
});
```

### JWT Payload Structure
The JWT payload contains at minimum:
```json
{
  "email": "user@example.com",
  "iat": 1689264000,
  "exp": 1689350400
}
```

### Auth Controller Routes

| Method | Route | Auth Required | What It Does |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | ❌ No | Validates email+password. Returns `{ token }` or triggers OTP flow. |
| `POST` | `/auth/register` | ❌ No | Creates new user account (via invite link). |
| `POST` | `/auth/reset` | ❌ No | Sends password reset email. |
| `POST` | `/auth/newpass` | ❌ No | Sets new password (from reset link with expiry token). |
| `POST` | `/auth/createpass` | ❌ No | Creates initial password (from registration invite link). |
| `POST` | `/auth/otppass` | ❌ No | Verifies OTP code and returns JWT token. |

### OTP Login Flow (when `OTP_LOGIN=true`)
```
POST /auth/login { email, password }
→ Returns { status: 200 } (no token)
→ Backend sends 6-digit OTP to user's email via AWS SES
→ User enters OTP in frontend

POST /auth/otppass { email, otp }
→ Returns { token: "eyJ..." }
→ Frontend stores token, redirects to /dashboard
```

### Login Security Rules (from backend constants)
- **Max wrong password attempts:** 3. After 3 failures, the account is temporarily locked for 15 minutes.
- **OTP max attempts:** 3. After 3 wrong OTP codes, user must restart the login flow.

---

## 7. Role-Based Access Control (RBAC)

### User Roles (from `constants/userRoles.ts`)

| Role | Value | Permissions |
| :--- | :--- | :--- |
| **Superadmin** | `superadmin` | Full access to everything. Can manage employees, view logs, configure archiving. |
| **Supervisor** | `supervisor` | Same as Superadmin in most controllers. Can see all cases and migrants. |
| **Agent** | `agent` | Can see only their own assigned cases and tasks. Cannot access admin panels. |
| **Migrant** | `migrant` | Not used in the current frontend (reserved for future client portal). |

### How Role Guards Work

Every protected controller uses this guard chain:
```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard, StatusesGuard)
```

1. **AuthGuard('jwt')** — Verifies the JWT token is valid. Rejects with `401` if invalid/expired.
2. **RolesGuard** — Checks if the user's role matches the `@Roles(...)` decorator. Rejects with `403` if unauthorized.
3. **StatusesGuard** — Checks the user's account status:
   - `active` → Access allowed.
   - `waiting_for_response` → Rejected with "Account was not activated".
   - Any other status → Rejected with "No access".

### Frontend Implications
- When the frontend receives a `401`, it means the token is expired or invalid → **clear token, redirect to login**.
- When the frontend receives a `403`, it means the user doesn't have the right role → **show "Access Denied" message, do NOT redirect to login**.

---

## 8. Complete API Endpoint Reference

### Authentication (`/auth`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| POST | `/auth/login` | ❌ | — | Login with email/password |
| POST | `/auth/register` | ❌ | — | Create account (from invite link) |
| POST | `/auth/reset` | ❌ | — | Request password reset email |
| POST | `/auth/newpass` | ❌ | — | Set new password from reset link |
| POST | `/auth/createpass` | ❌ | — | Create initial password from invite |
| POST | `/auth/otppass` | ❌ | — | Verify OTP and get token |

### Users (`/users`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/users/userinfo` | ✅ | Any | Get current user's full info |
| GET | `/users/settings` | ✅ | Agent, Superadmin, Supervisor | Get timezone/settings data |
| PATCH | `/users/settings/:id` | ✅ | Agent, Superadmin, Supervisor | Update user settings |
| GET | `/users/profile` | ✅ | Agent, Superadmin, Supervisor | Get user profile |
| PATCH | `/users/profile` | ✅ | Agent, Superadmin, Supervisor | Edit user profile (with photo upload) |
| GET | `/users/verify?email=` | ✅ | Agent, Superadmin, Supervisor | Check if email exists |
| GET | `/users/:id` | ✅ | Agent, Superadmin, Supervisor | Get contact card for a user |

### Migrants (`/migrants`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/migrants` | ✅ | Agent+ | List migrants (with filters, pagination) |
| POST | `/migrants` | ✅ | Agent+ | Create new migrant |
| GET | `/migrants/:id` | ✅ | Agent+ | Get single migrant |
| PUT | `/migrants/:id` | ✅ | Agent+ | Update migrant |
| GET | `/migrants/cases` | ✅ | Agent+ | Get migrant's linked cases |
| GET | `/migrants/credibility` | ✅ | Agent+ | Get refusal/credibility data |
| GET | `/migrants/credibility/insights` | ✅ | Agent+ | Get credibility pattern insights |
| GET | `/migrants/:id/travel-history` | ✅ | Agent+ | Get travel history entries |
| POST | `/migrants/archive` | ✅ | Admin+ | Archive a migrant (soft-delete) |
| POST | `/migrants/restore` | ✅ | Admin+ | Restore archived migrant |

### Cases (`/cases`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/cases` | ✅ | Agent+ | List cases (optional `?data=migrantsActive`) |
| POST | `/cases` | ✅ | Agent+ | Create new case |
| GET | `/cases/:id` | ✅ | Agent+ | Get single case |
| PUT | `/cases/:id` | ✅ | Agent+ | Update case |
| GET | `/cases/assignments` | ✅ | Admin+ | Get case assignment data |
| POST | `/cases/archive` | ✅ | Admin+ | Archive a case |
| POST | `/cases/restore` | ✅ | Admin+ | Restore archived case |
| POST | `/cases/bulk-archive` | ✅ | Admin+ | Bulk archive cases |
| GET | `/cases/bulk-archive/preview` | ✅ | Admin+ | Preview what bulk archive will affect |
| POST | `/cases/bulk-restore` | ✅ | Admin+ | Bulk restore cases |
| GET | `/cases/bulk-restore/preview` | ✅ | Admin+ | Preview what bulk restore will affect |

### Case Templates (`/case-templates`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/case-templates` | ✅ | Agent+ | List case templates |
| POST | `/case-templates` | ✅ | Admin+ | Create template |
| PUT | `/case-templates/:id` | ✅ | Admin+ | Update template |
| DELETE | `/case-templates/:id` | ✅ | Admin+ | Delete template |

### Leads (`/leads`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/leads` | ✅ | Agent+ | List leads |
| POST | `/leads` | ✅ | Agent+ | Create lead |
| PUT | `/leads/:id` | ✅ | Agent+ | Update lead |
| POST | `/leads/archive` | ✅ | Admin+ | Archive lead |
| POST | `/leads/restore` | ✅ | Admin+ | Restore lead |

### Dashboard & Statistics
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/dashboard/schedule` | ✅ | Agent+ | Schedule data |
| GET | `/dashboard/calendar` | ✅ | Agent+ | Calendar events |
| GET | `/events` | ✅ | Agent+ | Scheduler events |
| GET | `/statistics/nationalities` | ✅ | Agent+ | Nationality breakdown for charts |
| GET | `/statistics/conversion` | ✅ | Agent+ | Conversion metrics for charts |
| GET | `/statistics/reports` | ✅ | Agent+ | Report data |
| GET | `/statistics/dashboard` | ✅ | Agent+ | Dashboard summary stats |

### Tasks (`/tasks`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/tasks` | ✅ | Agent+ | List tasks |
| POST | `/tasks` | ✅ | Agent+ | Create task |
| PUT | `/tasks/:id` | ✅ | Agent+ | Update task |

### Employees (`/employees`) — Admin Only
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/employees` | ✅ | Admin+ | List employees |
| POST | `/employees` | ✅ | Admin+ | Create employee |
| PUT | `/employees/:id` | ✅ | Admin+ | Update employee |
| POST | `/employees/send-registration-link` | ✅ | Admin+ | Email registration invite |
| POST | `/employees/restore-blocked` | ✅ | Admin+ | Unblock locked-out employee |
| POST | `/employees/restore-password` | ✅ | Admin+ | Force password reset for employee |

### Files & Documents (`/files`)
| Method | Endpoint | Auth | Roles | Content-Type | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| GET | `/files` | ✅ | Agent+ | — | List files |
| GET | `/files/view/:id` | ✅ | Agent+ | — | Download/view a file (supports `?Authorization=` query param) |
| POST | `/files/create` | ✅ | Agent+ | multipart | Create file record |
| PUT | `/files/edit` | ✅ | Agent+ | multipart | Update file metadata |
| POST | `/files/archive` | ✅ | Agent+ | json | Soft-delete file |
| PUT | `/files/rename` | ✅ | Agent+ | json | Rename file |
| POST | `/files/upload` | ✅ | Agent+ | multipart | Upload generic document |
| POST | `/files/upload/custom` | ✅ | Agent+ | multipart | Upload custom file |
| POST | `/files/upload/right-to-work` | ✅ | Agent+ | multipart | Upload right-to-work document |
| POST | `/files/upload/background-check` | ✅ | Agent+ | multipart | Upload background check doc |
| GET | `/files/image/:id` | ✅ | Agent+ | — | Get photo/avatar image |
| GET | `/files/custom` | ✅ | Agent+ | — | List custom documents |
| GET | `/files/custom/view/:id` | ✅ | Agent+ | — | View custom document |
| PUT | `/files/custom/rename` | ✅ | Agent+ | json | Rename custom document |
| GET | `/files/list/employees` | ✅ | Admin+ | — | List all employee documents |

### Folders (`/folders`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/folders/system` | ✅ | Agent+ | List system folders |
| GET | `/folders/custom` | ✅ | Agent+ | List custom folders |
| PUT | `/folders/custom/rename` | ✅ | Agent+ | Rename custom folder |
| PUT | `/folders/custom/move` | ✅ | Agent+ | Move custom folder |
| GET | `/folders/archive` | ✅ | Admin+ | List archived folders |

### Search (`/search`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/search?q={query}` | ✅ | Agent+ | Global search across migrants, cases, leads |

### Logs (`/logs`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/logs` | ✅ | Admin+ | Query audit log entries |

### Init Data (`/initdata`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/initdata/:name` | ✅ | Agent+ | Load initial data by category (`start`, `admin`, etc.) |

### Geodata & Job Info
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/geodata/states` | ✅ | Agent+ | Country/state dropdown data |
| GET | `/jobinfo/jobTitles` | ✅ | Agent+ | Job title dropdown data |

### Archive Requests (`/archive-requests`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/archive-requests` | ✅ | Admin+ | List all archive requests |
| PUT | `/archive-requests/status` | ✅ | Admin+ | Update request status |
| POST | `/archive-requests/complete` | ✅ | Admin+ | Mark request as completed |
| GET | `/archive-requests/user` | ✅ | Agent+ | Get current user's archive requests |
| POST | `/archive-requests/cancel` | ✅ | Agent+ | Cancel an archive request |

### Archiving Management (`/archiving`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/archiving/settings` | ✅ | Admin+ | Get auto-archive schedule config |
| PUT | `/archiving/settings` | ✅ | Admin+ | Update auto-archive schedule |
| GET | `/archiving/log` | ✅ | Admin+ | Get archiving execution history |

### Custom Fields (`/custom-fields`)
| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| GET | `/custom-fields` | ✅ | Agent+ | List custom fields |
| GET | `/custom-fields/types` | ✅ | Agent+ | List available field types |
| POST | `/custom-fields` | ✅ | Admin+ | Create custom field |
| DELETE | `/custom-fields/delete` | ✅ | Admin+ | Delete custom field |

---

## 9. WebSocket System (Socket.IO)

### Server Configuration
- **Port:** `8082` (from `WEB_SOCKET_PORT` in `.env`)
- **Library:** Socket.IO via `@nestjs/platform-socket.io` and `@nestjs/websockets`
- **Adapter:** Custom `WebsocketIoAdapter` (in `notifications/adapters/`)

### Connection Handshake
When a client connects, the gateway:
1. Reads `client.handshake.query.token` to identify the user.
2. Looks up the user in the database using `usersService.getUserByToken(token)`.
3. Fetches the user's accessible cases via `casesService.getEditableCases(authUser)`.
4. Joins the client into rooms: `leads`, `requests`, `archiving_management`, and `cases_{id}` for each accessible case.

### WebSocket Events

| Event Name | Direction | Room | Payload | When Emitted |
| :--- | :--- | :--- | :--- | :--- |
| `caseNotifications` | Server → Client | `cases_{caseId}` | Notification array | Case is updated, assigned, or status changed |
| `leadNotifications` | Server → Client | `leads` | Notification info | Lead is created, updated, or archived |
| `requestNotifications` | Server → Client | `requests` | Notification info | Archive request is created or status changed |
| `archivingManagementNotifications` | Server → Client | `archiving_management` | Notification info | Auto-archive cron job completes or schedule changes |

### Frontend Socket.IO Connection Code
```typescript
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  transports: ["websocket"],
  query: { token: localStorage.getItem("viems.auth.token") }
});

socket.on("caseNotifications", (data) => { /* refresh case views */ });
socket.on("leadNotifications", (data) => { /* refresh lead views */ });
socket.on("requestNotifications", (data) => { /* refresh request views */ });
socket.on("archivingManagementNotifications", (data) => { /* notify admin */ });
```

---

## 10. File Storage System (S3 / MinIO)

- **Production:** AWS S3 bucket `viems-documents`.
- **Local Development:** MinIO running on `http://localhost:9000` (configure via `docker-compose` with the `.docker-compose.minio.yml` file).
- **Upload flow:** Frontend sends `multipart/form-data` → Backend receives file via Multer → Backend uploads to S3/MinIO → Stores metadata in MySQL.
- **Download flow:** Frontend requests `/files/view/{id}?Authorization=Bearer <token>` → Backend fetches file from S3 → Streams it back to the browser.

---

## 11. Email System (AWS SES)

The backend sends emails for:
- Password reset links
- Registration invite links
- OTP codes (when `OTP_LOGIN=true`)

All emails go through AWS SES using the Nodemailer transport. The "from" address is configured in `MAIL_LOGIN`.

---

## 12. Scheduled Jobs (Cron)

The `ArchivingManagementModule` uses NestJS's `@nestjs/schedule` package to run periodic archiving jobs.

- **Configuration:** Stored in the database (`archiving_schedules` table). Admin configures frequency, day, and time via `/archiving/settings`.
- **On server startup:** `main.ts` calls `restoreArchivingCronJob()` which reads the active schedule from the database and registers the cron job.
- **On schedule change:** The API endpoint updates the database record AND dynamically updates the cron job in the `SchedulerRegistry`.
- **Missed jobs:** If the server was down during a scheduled run, the startup code detects the missed execution and runs it immediately.

---

## 13. Error Messages Reference

The backend returns specific error messages in the response body. The frontend should display these directly to the user.

**Authentication errors:**
- `"The e-mail or password that you entered is incorrect. Please, try again."`
- `"The password was entered incorrectly 3 times. To restore access, please, contact your administrator/manager or try again in 15 minutes"`
- `"Account is inactive. Please, contact your Administrator/Manager."`
- `"Account with this email address does not exist. Please, check the entered e-mail."`
- `"This account wasn't activated. Please check your email."`
- `"Incorrect code. Please, check it and try again."` (OTP)
- `"All the 3 attempts were incorrect. Please, login again."` (OTP)
- `"The link has expired. Please, send your request again or contact your Administrator/Manager."`

**Business logic errors:**
- `"The chosen migrant can't be archived. Please, delete related to migrant cases first."`
- `"The chosen case can't be restored. Please, restore the migrant first."`
- `"Employee has assigned cases, can't be disabled"`
- `"You have an active request from the user to restore this data."`

**The frontend should:** Display `error.response.data.message` in a toast notification. This is exactly what the old frontend does in `getData.js`.

---

## 14. Critical Rules — What You Must Never Do

1. **Never change `JWT_SECRET`** in production. All existing user sessions will immediately break.
2. **Never change the `viems.auth.token` localStorage key.** Both old and new frontends use this key. Changing it breaks active sessions.
3. **Never send requests without the `Authorization: Bearer` header** to protected endpoints. You'll get `401`.
4. **Never assume all endpoints return JSON.** File download endpoints (`/files/view/`, `/files/image/`) stream binary data.
5. **Never skip the `Content-Type: multipart/form-data` header** for upload endpoints. The backend uses Multer which requires it.
6. **Never call admin-only endpoints as an agent.** The backend will return `403` and may log the attempt.
7. **Never modify the database schema** without creating a TypeORM migration file. Running `synchronize: true` will destroy production data.
8. **Never change backend CORS settings** during the migration. The backend already has `app.enableCors()` enabled, which allows all origins. Leave it alone.
9. **Never bypass the rate limiter** (100 req/15min per IP). If you're hitting it during development, increase `MAX_REQUESTS_NUMBER` in your local `.env` only.
10. **Never hardcode `localhost:8081`** in frontend components. Always use the `NEXT_PUBLIC_API_URL` environment variable through the Next.js rewrite proxy.
