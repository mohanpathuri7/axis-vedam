import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const createFlatmateSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  flatId: z.number().int(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  isActive: z.boolean().default(true),
})

router.get('/', async (_req, res) => {
  const people = await prisma.flatmate.findMany({ include: { flat: true } })
  res.json(people)
})

router.post('/', async (req, res) => {
  const parsed = createFlatmateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)
  const fm = await prisma.flatmate.create({ data: parsed.data })
  res.status(201).json(fm)
})

export default router






