import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const createFlatSchema = z.object({
	number: z.string().min(1),
	floor: z.number().int().optional(),
	sizeSqft: z.number().int().positive().optional(),
	maintenanceBasis: z.enum(['per_sqft', 'fixed']).default('per_sqft').optional(),
	fixedMonthlyDue: z.number().positive().optional(),
	carryForward: z.number().optional()
})

router.get('/', async (_req, res) => {
	const flats = await prisma.flat.findMany({ orderBy: { number: 'asc' } })
	res.json(flats)
})

router.post('/', async (req, res) => {
	const parsed = createFlatSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json(parsed.error)
	const flat = await prisma.flat.create({ data: parsed.data as any })
	res.status(201).json(flat)
})

export default router



