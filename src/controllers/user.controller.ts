import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).default('VIEWER'),
});

const updateUserSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, status: true, createdAt: true },
  });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role } = createUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role, status: 'ACTIVE' },
    select: { id: true, email: true, role: true, status: true },
  });

  res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateUserSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, status: true },
  });

  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
};
