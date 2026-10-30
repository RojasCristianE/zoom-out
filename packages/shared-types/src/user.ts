// ──────────────────────────────────────────────
// User & Role Types
// ──────────────────────────────────────────────

import type { RolUsuario } from './judicial';

export type UserRole = RolUsuario | 'host' | 'viewer'; // Compatibilidad transicional

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: RolUsuario;
  organoJudicialId?: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  role: RolUsuario;
  organoJudicialId?: string | null;
  iat: number;
  exp: number;
}
