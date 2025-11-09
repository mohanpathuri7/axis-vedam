import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

const router = Router()

// Calculate days overdue considering grace period
function getDaysOverdue(dueDate: Date, gracePeriodDays: number): number {
  const now = new Date()
  const graceEndDate = new Date(dueDate)
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays)
  
  if (now <= graceEndDate) {
    return 0 // Still in grace period
  }
  
  const diffTime = now.getTime() - graceEndDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Calculate late fee (3% one-time)
function calculateLateFee(
  maintenanceAmount: number, 
  lateFeePercent: number, 
  daysOverdue: number
): number {
  if (daysOverdue <= 0) return 0
  return Math.round(maintenanceAmount * (lateFeePercent / 100) * 100) / 100
}

// Get defaulters for a specific cycle
router.get('/:cycleId', async (req, res) => {
  try {
    const cycleId = Number(req.params.cycleId)
    
    // Get cycle details
    const cycle = await prisma.maintenanceCycle.findUnique({
      where: { id: cycleId },
      include: {
        payments: {
          include: {
            flat: {
              include: {
                flatmates: {
                  where: { isActive: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    })
    
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' })
    }
    
    // Get all flats
    const allFlats = await prisma.flat.findMany({
      include: {
        flatmates: {
          where: { isActive: true },
          take: 1
        }
      }
    })
    
    // Calculate defaulters
    const defaulters = []
    let totalPendingAmount = 0
    let totalLateFees = 0
    
    // Get days overdue
    const daysOverdue = cycle.dueDate 
      ? getDaysOverdue(new Date(cycle.dueDate), cycle.gracePeriodDays)
      : 0
    
    for (const flat of allFlats) {
      // Calculate expected amount
      const ratePerSqft = parseFloat(cycle.dueAmount.toString())
      const maintenanceAmount = (flat.sizeSqft || 0) * ratePerSqft
      
      // Check if flat has paid
      const payment = cycle.payments.find(p => p.flatId === flat.id && p.status === 'success')
      
      if (!payment) {
        // This is a defaulter
        const lateFee = calculateLateFee(maintenanceAmount, parseFloat(cycle.lateFeePercent.toString()), daysOverdue)
        const totalDue = maintenanceAmount + lateFee
        
        // Get last reminder sent
        const lastReminder = await prisma.cycleReminder.findFirst({
          where: { cycleId, flatId: flat.id },
          orderBy: { sentAt: 'desc' }
        })
        
        const owner = flat.flatmates[0]
        
        defaulters.push({
          flatId: flat.id,
          flatNumber: flat.number,
          bhk: flat.bhk,
          sizeSqft: flat.sizeSqft,
          ownerName: owner?.fullName || 'N/A',
          email: owner?.email || '',
          phone: owner?.phone || '',
          maintenanceAmount: Math.round(maintenanceAmount * 100) / 100,
          lateFee: Math.round(lateFee * 100) / 100,
          totalDue: Math.round(totalDue * 100) / 100,
          daysOverdue,
          lastReminderSent: lastReminder?.sentAt || null,
          lastReminderChannel: lastReminder?.channel || null
        })
        
        totalPendingAmount += maintenanceAmount
        totalLateFees += lateFee
      }
    }
    
    res.json({
      cycle: {
        id: cycle.id,
        year: cycle.year,
        month: cycle.month,
        dueDate: cycle.dueDate,
        lateFeePercent: cycle.lateFeePercent,
        gracePeriodDays: cycle.gracePeriodDays,
        status: cycle.status
      },
      defaulters,
      summary: {
        totalFlats: allFlats.length,
        totalPaid: allFlats.length - defaulters.length,
        totalDefaulters: defaulters.length,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        totalLateFees: Math.round(totalLateFees * 100) / 100,
        totalDue: Math.round((totalPendingAmount + totalLateFees) * 100) / 100,
        daysOverdue,
        collectionRate: Math.round(((allFlats.length - defaulters.length) / allFlats.length) * 10000) / 100
      }
    })
  } catch (error) {
    console.error('Get defaulters error:', error)
    res.status(500).json({ error: 'Failed to fetch defaulters' })
  }
})

// Send reminders to defaulters
router.post('/:cycleId/send-reminders', async (req, res) => {
  try {
    const cycleId = Number(req.params.cycleId)
    const { flatIds, channels, customMessage } = req.body
    
    const cycle = await prisma.maintenanceCycle.findUnique({
      where: { id: cycleId }
    })
    
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' })
    }
    
    // Get flats to send reminders to
    const flatsToRemind = flatIds === 'all' 
      ? await prisma.flat.findMany({ include: { flatmates: { where: { isActive: true } } } })
      : await prisma.flat.findMany({ 
          where: { id: { in: flatIds } },
          include: { flatmates: { where: { isActive: true } } }
        })
    
    const reminders = []
    
    for (const flat of flatsToRemind) {
      for (const channel of channels || ['email']) {
        // Create reminder record
        const reminder = await prisma.cycleReminder.create({
          data: {
            cycleId,
            flatId: flat.id,
            channel,
            message: customMessage || `Payment reminder for ${cycle.month}/${cycle.year}`,
            status: 'sent'
          }
        })
        
        reminders.push(reminder)
        
        // TODO: Implement actual email/WhatsApp sending
        // await sendEmail(flat.flatmates[0]?.email, message)
        // await sendWhatsApp(flat.flatmates[0]?.phone, message)
      }
    }
    
    res.json({
      success: true,
      remindersSent: reminders.length,
      reminders
    })
  } catch (error) {
    console.error('Send reminders error:', error)
    res.status(500).json({ error: 'Failed to send reminders' })
  }
})

// Update cycle late fee settings
router.patch('/:cycleId/late-fee', async (req, res) => {
  try {
    const cycleId = Number(req.params.cycleId)
    const { lateFeePercent } = req.body
    
    const cycle = await prisma.maintenanceCycle.update({
      where: { id: cycleId },
      data: { lateFeePercent: new Prisma.Decimal(lateFeePercent) }
    })
    
    res.json(cycle)
  } catch (error) {
    console.error('Update late fee error:', error)
    res.status(500).json({ error: 'Failed to update late fee' })
  }
})

export default router
