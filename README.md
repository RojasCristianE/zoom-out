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
- [mkcert](https://github.com/FiloSottile/mkcert) — solo para entrar desde otros dispositivos por HTTPS
- Git

### 2. Primera vez (inicialización)
Clona el repositorio e inicializa todo: crea el `.env`, instala dependencias, levanta la infraestructura, aplica migraciones y prepara el acceso desde la red local.

```bash
git clone https://github.com/RojasCristianE/zoom-out.git
cd zoom-out

# 1. .env + dependencias + contenedores (Postgres, Redis, LiveKit, Egress, MinIO, Caddy, Whisper) + migraciones
bun run setup

# 2. Usuario administrador (admin@zoomout.local / admin123)
bun run db:seed

# 3. IP del host en la LAN, node_ip de LiveKit y certificados TLS
bun run setup:lan
```

> **Nota:** la primera corrida descarga ~2 GB de imágenes Docker (Whisper es la más pesada).

**Verificación:**

```bash
docker compose -f infra/docker-compose.yml --env-file .env ps   # 8 servicios "Up"
curl -s localhost:3000/api/health                               # {"status":"ok",...}
grep node_ip infra/livekit/livekit.yaml                         # tu IP real de la LAN
```

### 3. Rutina diaria
Con la máquina ya inicializada, solo hay que levantar infraestructura y apps:

```bash
# Infraestructura + API + Web
bun run dev -- --no-camera

# Si Docker ya está corriendo (por ejemplo tras reiniciar), solo las apps
bun run dev:apps
```

> **Nota:** `bun run dev` a secas exige la cámara Android de desarrollo (v4l2loopback + adb + scrcpy). Con `--no-camera` se saltea ese paso.

```bash
bun run infra:logs   # Logs de los contenedores
bun run db:studio    # Explorador visual de la BD
bun run infra:down   # Apagar (los datos persisten en los volúmenes pg_data y minio_data)
```

`bun run setup` es idempotente: no sobrescribe el `.env`, no reaplica migraciones y solo levanta lo que falta.

### 4. Acceso desde otros dispositivos (red local)

| Servicio | URL |
| --- | --- |
| Web | `https://<IP>` |
| LiveKit (señalización) | `wss://<IP>:7443` |
| MinIO Console | `http://<IP>:9001` |

- Instalar `infra/certs/rootCA.pem` como CA en el dispositivo (Android):
  ```bash
  adb push infra/certs/rootCA.pem /sdcard/rootCA.pem
  ```
- Abrir en el firewall: `443` y `7443` (TCP) + `50000-50060` (UDP, medios ICE).
- `scripts/setup-lan.sh` renderiza `infra/livekit/{livekit,egress}.yaml` desde sus plantillas usando `HOST_IP`; esos archivos son generados y no se versionan.
- Si la IP detectada es la de una interfaz virtual (VPN, docker0), forzala:

  ```bash
  HOST_IP=192.168.x.x bun run setup:lan
  ```

- Volvé a correr `bun run setup:lan` cuando cambie la IP del host.

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
- `bun run db:seed` — Crea el usuario administrador inicial.
- `bun run db:studio` — Abre el explorador visual de Drizzle.

---
<div align="center">
  Construido por @RojasCristianE
</div>
