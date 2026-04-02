import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSummary = async (req: AuthRequest, res: Response) => {
  const result = await prisma.financialRecord.groupBy({
    by: ['type'],
    _sum: { amount: true },
  });

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  };

  result.forEach((group: any) => {
    if (group.type === 'INCOME') summary.totalIncome = group._sum.amount || 0;
    if (group.type === 'EXPENSE') summary.totalExpenses = group._sum.amount || 0;
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;

  res.json(summary);
};

export const getCategoryTotals = async (req: AuthRequest, res: Response) => {
  const result = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    _sum: { amount: true },
  });

  res.json(result.map((group: any) => ({
    category: group.category,
    type: group.type,
    total: group._sum.amount || 0,
  })));
};

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  const records = await prisma.financialRecord.findMany({
    orderBy: { date: 'desc' },
    take: 5,
  });
  res.json(records);
};

export const getTrends = async (req: AuthRequest, res: Response) => {
  // SQLite doesn't natively support Date formatting in GroupBy nicely via Prisma
  // We'll calculate simple monthly trends in-memory for the last year.
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const records = await prisma.financialRecord.findMany({
    where: { date: { gte: oneYearAgo } },
    select: { amount: true, type: true, date: true }
  });

  const trends: any = {};

  records.forEach((record: any) => {
    // Format: YYYY-MM
    const month = record.date.toISOString().slice(0, 7);
    if (!trends[month]) {
      trends[month] = { INCOME: 0, EXPENSE: 0 };
    }
    trends[month][record.type] += record.amount;
  });

  res.json(trends);
};
