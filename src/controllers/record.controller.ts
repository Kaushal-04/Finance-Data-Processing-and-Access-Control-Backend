import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const recordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  date: z.coerce.date(),
  description: z.string().optional(),
});

export const getRecords = async (req: AuthRequest, res: Response) => {
  const { type, category, startDate, endDate, take = 10, skip = 0 } = req.query;

  const filters: any = {};
  if (type) filters.type = type as string;
  if (category) filters.category = category as string;
  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.gte = new Date(startDate as string);
    if (endDate) filters.date.lte = new Date(endDate as string);
  }

  const records = await prisma.financialRecord.findMany({
    where: filters,
    orderBy: { date: 'desc' },
    take: Number(take),
    skip: Number(skip),
  });

  res.json(records);
};

export const getRecordById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const record = await prisma.financialRecord.findUnique({ where: { id } });
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
};

export const createRecord = async (req: AuthRequest, res: Response) => {
  const data = recordSchema.parse(req.body);

  const record = await prisma.financialRecord.create({
    data: {
      ...data,
      createdBy: { connect: { id: req.user!.id } }
    },
  });

  res.status(201).json(record);
};

export const updateRecord = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const data = recordSchema.partial().parse(req.body);

  try {
    const record = await prisma.financialRecord.update({
      where: { id },
      data,
    });
    res.json(record);
  } catch (err) {
    res.status(404).json({ error: 'Record not found' });
  }
};

export const deleteRecord = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.financialRecord.delete({ where: { id } });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(404).json({ error: 'Record not found' });
  }
};
