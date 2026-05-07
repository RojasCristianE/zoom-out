import { Elysia } from 'elysia'

type UserRole = 'admin' | 'user'

export const requireRole = (...allowedRoles: UserRole[]) => (app: Elysia) => 
  app.derive(async () => {
    return { user: { role: 'admin' as UserRole, sub: '123' } }
  })
  .onBeforeHandle(({ user }) => {
     if (allowedRoles.indexOf(user.role) === -1) return "error"
  })

const app = new Elysia()
  .use(requireRole('admin'))
  .get('/', ({ user }) => user.sub)
