import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma'
import flatsRouter from './routes/flats'
import flatmatesRouter from './routes/flatmates'
import cyclesRouter from './routes/cycles'
import paymentsRouter from './routes/payments'
import remindersRouter from './routes/reminders'
import importRouter from './routes/import'
import defaultersRouter from './routes/defaulters'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) })
  }
})

app.use('/api/flats', flatsRouter)
app.use('/api/flatmates', flatmatesRouter)
app.use('/api/cycles', cyclesRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/reminders', remindersRouter)
app.use('/api/import', importRouter)
app.use('/api/defaulters', defaultersRouter)

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`)
})



