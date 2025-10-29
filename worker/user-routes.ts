import { Hono, type Context } from "hono";
import type { Env as CoreEnv } from './core-utils';
import { CaseEntity, UserEntity, type DbUser } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Case } from "@shared/types";
import { jwt, sign } from 'hono/jwt';
interface Env extends CoreEnv {
  JWT_SECRET?: string;
}
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
export function userRoutes(app: Hono<{Bindings: Env;}>) {
  app.post('/api/auth/register', async (c) => {
    const { email, password } = await c.req.json<{email: string;password: string;}>();
    if (!email || !password) return bad(c, 'E-posta ve şifre gereklidir.');
    if (password.length < 6) return bad(c, 'Şifre en az 6 karakter olmalıdır.');
    const userInstance = new UserEntity(c.env, email);
    if (await userInstance.exists()) {
      return bad(c, 'Bu e-posta adresi zaten kullanılıyor.');
    }
    const passwordHash = await hashPassword(password);
    const newUser: DbUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash
    };
    await UserEntity.create(c.env, newUser);
    const payload = { id: newUser.id, email: newUser.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
    const secret = c.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    const token = await sign(payload, secret);
    return ok(c, { token, user: { id: newUser.id, email: newUser.email } });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<{email: string;password: string;}>();
    if (!email || !password) return bad(c, 'E-posta ve şifre gereklidir.');
    const userInstance = new UserEntity(c.env, email);
    if (!(await userInstance.exists())) {
      return notFound(c, 'Kullanıcı bulunamadı veya şifre yanlış.');
    }
    const user = await userInstance.getState();
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return bad(c, 'Kullanıcı bulunamadı veya şifre yanlış.');
    }
    const payload = { id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
    const secret = c.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    const token = await sign(payload, secret);
    return ok(c, { token, user: { id: user.id, email: user.email } });
  });
  app.use('/api/cases/*', async (c, next) => {
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable not set!");
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
    const auth = jwt({ secret });
    return auth(c, next);
  });
  app.get('/api/cases', async (c) => {
    const payload = c.get('jwtPayload');
    const allCases = await CaseEntity.list(c.env);
    const userCases = allCases.items.filter((item) => item.userId === payload.id);
    return ok(c, { items: userCases, next: allCases.next });
  });
  app.post('/api/cases', async (c) => {
    const payload = c.get('jwtPayload');
    const body = await c.req.json<Omit<Case, "id" | "notes" | "userId">>();
    if (!body.courtName || !body.fileNumber) {
      return bad(c, 'Gerekli alanlar eksik.');
    }
    const newCase: Case = {
      id: crypto.randomUUID(),
      userId: payload.id,
      ...body,
      notes: []
    };
    const created = await CaseEntity.create(c.env, newCase);
    return ok(c, created);
  });
  app.post('/api/cases/batch', async (c) => {
    const payload = c.get('jwtPayload');
    const body = await c.req.json<Omit<Case, "id" | "notes" | "userId">[]>();
    if (!Array.isArray(body) || body.length === 0) {
      return bad(c, 'Dava listesi boş veya geçersiz.');
    }
    const createdCases: Case[] = [];
    for (const caseData of body) {
      const newCase: Case = {
        id: crypto.randomUUID(),
        userId: payload.id,
        ...caseData,
        notes: []
      };
      const created = await CaseEntity.create(c.env, newCase);
      createdCases.push(created);
    }
    return ok(c, createdCases);
  });
  app.get('/api/cases/:id', async (c) => {
    const payload = c.get('jwtPayload');
    const { id } = c.req.param();
    const caseInstance = new CaseEntity(c.env, id);
    if (!(await caseInstance.exists())) {
      return notFound(c, 'Dava bulunamadı.');
    }
    const caseData = await caseInstance.getState();
    if (caseData.userId !== payload.id) {
      return c.json({ success: false, error: 'Yetkisiz erişim.' }, 403);
    }
    return ok(c, caseData);
  });
  app.put('/api/cases/:id', async (c) => {
    const payload = c.get('jwtPayload');
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Omit<Case, "id" | "userId">>>();
    const caseInstance = new CaseEntity(c.env, id);
    if (!(await caseInstance.exists())) {
      return notFound(c, 'Dava bulunamadı.');
    }
    const caseData = await caseInstance.getState();
    if (caseData.userId !== payload.id) {
      return c.json({ success: false, error: 'Yetkisiz erişim.' }, 403);
    }
    await caseInstance.patch(body);
    return ok(c, await caseInstance.getState());
  });
  app.delete('/api/cases/:id', async (c) => {
    const payload = c.get('jwtPayload');
    const { id } = c.req.param();
    const caseInstance = new CaseEntity(c.env, id);
    if (!(await caseInstance.exists())) {
      return notFound(c, 'Dava bulunamadı.');
    }
    const caseData = await caseInstance.getState();
    if (caseData.userId !== payload.id) {
      return c.json({ success: false, error: 'Yetkisiz erişim.' }, 403);
    }
    const deleted = await CaseEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
}