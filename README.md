<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="60" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" width="60" alt="Vite" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="60" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="60" alt="PostgreSQL" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Docker.svg" width="60" alt="Docker" />
</div>

<h1 align="center">Zoom-Out 📹</h1>

<p align="center">
  <strong>Sistema de videollamadas privadas, seguras y autogestionadas.</strong>
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#arquitectura--stack">Arquitectura</a> •
  <a href="#estructura-del-monorepo">Estructura</a> •
  <a href="#empezando">Empezando</a> •
  <a href="#flujo-de-desarrollo">Desarrollo</a>
</p>

---

## 🌟 Características

- **Videollamadas P2P/SFU:** Gestión de medios en tiempo real potenciada por **LiveKit**.
- **Seguridad y Privacidad:** Sistema completamente autogestionado (self-hosted). Tú controlas los datos y las transmisiones.
- **Transcripciones con IA:** Integración de **Faster-Whisper** para generar transcripciones automáticas de las reuniones.
- **Grabación y Almacenamiento:** Las sesiones se graban y almacenan en un clúster compatible con S3 (**MinIO**).
- **Tipado de Extremo a Extremo:** Gracias a **Eden Treaty**, el frontend y el backend comparten los mismos tipos sin necesidad de generar código intermedio.

## 🏗️ Arquitectura & Stack

El proyecto es un **monorepo** gestionado con **Bun**, diseñado para ofrecer el máximo rendimiento tanto en tiempo de ejecución como durante el desarrollo.

| Capa | Tecnología | Descripción |
| --- | --- | --- |
| **Runtime** | `Bun` | Entorno de ejecución rápido y gestor de paquetes unificado. |
| **Backend** | `ElysiaJS` | Framework web ergonómico y ultrarrápido para Bun. |
| **Frontend** | `React` + `Vite` | Interfaz de usuario dinámica y construcción veloz. |
| **Base de Datos** | `PostgreSQL` + `Drizzle` | Almacenamiento relacional tipado de manera estricta. |
| **Media (SFU)**| `LiveKit` | Infraestructura de WebRTC escalable para videollamadas. |
| **Storage** | `MinIO` | Almacenamiento de objetos compatible con Amazon S3. |
| **IA / Audio** | `Faster-Whisper` | Modelo de transcripción de audio eficiente. |

## 📂 Estructura del Monorepo

```text
zoom-out/
├── apps/
│   ├── api/                # Backend (ElysiaJS)
│   └── web/                # Frontend (React + Vite)
├── packages/
│   ├── shared-types/       # Tipos e interfaces comunes
│   ├── ui/                 # Componentes React compartidos
│   └── validators/         # Esquemas de validación (TypeBox)
├── infra/                  # Configuración de Docker Compose (LiveKit, MinIO, DB)
└── lefthook.yml            # Automatización de Git Hooks
```

## 🚀 Empezando

### 1. Prerrequisitos
Asegúrate de tener instalados:
- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) y Docker Compose
- Git

### 2. Instalación y Setup
Clona el repositorio e inicializa la infraestructura y la base de datos:

```bash
git clone https://github.com/RojasCristianE/zoom-out.git
cd zoom-out

# Instala dependencias, levanta contenedores, y aplica migraciones
bun run setup
```

### 3. Desarrollo
Para levantar todo el entorno de desarrollo (API y Web):

```bash
bun run dev
```
> **Nota:** Si Docker ya está corriendo, puedes usar `bun run dev:apps` para levantar solo los servidores de desarrollo de Bun y Vite.

## 🛠️ Flujo de Desarrollo

Mantenemos un alto estándar de calidad mediante automatizaciones estrictas gestionadas por **Lefthook**.

### Estándares de Código
- **Idioma Obligatorio:** Todos los comentarios, documentación técnica y mensajes de commit **deben estar en español**.
- **Commits:** Seguimos el estándar de *Conventional Commits* pero traducido (ej. `inicio:`, `arreglo:`, `tarea:`, `docs:`).
- **Linter & Formatter:** Utilizamos **Biome** (`bun run lint:fix` aplicará el formato correcto).

### Git Hooks Automáticos
Al realizar un commit o merge, los siguientes procesos se ejecutan en segundo plano o en paralelo:
1. **Typechecking:** Validación estricta de TypeScript.
2. **Biome Check:** Verificación de formato y linting.
3. **Engram Sync:** Respaldo y sincronización automática de la memoria contextual del Agente.
4. **Codebase Re-index:** Actualización del grafo de conocimiento en segundo plano.

### Base de Datos
Comandos útiles para la gestión de la BD con Drizzle:
- `bun run db:generate` — Genera nuevas migraciones.
- `bun run db:migrate` — Aplica las migraciones a la BD.
- `bun run db:studio` — Abre el explorador visual de Drizzle.

---
<div align="center">
  Construido por @RojasCristianE
</div>
