# Zoom-Out — Project Instructions

Este archivo proporciona el contexto técnico y operativo para trabajar en el proyecto **Zoom-Out**.

## Project Overview
**Zoom-Out** es un sistema de videollamadas privadas, seguras y autogestionadas. Está construido como un monorepo utilizando **Bun** como gestor de paquetes y runtime.

### Tech Stack Principal
- **Runtime:** Bun
- **Backend:** ElysiaJS (`apps/api`)
- **Frontend:** React + Vite (`apps/web`)
- **Base de Datos:** PostgreSQL con Drizzle ORM
- **Media:** LiveKit (SFU para videollamadas)
- **Almacenamiento:** MinIO (S3 compatible para grabaciones)
- **IA:** Faster-Whisper (Transcripción de audio)
- **Infraestructura:** Docker Compose

## Architecture & Conventions

### Sinergia de Tipos (Zero-Codegen)
El proyecto utiliza **Eden Treaty** para compartir tipos entre el backend y el frontend sin necesidad de generar código intermedio.
- El backend (`apps/api`) exporta el tipo `App` desde `src/index.ts`.
- El frontend (`apps/web`) consume este tipo en `src/api/client.ts`.
- Se utilizan esquemas de **TypeBox** definidos en `@zoom-out/validators` tanto para validación en el servidor como para tipado en el cliente.

### Estándares de Código
- **Linter/Formatter:** Biome. Siempre ejecuta `bun run lint:fix` antes de confirmar cambios.
- **TypeScript:** Configuración estricta definida en `tsconfig.base.json`.
- **Variables de Env:** Se cargan automáticamente vía `bun --env-file .env`.
- **Path Aliases (Monorepo Standard):**
  - `@api/`: `apps/api/src/`
  - `@web/`: `apps/web/src/`
  - `@db/`: `apps/api/drizzle/`
  - `@shared/`: `packages/shared-types/src/`
  - `@validators/`: `packages/validators/src/`
  - `@ui/`: `packages/ui/src/`
  - *Evita imports relativos (`../../`) y usa siempre estos aliases.*
- **Commits:** Deben ser en **español** siguiendo el estándar de Conventional Commits con tipos traducidos (`inicio`, `arreglo`, `tarea`, etc.).
- **Idioma del Proyecto:** Todos los comentarios en el código y la documentación técnica (archivos .md) deben estar estrictamente en **español**.

## Building and Running

### Setup Inicial
Para preparar el entorno por primera vez:
```bash
bun run setup
```
*Este comando copia el .env, instala dependencias, levanta la infraestructura en Docker y aplica las migraciones de la base de datos.*

### Desarrollo
Para iniciar todo el stack (infraestructura + aplicaciones):
```bash
bun run dev
```
Para iniciar solo las aplicaciones (asumiendo que Docker ya está corriendo):
```bash
bun run dev:apps
```

### Base de Datos
- **Generar migración:** `bun run db:generate`
- **Aplicar migración:** `bun run db:migrate`
- **Explorador de DB (Drizzle Studio):** `bun run db:studio`

### Calidad
- **Linting:** `bun run lint`
- **Auto-fix:** `bun run lint:fix`
- **Typecheck:** `bun run typecheck`
- **Tests:** `bun run test`

## Git Flow & Hooks
El proyecto utiliza **Lefthook** para gestionar git hooks.
- **Pre-commit:** Ejecuta `biome check` y `typecheck` en paralelo, y sincroniza las memorias de engram (`engram sync`).
- **Commit-msg:** Valida que el mensaje esté en español y siga el formato de commits convencionales.
- **Post-commit:** Re-indexa el grafo de código en segundo plano (`codebase-memory-mcp index_repository`).
- **Post-merge:** Importa memorias de engram compartidas y re-indexa el grafo de código.
- **Pre-push:** Ejecuta todos los tests (`bun run test`).

### Tipos de Commit (en español):
- `inicio`: Nuevas funcionalidades (feat).
- `arreglo`: Corrección de errores (fix).
- `mejoras`: Mejoras de rendimiento o refactorización.
- `docs`: Cambios en documentación.
- `estilo`: Cambios de formato o estilos (CSS).
- `refactor`: Refactorización de código.
- `test`: Adición o modificación de pruebas.
- `tarea`: Tareas de mantenimiento o configuración (chore).
- `infra`: Cambios en CI/CD, Docker o configuración de build.

## Project Structure
- `apps/api`: Backend ElysiaJS.
- `apps/web`: Frontend React.
- `packages/shared-types`: Tipos e interfaces comunes.
- `packages/validators`: Esquemas de validación TypeBox.
- `packages/ui`: Biblioteca de componentes React.
- `infra/`: Configuraciones de Docker, LiveKit y MinIO.

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
