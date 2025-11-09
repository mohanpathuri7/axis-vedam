import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

const router = Router()

const createCycleSchema = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  dueAmount: z.number().positive(),
  dueDate: z.string().optional(),
  lateFeePercent: z.number().min(0).max(100).optional(),
  gracePeriodDays: z.number().int().min(0).optional(),
})

router.get('/', async (_req, res) => {
  const cycles = await prisma.maintenanceCycle.findMany({ orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  res.json(cycles)
})

router.post('/', async (req, res) => {
  const parsed = createCycleSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)
  
  // Convert dueDate string to DateTime if provided
  const data = {
    ...parsed.data,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined
  }
  
  const cycle = await prisma.maintenanceCycle.create({ data })
  res.status(201).json(cycle)
})

router.post('/:id/generate-ledgers', async (req, res) => {
  const id = Number(req.params.id)
  const cycle = await prisma.maintenanceCycle.findUnique({ where: { id } })
  if (!cycle) return res.status(404).json({ error: 'cycle not found' })

  const flats = await prisma.flat.findMany()

  const ratePerSqft = 3.75

  const ops = flats.map(async flat => {
    const opening = flat.carryForward ?? new Prisma.Decimal(0)
    const monthlyCharge = flat.maintenanceBasis === 'fixed' && flat.fixedMonthlyDue
      ? flat.fixedMonthlyDue
      : new Prisma.Decimal((flat.sizeSqft ?? 0) * ratePerSqft)

    const paymentsAgg = await prisma.payment.aggregate({
      where: { flatId: flat.id, cycleId: id, status: 'success' },
      _sum: { amount: true }
    })
    const payments = paymentsAgg._sum.amount ?? new Prisma.Decimal(0)

    const closing = opening.plus(monthlyCharge).minus(payments)

    return prisma.ledger.upsert({
      where: { flatId_cycleId: { flatId: flat.id, cycleId: id } },
      update: {
        openingBalance: opening,
        monthlyCharge,
        paymentsTotal: payments,
        closingBalance: closing
      },
      create: {
        flatId: flat.id,
        cycleId: id,
        openingBalance: opening,
        monthlyCharge,
        paymentsTotal: payments,
        closingBalance: closing
      }
    })
  })

  const ledgers = await Promise.all(ops)
  res.json(ledgers)
})

export default router



