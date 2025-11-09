import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const settingsSchema = z.object({
  frequency: z.enum(['daily', 'twice_daily', 'weekly']).default('daily'),
  hourUtc: z.number().int().min(0).max(23).default(9),
  businessHoursStart: z.number().int().min(0).max(23).default(9),
  businessHoursEnd: z.number().int().min(0).max(23).default(18),
  channels: z.array(z.enum(['email', 'sms'])).default(['email'])
})

router.get('/settings', async (_req, res) => {
  const s = await prisma.reminderSetting.findFirst()
  res.json(s)
})

router.post('/settings', async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)
  const existing = await prisma.reminderSetting.findFirst()
  const s = existing
    ? await prisma.reminderSetting.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.reminderSetting.create({ data: parsed.data })
  res.json(s)
})

router.get('/logs', async (_req, res) => {
  const logs = await prisma.reminderLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  res.json(logs)
})

export default router






