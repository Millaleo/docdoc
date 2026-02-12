import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';

export const signAccessToken = (sub: string, role: Role, email: string) =>
  jwt.sign({ sub, role, email }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });

export const signRefreshToken = (sub: string) =>
  jwt.sign({ sub, kind: 'refresh' }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });
