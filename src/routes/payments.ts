import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const createPaymentSchema = z.object({
  flatId: z.number().int(),
  flatmateId: z.number().int().optional(),
  cycleId: z.number().int(),
  amount: z.number().positive(),
  lateFee: z.number().min(0).optional(),
  lateFeeWaived: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  paidAt: z.string().optional(),
  method: z.enum(['cash', 'bank_transfer', 'upi', 'card']).default('bank_transfer'),
  reference: z.string().optional(),
  status: z.enum(['success', 'failed', 'pending']).default('success'),
})

router.get('/', async (_req, res) => {
  const payments = await prisma.payment.findMany({ include: { flat: true, flatmate: true, cycle: true }, orderBy: { paidAt: 'desc' } })
  res.json(payments)
})

router.post('/', async (req, res) => {
  const parsed = createPaymentSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)
  
  // Convert paidAt string to DateTime if provided, otherwise use current time
  const data = {
    ...parsed.data,
    paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date()
  }
  
  const payment = await prisma.payment.create({ data })
  res.status(201).json(payment)
})

export default router






